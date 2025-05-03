import { Transaction } from '@mysten/sui/transactions';
import { ObjectId } from '~~/dapp/types/game'; // Use types consistently

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
 * Prepares the transaction block to create a new Game.
 */
export function prepareCreateGameTransaction(
  packageId: string,
  name: string,
  genre: string,
  platform: string,
  price: string, // Price as string (representing u64)
  description: string
): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${packageId}::game::create_game`,
    arguments: [
      tx.pure.string(name),
      tx.pure.string(genre),
      tx.pure.string(platform),
      tx.pure.u64(BigInt(price)), // Convert string price to BigInt for u64
      tx.pure.string(description),
    ],
  });
  // The function returns the game_id, but the Transaction block itself
  // doesn't automatically capture it for direct use here in the prepare step.
  // The result needs to be handled in the mutation's onSuccess if needed.
  return tx;
}

// Add other transaction helpers here later...
// e.g., prepareCreateReviewTransaction, prepareUpvoteReviewTransaction etc. 