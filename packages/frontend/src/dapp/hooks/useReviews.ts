import { useQuery } from '@tanstack/react-query';
import { useSuiClient } from '@mysten/dapp-kit';
import { ReviewData } from '~~/dapp/types/review.types'; // Assuming ReviewData is the correct type
import { SuiObjectData } from '@mysten/sui/client';
import { ObjectId } from '~~/dapp/types/game.types'; // For ObjectId type

// Helper to extract review data from SuiObjectData
// This should be based on the Review struct and ReviewData type
function extractReviewDataFromSuiResponse(object: SuiObjectData): ReviewData | null {
  if (object.content?.dataType === 'moveObject') {
    const fields = object.content.fields as any;
    return {
      reviewId: object.objectId,
      gameId: fields.game_id,
      content: fields.content,
      rating: parseInt(fields.rating || '0'),
      timeIssued: parseInt(fields.time_issued || fields.created_at || fields.created_at_ms || '0'), // Adapt to actual field names
      votes: parseInt(fields.votes || '0'),
      totalScore: parseInt(fields.total_score || '0'),
      owner: fields.owner,
      len: parseInt(fields.len || '0'),
      duration: parseInt(fields.duration || '0'),
      // Ensure all fields from ReviewData are mapped
    };
  }
  return null;
}

// Minimal type for accessing the reviews ObjectTable ID from Game object fields
interface GameFieldsForReviewsTable {
  reviews?: { id: ObjectId };
}

export const useReviews = (gameId: string | undefined) => {
  const suiClient = useSuiClient();

  return useQuery<ReviewData[], Error>({
    queryKey: ['gameReviews', gameId], 
    queryFn: async () => {
      if (!gameId) throw new Error('Game ID is required to fetch reviews.');
      if (!suiClient) throw new Error('SuiClient not initialized');

      const gameQuery = await suiClient.getObject({
        id: gameId,
        options: { showContent: true },
      });

      if (gameQuery.data?.content?.dataType !== 'moveObject') {
        throw new Error('Failed to fetch game object or invalid game object structure.');
      }
      const gameFields = gameQuery.data.content.fields as GameFieldsForReviewsTable;
      
      const reviewsTableId = gameFields.reviews?.id;
      if (!reviewsTableId) {
        console.log('Reviews ObjectTable ID not found on game object, returning empty array.');
        return [];
      }

      const reviewObjectIds: string[] = [];
      let cursor: string | undefined = undefined;
      do {
        const dfPage = await suiClient.getDynamicFields({
          parentId: reviewsTableId,
          cursor: cursor,
        });
        dfPage.data.forEach(df => reviewObjectIds.push(df.objectId));
        cursor = dfPage.nextCursor ?? undefined;
      } while (cursor);

      if (reviewObjectIds.length === 0) {
        return [];
      }

      const reviewObjectsResponse = await suiClient.multiGetObjects({
        ids: reviewObjectIds,
        options: { showContent: true, showType: true }, 
      });

      const reviews = reviewObjectsResponse
        .map(response => response.data ? extractReviewDataFromSuiResponse(response.data) : null)
        .filter(review => review !== null) as ReviewData[];
      
      return reviews;
    },
    enabled: !!suiClient && !!gameId,
  });
}; 