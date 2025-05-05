import { useState, useEffect, useCallback } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { SuiObjectResponse } from '@mysten/sui/client';
import { normalizeSuiObjectId } from '@mysten/sui/utils';
// Import the type
import type { GuideData } from '~~/dapp/types/guide.types';

// Helper function to parse a Guide object from SuiObjectResponse
function parseGuideObject(response: SuiObjectResponse): GuideData | null {
    const fields = response.data?.content?.dataType === 'moveObject' 
                   ? response.data.content.fields 
                   : null;

    if (!fields) {
        console.warn(`Could not get fields or not a Move object: ${response.data?.objectId}`);
        return null;
    }

    const fieldsAny = fields as any;

    const guideId = normalizeSuiObjectId(fieldsAny.id?.id ?? response.data?.objectId ?? '');
    if (!guideId) return null;

    const parseU64 = (value: any): number => {
        const num = typeof value === 'string' ? parseInt(value, 10) : Number(value);
        return isNaN(num) ? 0 : num;
    };

    // Convert guide_type enum (assuming it's an object like { name: 'Walkthrough' })
    let guideTypeStr = 'Unknown';
    if (fieldsAny.guide_type && typeof fieldsAny.guide_type === 'object') {
         // Adjust based on how your Move enum -> JSON conversion works
         // Example: if it becomes { fields: { name: 'Walkthrough' } } 
         // Or simply { name: 'Walkthrough' }
         if ('name' in fieldsAny.guide_type) {
             guideTypeStr = fieldsAny.guide_type.name as string;
         } else if (fieldsAny.guide_type.fields && 'name' in fieldsAny.guide_type.fields) {
             guideTypeStr = fieldsAny.guide_type.fields.name as string;
         }
    } else if (typeof fieldsAny.guide_type === 'string') { 
        // Handle if it's just a string representation
        guideTypeStr = fieldsAny.guide_type;
    }

    return {
        guideId,
        gameId: normalizeSuiObjectId(fieldsAny.game_id?.id ?? ''), // Assuming game_id is ID
        title: fieldsAny.title as string || '',
        content: fieldsAny.content as string || '', // Consider fetching large content on demand
        guideType: guideTypeStr, 
        createdAt: parseU64(fieldsAny.created_at),
        updatedAt: parseU64(fieldsAny.updated_at),
        likes: parseU64(fieldsAny.likes),
        views: parseU64(fieldsAny.views),
        owner: normalizeSuiObjectId(fieldsAny.owner ?? ''),
    };
}

/**
 * Fetches guides associated with a game via its guides ObjectTable.
 * @param guidesTableId The ID of the ObjectTable<ID, Guide>.
 * @returns An object containing the guides list, isLoading state, and error state.
 */
export function useFetchGuides(guidesTableId: string | null | undefined): {
    guides: GuideData[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
} {
    const [guides, setGuides] = useState<GuideData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const client = useSuiClient();

    // Define fetchAllGuides using useCallback
    const fetchAllGuides = useCallback(async () => {
        // Ensure the check happens inside the callback where tableId is used
        console.log(`[useFetchGuides] Checking tableId before fetch:`, guidesTableId); 
        
        // Explicit type check before proceeding
        if (typeof guidesTableId !== 'string' || !guidesTableId) {
            console.log(`[useFetchGuides] Invalid or missing tableId (${typeof guidesTableId}), skipping fetch.`);
                setGuides([]);
            setIsLoading(false); // Stop loading if ID is invalid
            // setError('Guides table ID is invalid.');
                return;
            }

        // If we reach here, guidesTableId is a valid string
            setIsLoading(true);
            setError(null);

            try {
                let allGuideIds: string[] = [];
                let cursor: string | null | undefined = null;
                let hasNextPage = true;

                console.log(`Fetching dynamic fields (guide IDs) for Table: ${guidesTableId}`);
            // Now we are sure guidesTableId is a string
                while (hasNextPage) {
                    const dynamicFieldsPage = await client.getDynamicFields({
                        parentId: guidesTableId,
                        cursor: cursor,
                    });
                    const guideIds = dynamicFieldsPage.data
                    // Add type check before normalizing
                    .map(field => typeof field.name.value === 'string' ? normalizeSuiObjectId(field.name.value) : null)
                    // Use type predicate in filter to ensure only strings remain
                    .filter((id): id is string => !!id);
                // Now guideIds is correctly typed as string[]
                    allGuideIds = [...allGuideIds, ...guideIds];
                    cursor = dynamicFieldsPage.nextCursor;
                    hasNextPage = dynamicFieldsPage.hasNextPage;
                }
                console.log(`Found ${allGuideIds.length} total guide IDs in table.`);

                if (allGuideIds.length === 0) {
                    setGuides([]);
            } else {
                console.log('Fetching details for guide objects...', allGuideIds);
                 const guideObjectsResponse = await client.multiGetObjects({
                     ids: allGuideIds,
                     options: { showContent: true }, 
                 });
                console.log('Received guide object responses:', guideObjectsResponse);

                const fetchedGuides: GuideData[] = guideObjectsResponse
                    .map(response => {
                        if (response.error) {
                            console.error(`Error fetching guide object:`, response.error);
                            return null;
                        }
                        return parseGuideObject(response);
                    })
                    .filter((guide): guide is GuideData => guide !== null);

                fetchedGuides.sort((a, b) => b.likes - a.likes);
                console.log('Parsed and sorted guides:', fetchedGuides);
                setGuides(fetchedGuides);
            }

            } catch (err: any) {
                console.error("Failed to fetch guides:", err);
                setError(`Could not load guides: ${err.message || 'Unknown error'}`);
            setGuides([]);
            } finally {
                setIsLoading(false);
            }
    }, [client, guidesTableId]); // Dependencies for useCallback

    useEffect(() => {
        fetchAllGuides();
    }, [fetchAllGuides]); // Dependency for useEffect

    // Return guides, loading state, error, and the refetch function
    return { guides, isLoading, error, refetch: fetchAllGuides };
} 