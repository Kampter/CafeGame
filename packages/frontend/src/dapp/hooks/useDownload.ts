import { useMutation } from '@tanstack/react-query';
import { useGameContract } from '~~/hooks/useGameContract';
import { useToast } from '~~/components/ui/use-toast';

export const useDownload = () => {
  const { contract } = useGameContract();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (gameId: string) => {
      if (!contract) throw new Error('Contract not initialized');
      const downloadUrl = await contract.getGameDownloadUrl(gameId);
      return downloadUrl;
    },
    onError: (error: Error) => {
      toast({
        title: '获取下载链接失败',
        description: error.message,
        type: 'error',
      });
    },
  });
}; 