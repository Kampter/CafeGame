import React, { FC, useMemo } from 'react'
import { ConnectButton } from '@mysten/dapp-kit'
import { Link } from '@radix-ui/themes'
import { Coffee } from 'lucide-react'
import BalanceBadge from '../ui/BalanceBadge'
import {
  useCurrentAccount,
  useSuiClientContext,
  useSuiClientQuery,
} from '@mysten/dapp-kit'

const Header: FC = () => {
  const currentAccount = useCurrentAccount()
  const ctx = useSuiClientContext()
  const networkName = ctx.network

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Coffee className="h-6 w-6" />
          <span className="font-bold">
            {import.meta.env.VITE_APP_NAME || 'Sui DApp'}
          </span>
        </Link>

        <nav className="flex items-center space-x-6 text-sm font-medium mr-6">
          {/* <a href="#">Games</a> */}
          {/* <a href="#">Reviews</a> */}
        </nav>

        <div className="ml-auto flex flex-shrink-0 items-center space-x-4">
          {networkName && (
            <div className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
              {networkName.toUpperCase()}
            </div>
          )}
          <BalanceBadge className="text-sm" />
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}

export default Header
