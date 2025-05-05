import { SuiSignAndExecuteTransactionOutput } from '@mysten/wallet-standard';
import { SuiTransactionBlockResponse, SuiObjectChangeCreated, SuiObjectChange, SuiClient, SuiTransactionBlockResponseOptions } from '@mysten/sui/client';
import { useState } from 'react';
import { useSignAndExecuteTransaction, useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions'; // Import Transaction
import {
    CONTRACT_PACKAGE_VARIABLE_NAME,
    EXPLORER_URL_VARIABLE_NAME,
    CONTRACT_PACKAGE_ID_NOT_DEFINED,
} from '~~/config/network';
import {
  prepareCreateGameTransaction,
  prepareAssociateBlobTransaction
} from '../helpers/gameTransactions';
import { encryptAndUploadToWalrus } from '../helpers/walrusHelper';
import { transactionUrl } from '../../helpers/network';
import { notification } from '../../helpers/notification';
import useNetworkConfig from '../../hooks/useNetworkConfig';
import toast from 'react-hot-toast';
import { HARDCODED_DASHBOARD_ID } from '~~/dapp/config/network';
import type {
    CreateGameMetadataArgs,
    CreateGameMetadataResult,
    CreateMetadataProgress,
    UploadAndAssociateArgs,
    UploadAssociateProgress
} from '~~/dapp/types/game.types';

// Add other game mutation hooks here later (e.g., usePurchaseGameMutation) 

// --- Helper Function (can be moved to utils/helpers) ---
const getSingleCreatedObjectByType = (changes: SuiObjectChange[] | undefined | null, typePrefix: string): SuiObjectChangeCreated | null => {
    if (!changes) return null;
    const created = changes.filter(
        (change): change is SuiObjectChangeCreated => change.type === 'created'
    );
    // Allow exact match or generic match (e.g. Policy<...>) 
    return created.find(obj => obj.objectType === typePrefix || obj.objectType.startsWith(typePrefix + '<')) || null;
}

// --- Hook for Creating Game Metadata --- 

export const useCreateGameMetadataMutation = (options?: {
  onSuccess?: (data: CreateGameMetadataResult) => void
}) => {
  const { useNetworkVariable } = useNetworkConfig();
  const explorerUrl = useNetworkVariable(EXPLORER_URL_VARIABLE_NAME);
  const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME);
  const dashboardId = HARDCODED_DASHBOARD_ID;
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction<SuiTransactionBlockResponse>({
      execute: async ({ bytes, signature }) => {
          return await client.executeTransactionBlock({
              transactionBlock: bytes,
              signature,
              options: {
                  showRawEffects: true,
                  showEffects: true,
                  showObjectChanges: true,
              },
          });
      }
  });

  const [progress, setProgress] = useState<CreateMetadataProgress>({ step: 'idle', isLoading: false });

  const createGameMetadata = async (args: CreateGameMetadataArgs) => {
    if (!currentAccount?.address) {
      notification.error(null, 'Please connect your wallet first');
      setProgress({ step: 'error', error: 'Wallet not connected', isLoading: false });
      return;
    }
    if (packageId === CONTRACT_PACKAGE_ID_NOT_DEFINED) {
      notification.error(null, 'Contract Package ID is not defined in config');
       setProgress({ step: 'error', error: 'Package ID not defined', isLoading: false });
      return;
    }
    if (!dashboardId) {
      notification.error(null, 'Hardcoded Dashboard Object ID is missing.');
      setProgress({ step: 'error', error: 'Hardcoded Dashboard ID missing', isLoading: false });
      return;
    }

    setProgress({ step: 'preparing', isLoading: true, message: 'Preparing transaction...' });
    let notificationId: string | undefined;

    try {
      const tx = prepareCreateGameTransaction(
        args.name,
        args.genre,
        args.platform,
        args.price,
        args.description,
        packageId,
        dashboardId
      );

      setProgress({ step: 'signing', isLoading: true, message: 'Please approve the transaction...'});
      notificationId = notification.txLoading();

      const result = await new Promise<SuiTransactionBlockResponse>((resolve, reject) => {
          signAndExecute(
              { transaction: tx }, 
              { onSuccess: resolve, onError: reject } 
          );
      });

      setProgress({ step: 'parsing', isLoading: true, message: 'Processing results...' });

      if (result.effects?.status.status !== 'success') {
        throw new Error(`Transaction execution failed: ${result.effects?.status.error || 'Unknown error'}`);
      }
      notification.txSuccess(transactionUrl(explorerUrl, result.digest), notificationId);
      notificationId = undefined;

      const gameType = `${packageId}::game::Game`;
      const adminCapType = `${packageId}::game::AdminCap`;
      
      const createdGame = getSingleCreatedObjectByType(result.objectChanges, gameType);
      const createdAdminCap = getSingleCreatedObjectByType(result.objectChanges, adminCapType);

      if (!createdGame || !createdAdminCap) {
          console.error("Create Game & Register ObjectChanges:", result.objectChanges);
          throw new Error(`Could not find created Game or AdminCap object. Check type definitions.`);
      }

      const resultData: CreateGameMetadataResult = {
          gameId: createdGame.objectId,
          adminCapId: createdAdminCap.objectId,
          digest: result.digest,
      };

      console.log("Game Creation & Registration Success (Game + AdminCap IDs):", resultData);
      setProgress({ step: 'success', isLoading: false, message: 'Game created and registered successfully!'});
      options?.onSuccess?.(resultData);

    } catch (error) {
        console.error('Error during game creation & registration:', error);
        setProgress({ step: 'error', isLoading: false, error: (error as Error).message || 'An unknown error occurred' });
        if (notificationId) { toast.dismiss(notificationId); }
        notification.error(error as Error, 'Failed to create & register game');
    }
  };

  const isLoading = progress.isLoading || isPending;

  return { createGameMetadata, isLoading, progress };
};


