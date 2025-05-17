import { useQuery } from '@tanstack/react-query';
import { useGameContract } from '~~/hooks/useGameContract';

export const useReviews = (gameId: string) => {
  const { contract } = useGameContract();

  return useQuery({
    queryKey: ['reviews', gameId],
    queryFn: async () => {
      if (!contract) throw new Error('Contract not initialized');
      const reviews = await contract.getGameReviews(gameId);
      return reviews.map(review => ({
        id: review.id,
        content: review.content,
        rating: review.rating.toNumber(),
        author: review.author,
        createdAt: new Date(review.createdAt.toNumber() * 1000),
      }));
    },
    enabled: !!contract && !!gameId,
  });
}; 