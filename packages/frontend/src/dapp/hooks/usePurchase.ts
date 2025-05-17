import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGameContract } from '~~/hooks/useGameContract';
import { useToast } from '~~/components/ui/use-toast';

export const usePurchase = () => {
  const { contract } = useGameContract();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (gameId: string) => {
      if (!contract) throw new Error('Contract not initialized');
      const tx = await contract.purchaseGame(gameId);
      await tx.wait();
      return tx;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game'] });
      toast({
        title: '购买成功',
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