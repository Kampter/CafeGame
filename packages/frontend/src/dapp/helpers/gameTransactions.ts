import { Transaction } from '@mysten/sui/transactions';
import { ObjectId } from '~~/dapp/types/game.types'; // Corrected path
import { CONTRACT_PACKAGE_ID_NOT_DEFINED } from '~~/config/network';

/**
 * Prepares the transaction block to purchase a game.
 * Assumes the payment Coin object ID is provided.
 */
export function preparePurchaseGameTransaction(
  packageId: string,
  gameObjectId: ObjectId,
  paymentCoinObjectId: ObjectId // The specific Coin<SUI> object to use for payment
): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${packageId}::game::purchase_game`,
    arguments: [
      tx.object(gameObjectId), // The Game object
      tx.object(paymentCoinObjectId), // The Coin<SUI> object for payment
    ],
  });
  return tx;
}

/**
 * Prepares the Transaction object for the `create_game` Move function.
 * NOTE: Now excludes blobId as per the new flow.
 *
 * @param name Game name.
 * @param genre Game genre.
 * @param platform Game platform.
 * @param price Game price (in MIST).
 * @param description Game description.
 * @param packageId The Move package ID where the game module resides.
 * @param dashboardId The ID of the dashboard object.
 * @returns Transaction object.
 */
export function prepareCreateGameTransaction(
    name: string,
    genre: string,
    platform: string,
    price: string, 
    description: string,
    packageId: string,
    dashboardId: string // Add dashboardId as argument
): Transaction {
    if (packageId === CONTRACT_PACKAGE_ID_NOT_DEFINED) {
        throw new Error('Contract Package ID not defined');
    }
    if (!dashboardId || dashboardId === '0x0') { // Basic check for dashboardId
        throw new Error('Dashboard Object ID not defined or invalid');
    }

    const tx = new Transaction();

    // Validate price is a non-negative integer string before converting
    let priceU64: bigint;
    try {
        priceU64 = BigInt(price);
        if (priceU64 < 0) {
            throw new Error('Price cannot be negative.');
        }
    } catch (e) {
        console.error("Invalid price format for u64 conversion:", price, e);
        throw new Error('Invalid price format. Please enter a valid non-negative integer for MIST.');
    }

    // --- Call 1: Create the game --- 
    // create_game is expected to return the new game ID
    const createGameCallResult = tx.moveCall({
        target: `${packageId}::game::create_game`,
        arguments: [
            tx.pure.string(name),
            tx.pure.string(genre),
            tx.pure.string(platform),
            // Convert price string to u64 using BigInt
            tx.pure.u64(priceU64), 
            tx.pure.string(description),
            // Add empty string for game_package_bolb_id to match current Move signature
            tx.pure.string(""), 
        ],
    });

    // --- Call 2: Register the game to the dashboard --- 
    tx.moveCall({
        target: `${packageId}::dashboard::register_game`,
        arguments: [
            tx.object(dashboardId),      // The dashboard object
            createGameCallResult,      // Use the result (gameId) from the previous call
        ],
    });

    return tx;
}

/**
 * Prepares the Transaction object for the `associate_blob_to_game` Move function.
 *
 * @param gameId The ID of the Game object.
 * @param adminCapId The ID of the AdminCap object associated with the game.
 * @param blobId The Blob ID obtained from Walrus after uploading the encrypted file.
 * @param packageId The Move package ID where the game module resides.
 * @returns Transaction object.
 */
export function prepareAssociateBlobTransaction(
    gameId: string,
    adminCapId: string, // Assuming we can get this ID
    blobId: string,
    packageId: string
): Transaction {
    if (packageId === CONTRACT_PACKAGE_ID_NOT_DEFINED) {
        throw new Error(CONTRACT_PACKAGE_ID_NOT_DEFINED);
    }
    const tx = new Transaction();

    tx.moveCall({
        target: `${packageId}::game::associate_blob_to_game`,
        arguments: [
            tx.object(gameId),       // Pass the Game object ID
            tx.object(adminCapId),   // Pass the AdminCap object ID
            tx.pure.string(blobId),
        ],
    });

    return tx;
}

// Add other transaction helpers here later...
// e.g., prepareCreateReviewTransaction, prepareUpvoteReviewTransaction etc. 