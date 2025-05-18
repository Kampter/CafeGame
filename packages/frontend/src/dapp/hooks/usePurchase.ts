import { useMutation } from '@tanstack/react-query';
import { useGameContract } from '~~/hooks/useGameContract';
import { useToast } from '~~/components/ui/use-toast';
import { useSuiClient, useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs'; // Assuming BCS might be needed for arguments

interface PurchaseGameArgs {
  gameId: string;
  price: string; // Assuming price is passed as a string (e.g., MIST value)
  // Potentially, coin object ID for payment might be needed if not handled by splitCoins
}

export const usePurchase = () => {
  const gameContractInfo = useGameContract();
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ gameId, price }: PurchaseGameArgs) => {
      const { packageId, module } = gameContractInfo.getContract();
      if (!packageId || packageId === '0xNOTDEFINED') throw new Error('Game contract package ID not defined');
      if (!suiClient) throw new Error('SuiClient not initialized');
      if (!currentAccount) throw new Error('Wallet not connected');

      // This is a placeholder for the actual purchase logic
      // const tx = await contract.purchaseGame(gameId, price); // Old problematic line
      
      const txb = new Transaction();
      // Example: Assume purchase_game takes game_id and a Coin object for payment
      // 1. Create or get a coin for payment (e.g., split from gas coin)
      const [paymentCoin] = txb.splitCoins(txb.gas, [txb.pure(bcs.U64.serialize(price))]); // price needs to be u64 string
      
      // 2. Make the move call
      txb.moveCall({
        target: `${packageId}::${module}::purchase_game`, // Assuming function name is purchase_game
        arguments: [
          txb.object(gameId),
          paymentCoin,
          // Potentially other arguments like a PlayerProfile object ID if needed by the contract
        ],
      });
      txb.setSender(currentAccount.address);

      console.warn('`purchaseGame` logic has been scaffolded. Verify function name, arguments, and types with the Move contract.');
      
      // Sign and execute the transaction
      const purchaseResult = await signAndExecuteTransaction({ transaction: txb });
      // Optionally wait for transaction finality if needed here, or handle in component
      // await suiClient.waitForTransaction({ digest: purchaseResult.digest });
      return purchaseResult;
    },
    onSuccess: () => {
      toast({
        title: '游戏购买成功',
        description: '感谢您的购买!',
        type: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '购买失败',
        description: error.message,
        type: 'error', 
      });
    },
  });
}; 