import { Transaction } from '@mysten/sui/transactions'

/**
 * Prepares the transaction block to create a new Dashboard.
 */
export function prepareCreateDashboardTransaction(
  packageId: string,
  serviceName: string
): Transaction {
  const tx = new Transaction()
  tx.moveCall({
    // Assuming module name is 'dashboard' within the package
    target: `${packageId}::dashboard::create_dashboard`,
    arguments: [tx.pure.string(serviceName)],
  })
  return tx
}

/**
 * Prepares the transaction block to register a game to a Dashboard.
 */
export function prepareRegisterGameTransaction(
  packageId: string,
  dashboardObjectId: string,
  gameId: string
): Transaction {
  const tx = new Transaction()
  tx.moveCall({
    target: `${packageId}::dashboard::register_game`,
    arguments: [tx.object(dashboardObjectId), tx.pure.id(gameId)],
  })
  return tx
}

/**
 * Prepares the transaction block to unregister a game from a Dashboard.
 */
export function prepareUnregisterGameTransaction(
  packageId: string,
  dashboardObjectId: string,
  gameId: string
): Transaction {
  const tx = new Transaction()
  tx.moveCall({
    target: `${packageId}::dashboard::unregister_game`,
    arguments: [tx.object(dashboardObjectId), tx.pure.id(gameId)],
  })
  return tx
} 