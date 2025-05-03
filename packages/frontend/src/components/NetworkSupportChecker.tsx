import {
  useCurrentAccount,
  useCurrentWallet,
  useSuiClientContext,
} from '@mysten/dapp-kit'
import { FC, ReactNode, useMemo } from 'react'
import { isNetworkSupported, supportedNetworks } from '~~/helpers/network'
import { ENetwork } from '~~/types/ENetwork'

const getNetworkNameFromChain = (chain: string | undefined): string | undefined => {
  if (!chain) return undefined
  const parts = chain.split(':')
  return parts[1]
}

const stringToENetwork = (name: string | undefined): ENetwork | undefined => {
  if (!name) return undefined;
  const lowerCaseName = name.toLowerCase();
  return Object.values(ENetwork).includes(lowerCaseName as ENetwork)
    ? (lowerCaseName as ENetwork)
    : undefined;
}

interface NetworkSupportCheckerProps {
  children: ReactNode
}

const NetworkSupportChecker: FC<NetworkSupportCheckerProps> = ({ children }) => {
  const currentAccount = useCurrentAccount()
  const { currentWallet } = useCurrentWallet()

  const walletChain = currentWallet?.accounts?.[0]?.chains?.[0]
  const walletNetworkName = useMemo(() => getNetworkNameFromChain(walletChain), [walletChain])
  const walletNetworkEnum = useMemo(() => stringToENetwork(walletNetworkName), [walletNetworkName])

  const okNetworks = supportedNetworks()

  if (!currentAccount || okNetworks.length === 0) {
    return <>{children}</>
  }

  if (walletNetworkEnum && isNetworkSupported(walletNetworkEnum)) {
    return <>{children}</>
  }

  return (
    <>
      <div className="mx-auto w-full max-w-lg px-3 py-2">
        <div className="w-full rounded border border-red-400 bg-red-50 px-3 py-2 text-center text-red-600">
          {walletNetworkName ? (
            <>
              The connected network <span className="font-bold">{walletNetworkName.toUpperCase()}</span> is not currently supported by the app.
            </>
          ) : (
            <>
              Could not detect the network from the connected wallet.
            </>
          )}
          <br />
          Please switch to a supported network [
          <span className="font-bold">{okNetworks.join(', ')}</span>] in your wallet settings.
        </div>
      </div>
    </>
  )
}

export default NetworkSupportChecker
