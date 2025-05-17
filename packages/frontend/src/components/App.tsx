import '@mysten/dapp-kit/dist/index.css'
import '@radix-ui/themes/styles.css'
// import '@suiware/kit/main.css' // 移除 CSS
// import SuiProvider from '@suiware/kit/SuiProvider' // 移除 Provider

// 引入官方 Provider 和相关依赖
import {
  SuiClientProvider,
  WalletProvider,
  // createNetworkConfig, // networkConfig 现在来自 useNetworkConfig Hook
} from '@mysten/dapp-kit'
// import { getFullnodeUrl } from '@mysten/sui/client' // 不再需要，由 useNetworkConfig 处理
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { Theme as RadixTheme } from '@radix-ui/themes'
import { FC, StrictMode } from 'react'
import { APP_NAME } from '~~/config/main'
import { getThemeSettings } from '~~/helpers/theme'
import useNetworkConfig from '~~/hooks/useNetworkConfig' // 保留这个 Hook
// import ThemeProvider from '~~/providers/ThemeProvider' // <-- Remove or comment out default import
import { ThemeProvider as CustomThemeProvider } from '~~/providers/ThemeProvider' // <-- Add named import and alias
import '~~/styles/index.css'
import { ENetwork } from '~~/types/ENetwork'
// import { DappRouterProvider } from '~~/dapp/routes' // Incorrect: This export no longer exists
import { router } from '~~/dapp/routes/index' // Correct: Import the router instance
import { RouterProvider } from 'react-router-dom' // Correct: Import the provider component

const themeSettings = getThemeSettings()
const queryClient = new QueryClient() // 创建 QueryClient 实例

const App: FC = () => {
  const { networkConfig } = useNetworkConfig() // 获取网络配置

  // 旧实现
  // return (
  //   <StrictMode>
  //     <ThemeProvider>
  //       <SuiProvider
  //         customNetworkConfig={networkConfig}
  //         defaultNetwork={ENetwork.TESTNET}
  //         walletAutoConnect={false}
  //         walletStashedName={APP_NAME}
  //         themeSettings={themeSettings}
  //       >
  //         <DappRouterProvider />
  //       </SuiProvider>
  //     </ThemeProvider>
  //   </StrictMode>
  // )
  
  // 新实现，使用官方 Provider
  return (
    <StrictMode>
      {/* CustomThemeProvider for forcing dark mode via class on html tag */}
      <CustomThemeProvider> 
        {/* TooltipProvider from @radix-ui/react-tooltip, should be high up */}
        <TooltipProvider>
          {/* Radix UI Theme Provider from @radix-ui/themes */}
          <RadixTheme appearance="dark" accentColor="cyan" grayColor="mauve" panelBackground="solid" radius="medium">
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={networkConfig} defaultNetwork={ENetwork.TESTNET}>
            <WalletProvider 
                  autoConnect={false} 
                  preferredWallets={[APP_NAME]} 
            >
              <RouterProvider router={router} />
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
          </RadixTheme>
        </TooltipProvider>
      </CustomThemeProvider>
    </StrictMode>
  )
}

export default App
