import { ConnectModal, useCurrentAccount } from '@mysten/dapp-kit'
// import { Button as RadixButton } from '@radix-ui/themes'
import { Button } from '~~/components/ui/Button'

const CustomConnectButton = () => {
  const currentAccount = useCurrentAccount()

  return (
    <ConnectModal
      trigger={
        <Button 
          variant="primary"
          size="lg"
        >
          {currentAccount ? 'Wallet Connected' : 'Connect Wallet'}
        </Button>
      }
    />
  )
}

export default CustomConnectButton
