import { useQuery } from '@tanstack/react-query';
import { useGameContract } from '~~/hooks/useGameContract';

export const useGuides = (gameId: string) => {
  const { contract } = useGameContract();

  return useQuery({
    queryKey: ['guides', gameId],
    queryFn: async () => {
      if (!contract) throw new Error('Contract not initialized');
      const guides = await contract.getGameGuides(gameId);
      return guides.map(guide => ({
        id: guide.id,
        title: guide.title,
        content: guide.content,
        author: guide.author,
        createdAt: new Date(guide.createdAt.toNumber() * 1000),
        updatedAt: new Date(guide.updatedAt.toNumber() * 1000),
      }));
    },
    enabled: !!contract && !!gameId,
  });
}; 