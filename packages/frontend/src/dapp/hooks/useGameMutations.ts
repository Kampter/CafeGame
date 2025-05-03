import { SuiSignAndExecuteTransactionOutput } from '@mysten/wallet-standard';
import { useState } from 'react';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import {
    CONTRACT_PACKAGE_VARIABLE_NAME,
    EXPLORER_URL_VARIABLE_NAME,
    CONTRACT_PACKAGE_ID_NOT_DEFINED
} from '~~/config/network';
import {
  prepareCreateGameTransaction,
  // Import other transaction helpers later...
} from '~~/dapp/helpers/gameTransactions';
// Removed getCreatedObjectIdFromResponse as it might not exist
import { transactionUrl } from '~~/helpers/network'; 
import { notification } from '~~/helpers/notification';
import useNetworkConfig from '~~/hooks/useNetworkConfig';

/**
 * Hook for the create_game transaction.
 */
export const useCreateGameMutation = (options?: {
  // Include gameId in onSuccess as the function returns it
  onSuccess?: (data: SuiSignAndExecuteTransactionOutput, createdGameId?: string) => void
}) => {
  const [notificationId, setNotificationId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const { useNetworkVariable } = useNetworkConfig();
  const explorerUrl = useNetworkVariable(EXPLORER_URL_VARIABLE_NAME);
  const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME);

  const { mutate } = useSignAndExecuteTransaction();

  const createGame = (
    nameArg: string,
    genreArg: string,
    platformArg: string,
    priceArg: string,
    descriptionArg: string,
    blobIdArg: string
  ) => {
    if (packageId === CONTRACT_PACKAGE_ID_NOT_DEFINED) {
      notification.error(null, 'Contract Package ID is not defined in config');
      return;
    }

    const tx = prepareCreateGameTransaction(
        packageId,
        nameArg,
        genreArg,
        platformArg,
        priceArg,
        descriptionArg,
        blobIdArg
    );

    const nId = notification.txLoading();
    setNotificationId(nId);
    setIsLoading(true);

    mutate(
      {
        transaction: tx,
      },
      {
        onSuccess: (data) => {
          setIsLoading(false);
          notification.txSuccess(
            transactionUrl(explorerUrl, data.digest),
            nId
          );
          console.log("Create game transaction successful:", data.digest);
          console.warn("Could not automatically extract created Game ID. Check the explorer or implement ID extraction.");
          options?.onSuccess?.(data, undefined);
        },
        onError: (error) => {
          setIsLoading(false);
          notification.txError(error instanceof Error ? error : new Error(String(error)), null, nId);
        },
      }
    );
  };

  return { mutate: createGame, isLoading };
};

// Add other game mutation hooks here later (e.g., usePurchaseGameMutation) 