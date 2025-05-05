import { useSignTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils';
import { GAME_MODULE_NAME } from '../config/network';
import { CONTRACT_PACKAGE_VARIABLE_NAME } from '~~/config/network';
import useNetworkConfig from '~~/hooks/useNetworkConfig';
import { toast } from 'react-hot-toast';
import type { SuiTransactionBlockResponse } from '@mysten/sui/client';
import { bcs } from '@mysten/sui/bcs';

interface UseCreateReviewMutationProps {
  onSuccess?: (result: SuiTransactionBlockResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreateReviewMutation({ onSuccess, onError }: UseCreateReviewMutationProps = {}) {
  const { mutate: signTransaction } = useSignTransaction();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { useNetworkVariable } = useNetworkConfig();
  const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME);

  const createReview = (gameId: string, content: string, rating: number) => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first.');
      return;
    }
    if (!content.trim()) {
        toast.error('Review content cannot be empty.');
        return;
    }
    if (rating < 1 || rating > 5) { 
        toast.error('Rating must be between 1 and 5.');
        return;
    }
    if (!packageId || packageId === '0xNOTDEFINED') { 
        toast.error('Contract Package ID is not configured for the current network.');
        console.error('Package ID not found for current network. Check .env files and network config.');
        return;
    }

    const txb = new Transaction();

    txb.moveCall({
      target: `${packageId}::${GAME_MODULE_NAME}::create_review_without_pod`,
      arguments: [
        txb.object(gameId),
        txb.pure.address(currentAccount.address),
        txb.pure(bcs.String.serialize(content)),
        txb.pure.u64(BigInt(rating)),
        txb.object(SUI_CLOCK_OBJECT_ID),
      ],
    });

    signTransaction(
      {
        transaction: txb,
      },
      {
        onSuccess: (result) => {
          console.log('Review transaction signed, executing...', result);
          suiClient.executeTransactionBlock({
              transactionBlock: result.bytes,
              signature: result.signature,
              options: { showEffects: true }
            }).then((execResult: SuiTransactionBlockResponse) => {
                console.log('Create review transaction successful:', execResult);
                toast.success('Review submitted successfully!');
                onSuccess?.(execResult);
            }).catch((error: Error) => {
                console.error('Create review transaction execution failed:', error);
                toast.error(`Failed to submit review: ${error.message}`);
                onError?.(error);
            });
        },
        onError: (error: Error) => {
          console.error('Create review transaction signing failed:', error);
          toast.error(`Failed to sign transaction: ${error.message}`);
          onError?.(error);
        },
      }
    );
  };

  return { createReview }; 
}
 