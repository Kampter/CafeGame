import { SuiSignAndExecuteTransactionOutput } from '@mysten/wallet-standard'
import {
  useSignAndExecuteTransaction,
} from '@mysten/dapp-kit'
import { 
    CONTRACT_PACKAGE_VARIABLE_NAME,
    EXPLORER_URL_VARIABLE_NAME, 
    CONTRACT_PACKAGE_ID_NOT_DEFINED 
} from '~~/config/network'
import {
  prepareCreateDashboardTransaction,
  prepareRegisterGameTransaction,
  prepareUnregisterGameTransaction,
} from '~~/dapp/helpers/dashboardTransactions'
import { transactionUrl } from '~~/helpers/network'
import { notification } from '~~/helpers/notification'
import useNetworkConfig from '~~/hooks/useNetworkConfig'

// --- Create Dashboard --- 

export const useCreateDashboardMutation = (options?: {
  onSuccess?: (data: SuiSignAndExecuteTransactionOutput) => void
}) => {
  const { useNetworkVariable } = useNetworkConfig()
  const explorerUrl = useNetworkVariable(EXPLORER_URL_VARIABLE_NAME)
  const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME)

  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction()

  const createDashboard = (serviceName: string) => {
      if (packageId === CONTRACT_PACKAGE_ID_NOT_DEFINED) {
          notification.error(null, 'Contract Package ID is not defined in config')
        return; 
      }
    
    let notificationId: string | undefined;
    try {
      notificationId = notification.txLoading()
      const tx = prepareCreateDashboardTransaction(packageId, serviceName)
      
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result: SuiSignAndExecuteTransactionOutput) => {
      notification.txSuccess(
              transactionUrl(explorerUrl, result.digest),
        notificationId
      )
            options?.onSuccess?.(result)
    },
          onError: (error: Error) => {
            console.error('Transaction failed', error)
            notification.txError(error, null, notificationId)
    },
        }
      )
    } catch (e) {
      console.error('Error preparing transaction', e)
      if (notificationId) {
        notification.txError(e as Error, 'Error preparing transaction', notificationId)
      } else {
        notification.error(e as Error, 'Error preparing transaction')
      }
    }
  }

  return { createDashboard, isLoading: isPending }
}

// --- Register Game --- 

export const useRegisterGameMutation = (options?: {
  onSuccess?: (data: SuiSignAndExecuteTransactionOutput) => void
}) => {
  const { useNetworkVariable } = useNetworkConfig()
  const explorerUrl = useNetworkVariable(EXPLORER_URL_VARIABLE_NAME)
  const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME)
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction()

  const registerGame = (dashboardObjectId: string, gameId: string) => {
      if (packageId === CONTRACT_PACKAGE_ID_NOT_DEFINED) {
        notification.error(null, 'Contract Package ID is not defined in config')
      return;
      }
    let notificationId: string | undefined;
    try {
      notificationId = notification.txLoading()
      const tx = prepareRegisterGameTransaction(packageId, dashboardObjectId, gameId)
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result: SuiSignAndExecuteTransactionOutput) => {
      notification.txSuccess(
              transactionUrl(explorerUrl, result.digest),
        notificationId
      )
            options?.onSuccess?.(result)
    },
          onError: (error: Error) => {
            console.error('Transaction failed', error)
            notification.txError(error, null, notificationId)
    },
        }
      )
    } catch (e) {
      console.error('Error preparing transaction', e)
      if (notificationId) {
        notification.txError(e as Error, 'Error preparing transaction', notificationId)
      } else {
        notification.error(e as Error, 'Error preparing transaction')
      }
    }
  }

  return { registerGame, isLoading: isPending }
}

// --- Unregister Game --- 

export const useUnregisterGameMutation = (options?: {
  onSuccess?: (data: SuiSignAndExecuteTransactionOutput) => void
}) => {
  const { useNetworkVariable } = useNetworkConfig()
  const explorerUrl = useNetworkVariable(EXPLORER_URL_VARIABLE_NAME)
  const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME)
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction()

  const unregisterGame = (dashboardObjectId: string, gameId: string) => {
      if (packageId === CONTRACT_PACKAGE_ID_NOT_DEFINED) {
        notification.error(null, 'Contract Package ID is not defined in config')
      return;
      }
    let notificationId: string | undefined;
    try {
      notificationId = notification.txLoading()
      const tx = prepareUnregisterGameTransaction(packageId, dashboardObjectId, gameId)
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result: SuiSignAndExecuteTransactionOutput) => {
      notification.txSuccess(
              transactionUrl(explorerUrl, result.digest),
        notificationId
      )
            options?.onSuccess?.(result)
    },
          onError: (error: Error) => {
            console.error('Transaction failed', error)
            notification.txError(error, null, notificationId)
    },
        }
      )
    } catch (e) {
      console.error('Error preparing transaction', e)
      if (notificationId) {
        notification.txError(e as Error, 'Error preparing transaction', notificationId)
      } else {
        notification.error(e as Error, 'Error preparing transaction')
      }
    }
  }

  return { unregisterGame, isLoading: isPending }
} 