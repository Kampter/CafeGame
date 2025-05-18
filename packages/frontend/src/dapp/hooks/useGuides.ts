import { useQuery } from '@tanstack/react-query';
import { useSuiClient } from '@mysten/dapp-kit';
import { GuideData } from '~~/dapp/types/guide.types';
import { SuiObjectData } from '@mysten/sui/client';
import { ObjectId } from '~~/dapp/types/game.types';

// Helper to extract guide data from SuiObjectData
function extractGuideDataFromSuiResponse(object: SuiObjectData): GuideData | null {
  if (object.content?.dataType === 'moveObject') { // object.content, not object.data.content
    const fields = object.content.fields as any;
    // Ensure all fields accessed on 'fields' match the Guide struct and GuideData type
    return {
      guideId: object.objectId, // object.objectId, not object.data.objectId
      gameId: fields.game_id,
      title: fields.title,
      content: fields.content,
      guideType: fields.guide_type || String(fields.guide_type_code || 0), // Handle potential naming differences
      createdAt: parseInt(fields.created_at || fields.created_at_ms || '0'),
      updatedAt: parseInt(fields.updated_at || fields.updated_at_ms || '0'),
      likes: parseInt(fields.likes || '0'),
      views: parseInt(fields.views || '0'),
      owner: fields.owner,
    };
  }
  return null;
}

export const useGuides = (gameId: string | undefined) => {
  const suiClient = useSuiClient();

  return useQuery<GuideData[], Error>({
    queryKey: ['gameGuides', gameId], 
    queryFn: async () => {
      if (!gameId) throw new Error('Game ID is required to fetch guides.');
      if (!suiClient) throw new Error('SuiClient not initialized');

      const gameQuery = await suiClient.getObject({
        id: gameId,
        options: { showContent: true },
      });

      // Access gameQuery.data for the SuiObjectResponse content
      if (gameQuery.data?.content?.dataType !== 'moveObject') {
        throw new Error('Failed to fetch game object or invalid game object structure.');
      }

      // Define a minimal type for the fields we need from the Game object
      type GameFieldsForTableAccess = {
        guides?: { id: ObjectId };
        reviews?: { id: ObjectId }; 
        // Add other fields if accessed directly from gameFields in this hook
      };
      const gameFields = gameQuery.data.content.fields as GameFieldsForTableAccess;
      
      const guidesTableId = gameFields.guides?.id;
      if (!guidesTableId) {
        console.log('Guides ObjectTable ID not found on game object, returning empty array.');
        return [];
      }

      const guideObjectIds: string[] = [];
      let cursor: string | undefined = undefined; 
      do {
        const dfPage = await suiClient.getDynamicFields({
          parentId: guidesTableId,
          cursor: cursor,
        });
        dfPage.data.forEach(df => guideObjectIds.push(df.objectId));
        cursor = dfPage.nextCursor ?? undefined; // Convert null to undefined
      } while (cursor);

      if (guideObjectIds.length === 0) {
        return [];
      }

      const guideObjectsResponse = await suiClient.multiGetObjects({
        ids: guideObjectIds,
        options: { showContent: true, showType: true }, // Added showType for better debugging if needed
      });

      const guides = guideObjectsResponse
        .map(response => response.data ? extractGuideDataFromSuiResponse(response.data) : null) // response.data is SuiObjectData
        .filter(guide => guide !== null) as GuideData[];
      
      return guides;
    },
    // Options object for useQuery (third argument)
    enabled: !!suiClient && !!gameId,
  });
}; 