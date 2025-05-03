import React, { FC, useMemo } from 'react'
import {
  useCurrentAccount,
  useSuiClientQuery,
} from '@mysten/dapp-kit'
// import { MIST_PER_SUI } from '@mysten/sui/client' // 移除旧的导入
import { MIST_PER_SUI } from '@mysten/sui/utils' // 从 /utils 导入
import { Badge } from '@radix-ui/themes' // 使用 Radix UI Badge

interface BalanceBadgeProps {
  // 可以添加其他 props，例如 className
  className?: string;
}

const BalanceBadge: FC<BalanceBadgeProps> = ({ className }) => {
  const currentAccount = useCurrentAccount()

  // 获取余额
  const { data: balanceData, isLoading, error } = useSuiClientQuery(
    'getBalance',
    {
      owner: currentAccount?.address as string,
    },
    {
      enabled: !!currentAccount, // 仅当账户连接时才查询
      // refetchInterval: 3000, // 如果需要像 suiware 一样自动刷新，可以取消注释
    }
  )

  // 格式化余额
  const formattedBalance = useMemo(() => {
    if (!balanceData) {
      return null // 或者 '0 SUI' 或其他占位符
    }
    // 注意：balanceData.totalBalance 是 string 类型
    const balanceInSui = Number(balanceData.totalBalance) / Number(MIST_PER_SUI)
    // 可以根据需要调整小数位数
    return balanceInSui.toFixed(4)
  }, [balanceData])

  // 钱包未连接时不显示
  if (!currentAccount) {
    return null
  }
  
  // 加载中或获取余额失败时显示占位符或错误信息
  if (isLoading) {
    return (
      <Badge variant="surface" color="gray" className={className}>
        Loading...
      </Badge>
    )
  }

  if (error || formattedBalance === null) {
     return (
      <Badge variant="surface" color="red" className={className}>
        Error
      </Badge>
    )   
  }

  // 成功获取并格式化余额
  return (
    <Badge variant="surface" color="green" className={className}>
      {formattedBalance} SUI
    </Badge>
  )
}

export default BalanceBadge 