import { useSuiClientQuery } from '@mysten/dapp-kit';
import { IGameFields, ObjectId } from '~~/dapp/types/game.types'; // Corrected path

/**
 * Fetches a specific Game object by its ID.
 */
const useGame = (gameObjectId: ObjectId | null | undefined) => {
  return useSuiClientQuery(
    'getObject',
    {
      id: gameObjectId as string,
      options: {
        showContent: true, // Need the fields
        showOwner: true,   // May be useful
        showType: true,    // Good for verification
      },
    },
    {
      enabled: !!gameObjectId, // Only run query if ID is provided
      refetchOnWindowFocus: true, // Consider if this is desired for game data
      staleTime: 1000 * 60 * 1, // 1 minute stale time, adjust as needed
    }
  );
};

// Helper to extract game fields safely
// Adjust based on the actual structure returned by getObject
export const getGameFields = (data: any): IGameFields | null => {
    if (!data?.data?.content?.fields) { // Simplified null check
        return null;
    }
    
    const rawFields = data.data.content.fields;
    
    const processedFields: Record<string, any> = { ...rawFields };

    if (rawFields.reviews && typeof rawFields.reviews === 'object' && 
        rawFields.reviews.fields && typeof rawFields.reviews.fields === 'object' &&
        rawFields.reviews.fields.id && typeof rawFields.reviews.fields.id === 'object' &&
        typeof rawFields.reviews.fields.id.id === 'string') {
        processedFields.reviews = { id: rawFields.reviews.fields.id.id };
    } else if (rawFields.reviews) {
        console.warn('[getGameFields] Unexpected structure for reviews:', rawFields.reviews);
    }

    if (rawFields.guides && typeof rawFields.guides === 'object' &&
        rawFields.guides.fields && typeof rawFields.guides.fields === 'object' &&
        rawFields.guides.fields.id && typeof rawFields.guides.fields.id === 'object' &&
        typeof rawFields.guides.fields.id.id === 'string') {
        processedFields.guides = { id: rawFields.guides.fields.id.id };
    } else if (rawFields.guides) {
        console.warn('[getGameFields] Unexpected structure for guides:', rawFields.guides);
    }
    
    return processedFields as IGameFields;
}

export default useGame; 