import { SuiSignAndExecuteTransactionOutput } from '@mysten/wallet-standard'
import useTransact from '@suiware/kit/useTransact'
import { useState } from 'react'
import { 
    CONTRACT_PACKAGE_VARIABLE_NAME,
    EXPLORER_URL_VARIABLE_NAME, 
    CONTRACT_PACKAGE_ID_NOT_DEFINED 
} from '~~/config/network'
import {
  prepareCreateDashboardTransaction,
  prepareRegisterGameTransaction,
  prepareUnregisterGameTransaction,
} from '~~/dapp/helpers/dashboardTransactions' // Assuming this file will be created
import { transactionUrl } from '~~/helpers/network'
import { notification } from '~~/helpers/notification'
import useNetworkConfig from '~~/hooks/useNetworkConfig'

// --- Create Dashboard --- 

export const useCreateDashboardMutation = (options?: {
  onSuccess?: (data: SuiSignAndExecuteTransactionOutput) => void
}) => {
  const [notificationId, setNotificationId] = useState<string>()
  const { useNetworkVariable } = useNetworkConfig()
  const explorerUrl = useNetworkVariable(EXPLORER_URL_VARIABLE_NAME)
  const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME)

  const mutation = useTransact({
    onBeforeStart: () => {
      if (packageId === CONTRACT_PACKAGE_ID_NOT_DEFINED) {
          notification.error(null, 'Contract Package ID is not defined in config')
          return false 
      }
      const nId = notification.txLoading()
      setNotificationId(nId)
      return true
    },
    onSuccess: (data: SuiSignAndExecuteTransactionOutput) => {
      notification.txSuccess(
        transactionUrl(explorerUrl, data.digest),
        notificationId
      )
      options?.onSuccess?.(data) 
    },
    onError: (e: Error) => {
      notification.txError(e, null, notificationId)
    },
  })

  const createDashboard = (serviceName: string) => {
    if (packageId === CONTRACT_PACKAGE_ID_NOT_DEFINED) return; 
    const tx = prepareCreateDashboardTransaction(packageId, serviceName)
    mutation.transact(tx)
  }

  return { ...mutation, createDashboard }
}

// --- Register Game --- 

export const useRegisterGameMutation = (options?: {
  onSuccess?: (data: SuiSignAndExecuteTransactionOutput) => void
}) => {
  const [notificationId, setNotificationId] = useState<string>()
  const { useNetworkVariable } = useNetworkConfig()
  const explorerUrl = useNetworkVariable(EXPLORER_URL_VARIABLE_NAME)
  const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME)

  const mutation = useTransact({
    onBeforeStart: () => {
      if (packageId === CONTRACT_PACKAGE_ID_NOT_DEFINED) {
        notification.error(null, 'Contract Package ID is not defined in config')
        return false 
      }
      const nId = notification.txLoading()
      setNotificationId(nId)
      return true
    },
    onSuccess: (data: SuiSignAndExecuteTransactionOutput) => {
      notification.txSuccess(
        transactionUrl(explorerUrl, data.digest),
        notificationId
      )
      options?.onSuccess?.(data)
    },
    onError: (e: Error) => {
      notification.txError(e, null, notificationId)
    },
  })

  const registerGame = (dashboardObjectId: string, gameId: string) => {
    if (packageId === CONTRACT_PACKAGE_ID_NOT_DEFINED) return;
    const tx = prepareRegisterGameTransaction(packageId, dashboardObjectId, gameId)
    mutation.transact(tx)
  }

  return { ...mutation, registerGame }
}

// --- Unregister Game --- 

export const useUnregisterGameMutation = (options?: {
  onSuccess?: (data: SuiSignAndExecuteTransactionOutput) => void
}) => {
  const [notificationId, setNotificationId] = useState<string>()
  const { useNetworkVariable } = useNetworkConfig()
  const explorerUrl = useNetworkVariable(EXPLORER_URL_VARIABLE_NAME)
  const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME)

  const mutation = useTransact({
    onBeforeStart: () => {
      if (packageId === CONTRACT_PACKAGE_ID_NOT_DEFINED) {
        notification.error(null, 'Contract Package ID is not defined in config')
        return false 
      }
      const nId = notification.txLoading()
      setNotificationId(nId)
      return true
    },
    onSuccess: (data: SuiSignAndExecuteTransactionOutput) => {
      notification.txSuccess(
        transactionUrl(explorerUrl, data.digest),
        notificationId
      )
      options?.onSuccess?.(data)
    },
    onError: (e: Error) => {
      notification.txError(e, null, notificationId)
    },
  })

  const unregisterGame = (dashboardObjectId: string, gameId: string) => {
    if (packageId === CONTRACT_PACKAGE_ID_NOT_DEFINED) return;
    const tx = prepareUnregisterGameTransaction(packageId, dashboardObjectId, gameId)
    mutation.transact(tx)
  }

  return { ...mutation, unregisterGame }
} 