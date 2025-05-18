import { useSignTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils';
import { GAME_MODULE_NAME } from '../config/network';
import { CONTRACT_PACKAGE_VARIABLE_NAME } from '~~/config/network';
import useNetworkConfig from '~~/hooks/useNetworkConfig';
import { toast } from 'react-hot-toast';
import type { SuiTransactionBlockResponse } from '@mysten/sui/client';
import { bcs } from '@mysten/sui/bcs';
import { useMutation } from '@tanstack/react-query';

interface UseCreateGuideMutationProps {
  onSuccess?: (result: SuiTransactionBlockResponse) => void;
  onError?: (error: Error) => void;
}

// Define GuideType codes (matching backend expectations if possible, or just using default)
// Example: 0 = Walkthrough, 1 = Tips, 2 = Lore, etc. We'll use 0 for now.
const DEFAULT_GUIDE_TYPE_CODE = 0;

export function useCreateGuideMutation({ onSuccess, onError }: UseCreateGuideMutationProps = {}) {
  const { mutate: signTransaction } = useSignTransaction();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const networkConfig = useNetworkConfig();
  const useNetworkVariable = networkConfig.useNetworkVariable;
  const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME);

  const createGuide = (gameId: string, title: string, content: string, guideTypeCode: number = DEFAULT_GUIDE_TYPE_CODE) => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first.');
      return;
    }
    if (!title.trim() || !content.trim()) {
        toast.error('Guide title and content cannot be empty.');
        return;
    }
    if (!packageId || packageId === '0xNOTDEFINED') { 
        toast.error('Contract Package ID is not configured for the current network.');
        console.error('Package ID not found for current network. Check .env files and network config.');
        return;
    }

    const txb = new Transaction();

    txb.moveCall({
      target: `${packageId}::${GAME_MODULE_NAME}::create_guide_for_game`,
      arguments: [
        txb.object(gameId),
        txb.pure.address(currentAccount.address),
        txb.pure(bcs.String.serialize(title)),
        txb.pure(bcs.String.serialize(content)),
        txb.pure.u8(guideTypeCode),
        txb.object(SUI_CLOCK_OBJECT_ID),
      ],
    });

    signTransaction(
      {
        transaction: txb,
      },
      {
        onSuccess: (result) => {
          console.log('Guide transaction signed, executing...', result);
          suiClient.executeTransactionBlock({
              transactionBlock: result.bytes,
              signature: result.signature,
              options: { showEffects: true }
            }).then((execResult: SuiTransactionBlockResponse) => {
                console.log('Create guide transaction successful:', execResult);
                toast.success('Guide submitted successfully!');
                onSuccess?.(execResult);
            }).catch((error: Error) => {
                console.error('Create guide transaction execution failed:', error);
                toast.error(`Failed to submit guide: ${error.message}`);
                onError?.(error);
            });
        },
        onError: (error: Error) => {
          console.error('Create guide transaction signing failed:', error);
          toast.error(`Failed to sign transaction: ${error.message}`);
          onError?.(error);
        },
      }
    );
  };

  // Loading state management would need to be added manually if required
  return { createGuide };
}

interface CreateGuideParams {
  gameId: string;
  title: string;
  content: string;
  // Add guideType? For now, hardcode in hook
}

export function useGuideMutations() {
  const { mutate: signTransaction } = useSignTransaction();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const networkConfig = useNetworkConfig();
  const useNetworkVariable = networkConfig.useNetworkVariable;
  const gamePackageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME);

  const buildCreateGuideTransaction = (
    params: CreateGuideParams
  ): Transaction => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }
    if (!gamePackageId || gamePackageId === '0xNOTDEFINED') {
      throw new Error('Game package ID not found for the current network');
    }

    const txb = new Transaction();
    
    const guideType = 0;

    txb.moveCall({
      target: `${gamePackageId}::game::create_guide_for_game`,
      arguments: [
        txb.object(params.gameId),
        txb.pure(bcs.String.serialize(params.title)),
        txb.pure(bcs.String.serialize(params.content)),
        txb.pure.u8(guideType),
        txb.object(SUI_CLOCK_OBJECT_ID),
      ],
    });
    return txb;
  };

  const createGuideMutation = useMutation({
    mutationFn: async (params: CreateGuideParams) => {
      if (!currentAccount) {
        throw new Error('Wallet not connected');
      }
      const txb = buildCreateGuideTransaction(params);

      return new Promise<SuiTransactionBlockResponse>((resolve, reject) => {
        signTransaction(
          {
            transaction: txb,
            chain: currentAccount.chains[0] as any,
          },
          {
            onSuccess: (result) => {
              console.log('Guide transaction signed successfully, now executing...', result);
              suiClient.executeTransactionBlock({
                transactionBlock: result.bytes,
                signature: result.signature,
                options: { showEffects: true, showObjectChanges: true }
              }).then(execResult => {
                  console.log('Guide transaction executed:', execResult);
                  if (execResult.effects?.status.status === 'success') {
                      console.log('Guide transaction execution successful.');
                      toast.success('Guide submitted successfully!');
                      resolve(execResult);
                  } else {
                      const errorMsg = execResult.effects?.status.error || 'Transaction execution failed with unknown error';
                      console.error('Guide transaction execution failed:', errorMsg, execResult);
                      toast.error(`Failed to submit guide: ${errorMsg}`);
                      reject(new Error(errorMsg));
                  }
              }).catch(error => {
                  console.error('Guide transaction execution failed (network/RPC error):', error);
                  const errorMessage = error instanceof Error ? error.message : 'Unknown execution error';
                  toast.error(`Failed to submit guide: ${errorMessage}`);
                  reject(error);
              });
            },
            onError: (error) => {
              console.error('Create guide transaction signing failed:', error);
              const errorMessage = error instanceof Error ? error.message : 'Unknown signing error';
              toast.error(`Signing failed: ${errorMessage}`);
              reject(error);
            },
          }
        );
      });
    },
    onSuccess: (data: SuiTransactionBlockResponse) => {
      console.log('React Query useMutation hook onSuccess (execution succeeded):', data);
    },
    onError: (error: Error) => {
      console.error('React Query useMutation hook onError (execution or signing failed):', error);
    },
  });

  return {
    createGuide: createGuideMutation.mutate,
    createGuideAsync: createGuideMutation.mutateAsync,
    isPending: createGuideMutation.isPending,
    error: createGuideMutation.error,
  };
} 