import {
  useCurrentAccount,
  useSuiClient,
  useSuiClientContext,
} from '@mysten/dapp-kit'
import { Link } from '@radix-ui/themes'
import { Button } from '../ui/Button'
import { HeartIcon, SearchIcon, DropletIcon } from 'lucide-react'
// import ThemeSwitcher from '~~/components/ThemeSwitcher' // Removed
import {
  CONTRACT_PACKAGE_VARIABLE_NAME,
  EXPLORER_URL_VARIABLE_NAME,
} from '~~/config/network'
import { packageUrl } from '~~/helpers/network'
import { notification } from '~~/helpers/notification'
import useNetworkConfig from '~~/hooks/useNetworkConfig'
import { FC, useState } from 'react'

const CustomFaucetButton: FC = () => {
  const currentAccount = useCurrentAccount()
  const { network } = useSuiClientContext()

  const isFaucetAvailable = network === 'devnet' || network === 'testnet' || network === 'localnet'
  const faucetUrl = "https://faucet.sui.io/"

  if (!currentAccount || !isFaucetAvailable) {
    return null
  }

  const targetUrl = `${faucetUrl}?address=${currentAccount.address}`;

  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="flex items-center gap-1"
    >
      <a href={targetUrl} target="_blank" rel="noopener noreferrer">
        <DropletIcon className="h-4 w-4" />
        <span>Request SUI</span>
      </a>
    </Button>
  )
}

const Footer: FC = () => {
  const { useNetworkVariables } = useNetworkConfig()
  const networkVariables = useNetworkVariables()
  const explorerUrl = networkVariables[EXPLORER_URL_VARIABLE_NAME]
  const packageId = networkVariables[CONTRACT_PACKAGE_VARIABLE_NAME]
  const currentAccount = useCurrentAccount()

  return (
    <footer className="flex w-full flex-col items-center justify-between gap-3 p-3 sm:flex-row sm:items-end border-t border-realm-border bg-realm-surface-secondary">
      <div className="flex flex-row gap-3 lg:w-1/3">
        <CustomFaucetButton />
        {explorerUrl && packageId && packageId !== '0x0' && (
            <Link
              href={packageUrl(explorerUrl, packageId)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-row items-center gap-1 text-realm-text-secondary hover:text-realm-text-primary transition-colors"
            >
              <SearchIcon className="h-4 w-4" />
              <span>Block Explorer</span>
            </Link>
        )}
      </div>

      <div className="flex flex-grow flex-col items-center justify-center gap-1">
        <div className="text-center text-sm opacity-70">
          SVG graphics, used in NFTs, have been borrowed from{' '}
          <Link
            href="https://github.com/twitter/twemoji"
            target="_blank"
            rel="noopener noreferrer"
            className="text-realm-text-secondary hover:text-realm-text-primary transition-colors"
          >
            twitter/twemoji
          </Link>
          <br />
          and licensed under{' '}
          <Link
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-realm-text-secondary hover:text-realm-text-primary transition-colors"
          >
            CC-BY 4.0
          </Link>
        </div>
      </div>

      <div className="flex flex-row justify-end lg:w-1/3">
        {/* <ThemeSwitcher /> // Removed */}
      </div>
    </footer>
  )
}
export default Footer
