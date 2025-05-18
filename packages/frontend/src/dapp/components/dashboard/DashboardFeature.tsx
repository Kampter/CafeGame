import { FC } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
// Adjust import paths for moved components
import CreateDashboardForm from './CreateDashboardForm'
import DashboardManager from './DashboardManager'
import CustomConnectButton from '~~/components/CustomConnectButton'
import { Flex, Heading, Separator } from '@radix-ui/themes'
import { HARDCODED_DASHBOARD_ID } from '~~/dapp/config/network';

// Removed getResponseObjectId helper as it's no longer needed here

/**
 * Main component for the Dashboard feature.
 * Handles wallet connection and renders the manager for a specific dashboard
 * Also provides the creation form for debugging purposes.
 */
const DashboardFeature: FC = () => {
  const currentAccount = useCurrentAccount()
  
  // Removed useOwnDashboards hook call and its states (isLoadingDashboards, dashboardsError, refetchDashboards, dashboardsData)

  // 1. Check for wallet connection
  if (!currentAccount) {
    return <CustomConnectButton />
  }

  // No longer need loading/error states for fetching dashboards here
  // Loading/error states within DashboardManager (for games) are handled internally by it.

  // 2. Always render the DashboardManager with the hardcoded ID
  //    and the CreateDashboardForm below it for debugging.
  return (
    <Flex direction="column" align="center" gap="6" className="w-full">
      
      {/* Section for managing the hardcoded dashboard */}
      <DashboardManager dashboardId={HARDCODED_DASHBOARD_ID} />

      <Separator my="4" size="4" />

      {/* Section for creating new dashboards (for debugging) */}
      <Flex direction="column" align="center" gap="4" className="w-full">
        <Heading size="4" color="gray">Debug: Create New Dashboard</Heading>
        {/* Removed onSuccess callback as refetchDashboards doesn't exist here anymore */}
        <CreateDashboardForm /> 
      </Flex>

    </Flex>
  )
}

export default DashboardFeature 