// --- Hook for Uploading and Associating Game File ---

export const useUploadAndAssociateGameFileMutation = (options?: {
    onSuccess?: (data: SuiSignAndExecuteTransactionOutput) => void;
}) => {
    const { useNetworkVariable } = useNetworkConfig();
    const explorerUrl = useNetworkVariable(EXPLORER_URL_VARIABLE_NAME);
    const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME);
    const client = useSuiClient();
    const currentAccount = useCurrentAccount();
    
    const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();

    const [progress, setProgress] = useState<UploadAssociateProgress>({ step: 'idle', isLoading: false });

    const uploadAndAssociate = async (args: UploadAndAssociateArgs) => {
        if (!currentAccount?.address) {
          notification.error(null, 'Please connect your wallet first');
          setProgress({ step: 'error', error: 'Wallet not connected', isLoading: false });
          return;
        }
        if (packageId === CONTRACT_PACKAGE_ID_NOT_DEFINED) {
            notification.error(null, 'Contract Package ID is not defined');
            setProgress({ step: 'error', error: 'Package ID not defined', isLoading: false });
            return;
        }
        if (!args.gameId || !args.adminCapId) {
             notification.error(null, 'Missing required Game or AdminCap ID');
             setProgress({ step: 'error', error: 'Missing required IDs', isLoading: false });
             return;
        }

        setProgress({ step: 'idle', isLoading: true });
        let notificationId: string | undefined;
        let encryptedBlobId: string | null = null;

        try {
            // --- Step 1: Encrypt and Upload --- 
            setProgress({ step: 'encrypting_uploading', isLoading: true, message: 'Encrypting and uploading game file...' });

            encryptedBlobId = await encryptAndUploadToWalrus(args.game_file, {
                ownerAddress: currentAccount!.address,
                signAndExecuteTransaction: signAndExecute, 
                waitForTransaction: (input) => client.waitForTransaction(input),
                onProgress: (step: string, message?: string) => {
                    console.log(`Encrypt/Upload Progress: ${step}`, message);
                    setProgress(prev => ({ ...prev, step: 'encrypting_uploading', subStep: step, subStepMessage: message, isLoading: true }));
                },
                onError: (step: string, error: Error) => {
                    throw new Error(`Error during encryption/upload at step ${step}: ${error.message}`);
                },
                policyObject: args.gameId,
                sealPackageId: packageId,
            });

            console.log("Encrypted Blob ID from Walrus:", encryptedBlobId);
            setProgress({ step: 'encrypting_uploading', isLoading: true, message: 'File upload complete. Preparing final transaction...' });

             // --- Step 2: Associate Blob --- 
             setProgress({ step: 'preparing_association', isLoading: true, message: 'Preparing association transaction...'});
             notificationId = notification.txLoading();

            const associateTx = prepareAssociateBlobTransaction(
                args.gameId,
                args.adminCapId,
                encryptedBlobId,
                packageId
            );

            setProgress({ step: 'signing_association', isLoading: true, message: 'Please approve the file association transaction...'});

            const associateResult = await new Promise<SuiSignAndExecuteTransactionOutput>((resolve, reject) => {
                signAndExecute(
                    { transaction: associateTx },
                    { onSuccess: resolve, onError: reject }
                );
            });

            if (!associateResult.digest) { 
                throw new Error(`Associate blob transaction may have failed: Missing digest.`);
            }

            setProgress({ step: 'success', isLoading: false, message: 'Game file uploaded and associated successfully!' });
            notification.txSuccess(transactionUrl(explorerUrl, associateResult.digest), notificationId);
            notificationId = undefined;

            options?.onSuccess?.(associateResult);

        } catch (error) {
             console.error('Error during game file upload/association:', error);
            const errorStep = progress.step !== 'idle' && progress.step !== 'success' ? progress.step : 'error';
            setProgress({ step: 'error', isLoading: false, error: (error as Error).message || 'An unknown error occurred' });
            if (notificationId) { toast.dismiss(notificationId); }
            notification.error(error as Error, 'Failed to upload/associate game file');
        } finally {
             if (progress.step !== 'success' && progress.step !== 'error') {
                 setProgress(prev => ({ ...prev, isLoading: false }));
             }
        }
    };

    const isLoading = progress.isLoading || isPending;

    return { uploadAndAssociate, isLoading, progress };
};


// --- REMOVED OLD COMBINED HOOK --- 
// export const useCreateGameMutation = (...) => { ... complex logic ... } 