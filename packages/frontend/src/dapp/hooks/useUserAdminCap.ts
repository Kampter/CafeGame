import { useState, useEffect } from 'react';
import { useSuiClient, useSuiClientContext, useCurrentAccount } from '@mysten/dapp-kit';
import { normalizeSuiObjectId } from '@mysten/sui/utils';
import { 
    LOCALNET_CONTRACT_PACKAGE_ID, 
    DEVNET_CONTRACT_PACKAGE_ID, 
    TESTNET_CONTRACT_PACKAGE_ID, 
    MAINNET_CONTRACT_PACKAGE_ID, 
    CONTRACT_PACKAGE_ID_NOT_DEFINED 
} from '../../config/network';

/**
 * Fetches the AdminCap object ID for a specific game owned by the current user.
 * @param gameId The ID of the game object.
 * @returns An object containing the adminCapId (string | null), isLoading state, and error state.
 */
export function useUserAdminCap(gameId: string | null | undefined) {
    const [adminCapId, setAdminCapId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const client = useSuiClient();
    const { network } = useSuiClientContext();
    const currentAccount = useCurrentAccount();

    // Determine packageId based on the current network
    let packageId: string = CONTRACT_PACKAGE_ID_NOT_DEFINED;
    if (network) {
        switch (network) {
            case 'localnet': packageId = LOCALNET_CONTRACT_PACKAGE_ID; break;
            case 'devnet': packageId = DEVNET_CONTRACT_PACKAGE_ID; break;
            case 'testnet': packageId = TESTNET_CONTRACT_PACKAGE_ID; break;
            case 'mainnet': packageId = MAINNET_CONTRACT_PACKAGE_ID; break;
        }
    }

    useEffect(() => {
        const findCap = async () => {
            if (!currentAccount?.address || !gameId || !network || packageId === CONTRACT_PACKAGE_ID_NOT_DEFINED) {
                setAdminCapId(null);
                setIsLoading(false);
                setError(!currentAccount?.address ? 'Wallet not connected' : !gameId ? 'No Game ID' : 'Network or Package ID invalid');
                return;
            }

            setIsLoading(true);
            setError(null);
            setAdminCapId(null);

            const adminCapType = `${normalizeSuiObjectId(packageId)}::game::AdminCap`;

            try {
                console.log(`Searching for AdminCap of type ${adminCapType} for game ${gameId} owned by ${currentAccount.address}`);
                let allOwnedAdminCaps: { objectId: string; game_id?: string }[] = [];
                let cursor: string | null | undefined = null;
                let hasNextPage = true;

                while(hasNextPage) {
                    const response = await client.getOwnedObjects({
                        owner: currentAccount.address,
                        filter: { StructType: adminCapType },
                        options: { showType: true, showContent: true }, // Need content to check game_id
                        cursor: cursor,
                        // limit: 50 // Consider adding limit for performance
                    });

                    const capsOnPage = response.data
                        .map(obj => {
                            const fields = obj.data?.content?.dataType === 'moveObject' ? obj.data.content.fields as any : null;
                            return {
                                objectId: obj.data?.objectId ?? '',
                                // IMPORTANT: Assumes AdminCap struct has a field named 'game_id' containing the game's ID
                                game_id: fields?.game_id as string | undefined 
                            };
                        })
                        .filter(cap => cap.objectId && cap.game_id); // Filter out invalid caps
                    
                    allOwnedAdminCaps = [...allOwnedAdminCaps, ...capsOnPage];

                    cursor = response.nextCursor;
                    hasNextPage = response.hasNextPage;
                     console.log(`Found ${capsOnPage.length} AdminCaps on this page. Has next page: ${hasNextPage}`);
                }
                
                console.log(`Found total ${allOwnedAdminCaps.length} AdminCaps owned by user. Searching for game ID ${gameId}...`);

                // Find the specific AdminCap for the given gameId
                const foundCap = allOwnedAdminCaps.find(cap => cap.game_id === gameId);

                if (foundCap) {
                    console.log(`Found matching AdminCap: ${foundCap.objectId}`);
                    setAdminCapId(foundCap.objectId);
                } else {
                     console.log(`No AdminCap found for game ${gameId} owned by ${currentAccount.address}`);
                     setAdminCapId(null); // Explicitly set to null if not found
                }

            } catch (err: any) {
                console.error("Failed to fetch or find user AdminCap:", err);
                setError(`Could not check for AdminCap: ${err.message || 'Unknown error'}`);
                setAdminCapId(null);
            } finally {
                setIsLoading(false);
            }
        };

        findCap();
        // Dependencies: user address, gameId, client, network, packageId
    }, [client, currentAccount?.address, gameId, network, packageId]);

    return { adminCapId, isLoading, error };
} 