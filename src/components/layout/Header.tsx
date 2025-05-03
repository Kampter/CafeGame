import React, { FC, useMemo } from 'react'
// import Balance from '@suiware/kit/Balance'
// import NetworkType from '@suiware/kit/NetworkType'

import {
  ConnectButton,
  useCurrentAccount,
  useSuiClientContext,
  useSuiClientQuery,
} from '@mysten/dapp-kit'
import { formatAddress } from '@mysten/sui/utils' // 用于格式化地址
import { MIST_PER_SUI } from '@mysten/sui/client' // 用于余额转换

import Logo from '@/assets/logo.svg'

const Header: FC = () => {
  const currentAccount = useCurrentAccount()
  const ctx = useSuiClientContext()
  const networkName = ctx.network

  // 获取余额
  const { data: balanceData, isLoading: isBalanceLoading } = useSuiClientQuery(
    'getBalance',
    {
      owner: currentAccount?.address as string,
    },
    {
      enabled: !!currentAccount, // 仅当账户连接时才查询
    }
  )

  // 格式化余额
  const formattedBalance = useMemo(() => {
    if (!balanceData || isBalanceLoading) {
      return 'Loading...'
    }
    const balanceInSui = Number(balanceData.totalBalance) / Number(MIST_PER_SUI)
    return `${balanceInSui.toFixed(4)} SUI`
  }, [balanceData, isBalanceLoading])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center space-x-4">
        {/* Logo Section */}
        <div className="mr-4 flex items-center">
          <img src={Logo} alt="Logo" className="mr-2 h-6 w-6" />
          <span className="font-bold">Sui TapTap</span>
        </div>

        {/* Navigation Placeholder - Can be added later */}
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          {/* <a href="#">Games</a> */}
          {/* <a href="#">Reviews</a> */}
        </nav>

        {/* Right Section - Network, Balance, Connect Button */}
        <div className="flex items-center space-x-4">
          {networkName && (
            <div className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
              {networkName.toUpperCase()}
            </div>
          )}
          {/* <NetworkType /> */}
          {currentAccount && (
            <div className="text-sm">
              <span className="font-medium">Balance:</span> {formattedBalance}
              {/* <Balance /> */} { /* 原 Balance 组件 */}
            </div>
          )}
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}

export default Header 