import { useState, useEffect } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { SuiObjectResponse } from '@mysten/sui/client';
import { normalizeSuiObjectId } from '@mysten/sui/utils';
// Import the type from the central types file
import type { GameDetailsData } from '~~/dapp/types/game.types';

// Helper function to parse the Game object fields
// Use the imported GameDetailsData type in the return signature
function parseGameObjectDetails(response: SuiObjectResponse): GameDetailsData | null {
    const fields = response.data?.content?.dataType === 'moveObject' 
                   ? response.data.content.fields 
                   : null;
    
    let ownerAddress: string | undefined = undefined;
    const ownerInfo = response.data?.owner;

    // Check if ownerInfo is an object and has the AddressOwner property
    if (ownerInfo && typeof ownerInfo === 'object' && 'AddressOwner' in ownerInfo) {
        // Ensure the property exists and is a string before assigning
        if (typeof ownerInfo.AddressOwner === 'string') {
             ownerAddress = ownerInfo.AddressOwner;
        }
    } else if (ownerInfo && typeof ownerInfo === 'object' && 'ObjectOwner' in ownerInfo) {
        // Handle ObjectOwner
    } else if (ownerInfo && typeof ownerInfo === 'object' && 'Shared' in ownerInfo) {
        // Handle Shared
    } else if (typeof ownerInfo === 'string' && ownerInfo === 'Immutable') {
         // Handle Immutable (represented as a string literal "Immutable")
         ownerAddress = 'Immutable'; // Or however you want to represent it
    }
    // Add more checks if necessary for other potential owner types

    if (!fields) {
        console.warn(`Could not get fields or not a Move object: ${response.data?.objectId}`);
        return null;
    }

    const fieldsAny = fields as any;
    
    const gameId = normalizeSuiObjectId(fieldsAny.id?.id ?? response.data?.objectId ?? '');
    if (!gameId) return null; 

    const overallRateStr = fieldsAny.overall_rate as string | undefined;
    const numReviewsStr = fieldsAny.num_reviews as string | undefined;
    const overallRate = overallRateStr ? parseFloat(overallRateStr) : undefined;
    const numReviews = numReviewsStr ? parseInt(numReviewsStr, 10) : undefined;

    return {
        gameId: gameId,
        name: fieldsAny.name as string | undefined,
        description: fieldsAny.description as string | undefined,
        genre: fieldsAny.genre as string | undefined,
        platform: fieldsAny.platform as string | undefined,
        price: fieldsAny.price as string | undefined,
        owner: ownerAddress, 
        overallRate: !isNaN(overallRate as number) ? overallRate : undefined,
        numReviews: !isNaN(numReviews as number) ? numReviews : undefined,
        reviewsTableId: (fieldsAny.reviews as { id: string })?.id as string | undefined,
        guidesTableId: (fieldsAny.guides as { id: string })?.id as string | undefined,
    };
}


// Use the imported GameDetailsData type in the hook's state and return signature
export function useFetchGameDetails(gameId: string | null | undefined): {
  data: GameDetailsData | null;
  isLoading: boolean;
  error: string | null;
} {
    const [data, setData] = useState<GameDetailsData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const client = useSuiClient();

    useEffect(() => {
        const fetchDetails = async () => {
            if (!gameId) {
                // Don't fetch if gameId is not provided
                setData(null);
                setIsLoading(false);
                setError('No Game ID provided.');
                return;
            }

            // Basic validation
            if (!gameId.startsWith('0x') || gameId.length < 10) {
                setData(null);
                setIsLoading(false);
                setError('Invalid Game ID format.');
                return;
            }

            setIsLoading(true);
            setError(null);
            setData(null); // Clear previous data

            try {
                console.log(`Fetching object details for Game: ${gameId}`);
                const objectResponse = await client.getObject({
                    id: gameId,
                    options: { 
                        showContent: true, 
                        showOwner: true, // Request owner info
                        // We might need showBcs or showType later depending on field complexity
                    },
                });

                console.log('Received object response:', objectResponse);

                if (objectResponse.error) {
                    throw new Error(`Error fetching object ${gameId}: ${objectResponse.error.code}`);
                }
                
                if (!objectResponse.data) {
                     throw new Error(`Game object ${gameId} not found or access denied.`);
                }

                // TODO: Add check here to ensure the fetched object is actually a Game object
                // based on its type string, similar to useFetchDashboardGames
                // Example: if (!objectResponse.data.type?.startsWith(`${packageId}::game::Game`)) { ... }
                // Need to get packageId similar to how it was done in useFetchDashboardGames

                const parsedData = parseGameObjectDetails(objectResponse);

                if (!parsedData) {
                    throw new Error(`Could not parse game data for object ${gameId}.`);
                }
                
                console.log('Parsed game details:', parsedData);
                setData(parsedData);

            } catch (err: any) {
                console.error("Failed to fetch game details:", err);
                setError(`Could not load game details: ${err.message || 'Unknown error'}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
        // Dependency array includes the client and gameId
    }, [client, gameId]); 

    return { data, isLoading, error };
} 