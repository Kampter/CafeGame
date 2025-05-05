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
import { FC, StrictMode } from 'react'
import { APP_NAME } from '~~/config/main'
import { getThemeSettings } from '~~/helpers/theme'
import useNetworkConfig from '~~/hooks/useNetworkConfig' // 保留这个 Hook
import ThemeProvider from '~~/providers/ThemeProvider'
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
      <ThemeProvider> { /* 保留你的 ThemeProvider */ }
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={networkConfig} defaultNetwork={ENetwork.TESTNET}>
            <WalletProvider 
              autoConnect={false} // 保持原配置
              // theme={themeSettings} // WalletProvider 的 theme 可能与你的 ThemeProvider 冲突或冗余，先注释掉
              preferredWallets={[APP_NAME]} // 使用正确的属性名
            >
              {/* 假设 DappRouterProvider 包含 BrowserRouter 和页面内容 */}
              {/* <DappRouterProvider /> */}
              {/* Use the RouterProvider with the imported router instance */}
              <RouterProvider router={router} />
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  )
}

export default App
