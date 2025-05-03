import { useSuiClientQuery } from '@mysten/dapp-kit';
import { IGameFields, ObjectId } from '~~/dapp/types/game'; // Import ObjectId and IGameFields type

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
    // Check if data and the expected path to fields exist
    if (!data || !data.data || !data.data.content || !data.data.content.fields) {
        return null;
    }
    // TODO: Add more robust type assertion or validation if necessary
    return data.data.content.fields as IGameFields;
}

export default useGame; 