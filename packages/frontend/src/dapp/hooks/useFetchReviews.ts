import { useState, useEffect, useCallback } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { SuiObjectResponse } from '@mysten/sui/client';
import { normalizeSuiObjectId } from '@mysten/sui/utils';
// Import the type
import type { ReviewData } from '~~/dapp/types/review.types';

// Helper function to parse a Review object
// Use imported ReviewData type
function parseReviewObject(response: SuiObjectResponse): ReviewData | null {
    const fields = response.data?.content?.dataType === 'moveObject' 
                   ? response.data.content.fields 
                   : null;

    if (!fields) {
        console.warn(`Could not get fields or not a Move object: ${response.data?.objectId}`);
        return null;
    }

    const fieldsAny = fields as any;

    const reviewId = normalizeSuiObjectId(fieldsAny.id?.id ?? response.data?.objectId ?? '');
    if (!reviewId) return null;

    // Helper to safely parse u64 fields (which might be strings)
    const parseU64 = (value: any): number => {
        const num = typeof value === 'string' ? parseInt(value, 10) : Number(value);
        return isNaN(num) ? 0 : num; // Default to 0 if parsing fails
    };

    return {
        reviewId,
        gameId: normalizeSuiObjectId(fieldsAny.game_id?.id ?? ''), // Assuming game_id is an ID struct
        content: fieldsAny.content as string || '',
        timeIssued: parseU64(fieldsAny.time_issued),
        rating: parseU64(fieldsAny.rating),
        len: parseU64(fieldsAny.len),
        votes: parseU64(fieldsAny.votes),
        duration: parseU64(fieldsAny.duration),
        totalScore: parseU64(fieldsAny.total_score),
        owner: normalizeSuiObjectId(fieldsAny.owner ?? ''), // Assuming owner is an address string
    };
}

/**
 * Fetches reviews associated with a game via its reviews ObjectTable.
 * @param reviewsTableId The ID of the ObjectTable<ID, Review>.
 * @returns An object containing the reviews list, isLoading state, and error state.
 */
export function useFetchReviews(reviewsTableId: string | null | undefined): {
    reviews: ReviewData[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
} {
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const client = useSuiClient();

    // Move the fetch logic outside useEffect and wrap with useCallback
    const fetchAllReviews = useCallback(async () => {
        // Ensure the check happens inside the callback where tableId is used
        console.log(`[useFetchReviews] Checking tableId before fetch:`, reviewsTableId); 
        
        // Explicit type check before proceeding
        if (typeof reviewsTableId !== 'string' || !reviewsTableId) {
            console.log(`[useFetchReviews] Invalid or missing tableId (${typeof reviewsTableId}), skipping fetch.`);
                setReviews([]);
            setIsLoading(false); // Stop loading if ID is invalid
            // Set error only if it was expected but invalid, not if initially undefined
            // setError('Reviews table ID is invalid.'); 
                return;
            }

        // If we reach here, reviewsTableId is a valid string
            setIsLoading(true);
            setError(null);

            try {
                let allReviewIds: string[] = [];
                let cursor: string | null | undefined = null;
                let hasNextPage = true;

            console.log(`[useFetchReviews] Fetching dynamic fields for Table: ${reviewsTableId}`);
                while (hasNextPage) {
                    const dynamicFieldsPage = await client.getDynamicFields({
                        parentId: reviewsTableId,
                        cursor: cursor,
                    });
                // --- Log Raw Dynamic Fields --- 
                console.log('[useFetchReviews] Raw dynamicFieldsPage.data:', JSON.stringify(dynamicFieldsPage.data, null, 2));
                // ----------------------------- 
                    const reviewIds = dynamicFieldsPage.data
                    .map(field => typeof field.name.value === 'string' ? normalizeSuiObjectId(field.name.value) : null)
                    .filter((id): id is string => !!id);
                    allReviewIds = [...allReviewIds, ...reviewIds];
                    cursor = dynamicFieldsPage.nextCursor;
                    hasNextPage = dynamicFieldsPage.hasNextPage;
                }
            // --- Log All Found Review IDs --- 
            console.log(`[useFetchReviews] Found Review IDs:`, allReviewIds);
            // ------------------------------- 

                if (allReviewIds.length === 0) {
                    setReviews([]);
            } else {
                console.log('[useFetchReviews] Fetching details for review objects:', allReviewIds);
                 const reviewObjectsResponse = await client.multiGetObjects({
                     ids: allReviewIds,
                     options: { showContent: true }, // Ensure content is requested
                 });
                 // --- Log Raw Object Responses --- 
                 console.log('[useFetchReviews] Raw multiGetObjects responses:', JSON.stringify(reviewObjectsResponse, null, 2));
                 // ----------------------------- 

                const fetchedReviews: ReviewData[] = reviewObjectsResponse
                    .map(response => {
                        if (response.error) {
                            console.error(`[useFetchReviews] Error fetching single object:`, response.error);
                            return null;
                        }
                        const parsed = parseReviewObject(response);
                        // --- Log Parsing Result --- 
                        console.log(`[useFetchReviews] Parsed object ${response.data?.objectId}:`, parsed);
                        // ----------------------- 
                        return parsed;
                    })
                    .filter((review): review is ReviewData => review !== null);

                fetchedReviews.sort((a, b) => b.totalScore - a.totalScore);
                // --- Log Final Fetched & Sorted Reviews --- 
                console.log('[useFetchReviews] Final fetched reviews state:', fetchedReviews);
                // -------------------------------------- 
                setReviews(fetchedReviews);
            }

            } catch (err: any) {
            console.error("[useFetchReviews] Failed to fetch reviews:", err);
                setError(`Could not load reviews: ${err.message || 'Unknown error'}`);
            setReviews([]);
            } finally {
                setIsLoading(false);
            }
    }, [client, reviewsTableId]);

    useEffect(() => {
        fetchAllReviews();
    }, [fetchAllReviews]); // useEffect dependency is now the memoized fetch function

    // Return the refetch function
    return { reviews, isLoading, error, refetch: fetchAllReviews };
} 