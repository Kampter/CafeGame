import { useState, useEffect } from 'react';
import { useSuiClient, useSuiClientContext } from '@mysten/dapp-kit';
import { SuiObjectResponse } from '@mysten/sui/client';
import { normalizeSuiObjectId } from '@mysten/sui/utils';
import { 
    LOCALNET_CONTRACT_PACKAGE_ID, 
    DEVNET_CONTRACT_PACKAGE_ID, 
    TESTNET_CONTRACT_PACKAGE_ID, 
    MAINNET_CONTRACT_PACKAGE_ID, 
    CONTRACT_PACKAGE_ID_NOT_DEFINED 
} from '../../config/network';
import { HARDCODED_DASHBOARD_ID } from '~~/dapp/config/network';
// Import the type
import type { DashboardGameData } from '~~/dapp/types/dashboard.types';

// Helper function to safely parse fields from a SuiObjectResponse
// Use imported DashboardGameData type
function parseGameObject(response: SuiObjectResponse): DashboardGameData | null {
    const fields = response.data?.content?.dataType === 'moveObject' 
                   ? response.data.content.fields 
                   : null;
    
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
        name: fieldsAny.name as string || 'Unknown Name', 
        genre: fieldsAny.genre as string | undefined,
        platform: fieldsAny.platform as string | undefined,
        overallRate: !isNaN(overallRate as number) ? overallRate : undefined,
        numReviews: !isNaN(numReviews as number) ? numReviews : undefined,
    };
}

// Use imported DashboardGameData type
export function useFetchDashboardGames(): {
    games: DashboardGameData[];
    isLoading: boolean;
    error: string | null;
} {
    const [games, setGames] = useState<DashboardGameData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const client = useSuiClient();
    const ctx = useSuiClientContext();
    const currentNetworkName = ctx.network;

    const dashboardId = HARDCODED_DASHBOARD_ID;

    // Determine packageId based on the network name from the context
    let packageId: string = CONTRACT_PACKAGE_ID_NOT_DEFINED;
    if (currentNetworkName) {
        switch (currentNetworkName) {
            case 'localnet':
                packageId = LOCALNET_CONTRACT_PACKAGE_ID;
                break;
            case 'devnet':
                packageId = DEVNET_CONTRACT_PACKAGE_ID;
                break;
            case 'testnet':
                packageId = TESTNET_CONTRACT_PACKAGE_ID;
                break;
            case 'mainnet':
                packageId = MAINNET_CONTRACT_PACKAGE_ID;
                break;
        }
    }

    useEffect(() => {
        const fetchGames = async () => {
            // Check dashboardId validity
            if (!dashboardId || !dashboardId.startsWith('0x') || dashboardId.length < 10) { 
                setError('Dashboard ID is not configured or invalid.');
                setIsLoading(false);
                return;
            }
            
            // Check if packageId is valid before proceeding
            // Also check if networkConfig was available to determine the ID
            if (!currentNetworkName || !packageId || packageId === CONTRACT_PACKAGE_ID_NOT_DEFINED) {
                const errorMsg = !currentNetworkName 
                    ? 'Could not determine current network.'
                    : 'Contract Package ID could not be determined for the current network.';
                setError(errorMsg);
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            setError(null);
            setGames([]);

            try {
                let allGameIds: string[] = [];
                let cursor: string | null | undefined = null;
                let hasNextPage = true;

                console.log(`Fetching dynamic fields for Dashboard: ${dashboardId}`);
                while (hasNextPage) {
                    const dynamicFieldsPage = await client.getDynamicFields({
                        parentId: dashboardId,
                        cursor: cursor,
                    });

                    const gameIds = dynamicFieldsPage.data
                        .map(field => typeof field.name.value === 'string' ? normalizeSuiObjectId(field.name.value) : null)
                        .filter((id): id is string => !!id);
                        
                    allGameIds = [...allGameIds, ...gameIds];
                    
                    cursor = dynamicFieldsPage.nextCursor;
                    hasNextPage = dynamicFieldsPage.hasNextPage;
                    console.log(`Fetched ${gameIds.length} game IDs, next cursor: ${cursor}, hasNextPage: ${hasNextPage}`);
                }
                
                console.log(`Found ${allGameIds.length} total game IDs registered.`);

                if (allGameIds.length === 0) {
                    setGames([]);
                    setIsLoading(false);
                    return; 
                }

                console.log('Fetching details for game objects...', allGameIds);
                 const gameObjectsResponse = await client.multiGetObjects({
                     ids: allGameIds,
                     options: { showContent: true, showType: true }, 
                 });

                console.log('Received game object responses:', gameObjectsResponse);

                const gameTypePrefix = `${normalizeSuiObjectId(packageId)}::game::Game`;
                console.log(`Expecting Game objects with type prefix: ${gameTypePrefix}`);

                const fetchedGames: DashboardGameData[] = gameObjectsResponse
                    .map(response => {
                        if (response.error) {
                            console.error(`Error fetching object:`, response.error);
                            return null;
                        }
                        if (!response.data?.type?.startsWith(gameTypePrefix)) { 
                             console.warn(`Skipping object ${response.data?.objectId} - not a Game object type: ${response.data?.type}`);
                             return null;
                        }
                        return parseGameObject(response);
                    })
                    .filter((game): game is DashboardGameData => game !== null);

                console.log('Parsed game data:', fetchedGames);
                setGames(fetchedGames);

            } catch (err: any) {
                console.error("Failed to fetch dashboard games:", err);
                setError(`Could not load games: ${err.message || 'Unknown error'}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGames();
        // Dependency array now includes client, dashboardId, and packageId (derived from context network)
    }, [client, dashboardId, packageId, currentNetworkName]); // Added currentNetworkName

    return { games, isLoading, error };
} 