import { BrowserRouter } from 'react-router-dom'
import '@mysten/dapp-kit/dist/index.css'

import {
  SuiClientProvider,
  WalletProvider,
  createNetworkConfig,
} from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FC, StrictMode } from 'react'

import AppRoutes from '@/routes'
import DashboardManager from './DashboardManager'
import Footer from './layout/Footer'
import Header from './layout/Header'
import NetworkSupportChecker from './NetworkSupportChecker'

const { networkConfig } = createNetworkConfig({
  localnet: { url: getFullnodeUrl('localnet') },
  devnet: { url: getFullnodeUrl('devnet') },
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
})
const queryClient = new QueryClient()

const App: FC = () => {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
          <WalletProvider>
            <BrowserRouter>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <NetworkSupportChecker>
                  <main className="flex-1">
                    <DashboardManager />
                    <AppRoutes />
                  </main>
                </NetworkSupportChecker>
                <Footer />
              </div>
            </BrowserRouter>
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}

export default App
