import { useSuiClientQuery } from '@mysten/dapp-kit'

/**
 * Fetches the dynamic fields (registered games) for a given Dashboard object ID.
 * Assumes the dynamic field's value is the game ID itself (type ID).
 */
const useDashboardGames = (dashboardObjectId: string | null | undefined) => {
  return useSuiClientQuery(
    'getDynamicFields',
    {
      parentId: dashboardObjectId as string,
      limit: 50, // Adjust limit or implement pagination if needed
    },
    {
      enabled: !!dashboardObjectId,
      refetchOnWindowFocus: false, 
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  )
}

/**
 * Helper function to extract game IDs from the dynamic fields response.
 */
export const getGameIdsFromDynamicFields = (data: any): string[] => {
  if (!data || !data.data) {
    return []
  }
  // Assuming the field name or value contains the game ID
  // Modify this logic if the structure is different
  return data.data.map((field: { objectId: string }) => field.objectId) // Or field.name.id, field.value.fields.id etc.
}

export default useDashboardGames 