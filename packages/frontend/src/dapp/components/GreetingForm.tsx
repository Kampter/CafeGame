import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from '@mysten/dapp-kit'
import {
  SuiTransactionBlockResponseOptions,
} from '@mysten/sui/client'
import { Button, TextField } from '@radix-ui/themes'
import { ChangeEvent, FC, MouseEvent, PropsWithChildren, useState } from 'react'
import CustomConnectButton from '~~/components/CustomConnectButton'
import Loading from '~~/components/Loading'
import {
  CONTRACT_PACKAGE_VARIABLE_NAME,
  EXPLORER_URL_VARIABLE_NAME,
} from '~~/config/network'
import AnimalEmoji from '~~/dapp/components/Emoji'
import {
  prepareCreateGreetingTransaction,
  prepareResetGreetingTransaction,
  prepareSetGreetingTransaction,
} from '~~/dapp/helpers/transactions'
import useOwnGreeting from '~~/dapp/hooks/useOwnGreeting'
import {
  getResponseContentField,
  getResponseDisplayField,
  getResponseObjectId,
  transactionUrl,
} from '~~/helpers/network'
import { notification } from '~~/helpers/notification'
import useNetworkConfig from '~~/hooks/useNetworkConfig'

const WAIT_FOR_TX_OPTIONS: SuiTransactionBlockResponseOptions = {
  showEffects: true,
  showObjectChanges: true,
}

const GreetingForm: FC = () => {
  const [name, setName] = useState<string>('')
  const currentAccount = useCurrentAccount()
  const { data, isPending: isQueryPending, error, refetch } = useOwnGreeting()
  const { useNetworkVariable } = useNetworkConfig()
  const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME)
  const explorerUrl = useNetworkVariable(EXPLORER_URL_VARIABLE_NAME)
  const client = useSuiClient()

  const { mutate: signAndExecute, isPending: isTxPending } = useSignAndExecuteTransaction()

  const handleCreateGreetingClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!packageId) {
      notification.error(null, 'Package ID not found')
      return
    }

    let notificationId: string | undefined;
    try {
      notificationId = notification.txLoading()
      const tx = prepareCreateGreetingTransaction(packageId)
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            client
              .waitForTransaction({
                digest: result.digest,
                options: WAIT_FOR_TX_OPTIONS,
              })
              .then(() => {
                notification.txSuccess(
                  transactionUrl(explorerUrl, result.digest),
                  notificationId
                )
                refetch()
              })
              .catch((err: Error) => {
                console.error('Error waiting for transaction', err)
                notification.txError(
                  err,
                  'Error waiting for transaction confirmation',
                  notificationId
                )
              })
          },
          onError: (error) => {
            console.error('Create Greeting failed', error)
            notification.txError(error, null, notificationId)
          },
        }
      )
    } catch (err) {
      console.error('Error preparing create transaction', err)
      if (notificationId) {
        notification.txError(err as Error, 'Error preparing transaction', notificationId)
      } else {
        notification.error(err as Error, 'Error preparing transaction')
      }
    }
  }

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setName(e.target.value)
  }

  const handleGreetMe = (objectId: string | null | undefined) => {
    if (objectId == null) {
      notification.error(null, 'Object ID is not valid')
      return
    }
    if (name.trim().length === 0) {
      notification.error(null, 'Name cannot be empty')
      return
    }
    if (!packageId) {
      notification.error(null, 'Package ID not found')
      return
    }

    let notificationId: string | undefined;
    try {
      notificationId = notification.txLoading()
      const tx = prepareSetGreetingTransaction(packageId, objectId, name)
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            client
              .waitForTransaction({
                digest: result.digest,
                options: WAIT_FOR_TX_OPTIONS,
              })
              .then(() => {
                notification.txSuccess(
                  transactionUrl(explorerUrl, result.digest),
                  notificationId
                )
                refetch()
              })
              .catch((err: Error) => {
                console.error('Error waiting for transaction', err)
                notification.txError(
                  err,
                  'Error waiting for transaction confirmation',
                  notificationId
                )
              })
          },
          onError: (error) => {
            console.error('Set Greeting failed', error)
            notification.txError(error, null, notificationId)
          },
        }
      )
    } catch (err) {
      console.error('Error preparing set greeting transaction', err)
      if (notificationId) {
        notification.txError(err as Error, 'Error preparing transaction', notificationId)
      } else {
        notification.error(err as Error, 'Error preparing transaction')
      }
    }
  }

  const handleReset = (objectId: string | null | undefined) => {
    if (objectId == null) {
      notification.error(null, 'Object ID is not valid')
      return
    }
    if (!packageId) {
      notification.error(null, 'Package ID not found')
      return
    }

    let notificationId: string | undefined;
    try {
      notificationId = notification.txLoading()
      const tx = prepareResetGreetingTransaction(packageId, objectId)
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            client
              .waitForTransaction({
                digest: result.digest,
                options: WAIT_FOR_TX_OPTIONS,
              })
              .then(() => {
                notification.txSuccess(
                  transactionUrl(explorerUrl, result.digest),
                  notificationId
                )
                refetch()
              })
              .catch((err: Error) => {
                console.error('Error waiting for transaction', err)
                notification.txError(
                  err,
                  'Error waiting for transaction confirmation',
                  notificationId
                )
              })
          },
          onError: (error) => {
            console.error('Reset Greeting failed', error)
            notification.txError(error, null, notificationId)
          },
        }
      )
    } catch (err) {
      console.error('Error preparing reset transaction', err)
      if (notificationId) {
        notification.txError(err as Error, 'Error preparing transaction', notificationId)
      } else {
        notification.error(err as Error, 'Error preparing transaction')
      }
    }
  }

  if (currentAccount == null) return <CustomConnectButton />

  if (isQueryPending || isTxPending) return <Loading />

  if (error) return <TextMessage>Error: {error.message}</TextMessage>

  if (!data.data) return <TextMessage>Not found</TextMessage>

  return (
    <div className="my-2 flex flex-grow flex-col items-center justify-center">
      {data.data.length === 0 ? (
        <div className="flex flex-col">
          <Button variant="solid" size="4" onClick={handleCreateGreetingClick}>
            Get Started
          </Button>
        </div>
      ) : (
        <div>
          {getResponseContentField(data.data[0], 'name')?.length !== 0 ? (
            <div className="flex w-full max-w-xs flex-col gap-6 px-2 sm:max-w-lg">
              <h1 className="bg-gradient-to-r from-sds-blue to-sds-pink bg-clip-text text-center text-4xl font-bold !leading-tight text-transparent sm:text-5xl">
                Greetings from{' '}
                <AnimalEmoji
                  index={getResponseContentField(data.data[0], 'emoji')}
                />
                , {getResponseContentField(data.data[0], 'name')}!
              </h1>

              <div className="my-3 flex flex-col items-center justify-center">
                <h2 className="bg-gradient-to-r from-sds-pink to-sds-blue bg-clip-text text-center text-2xl font-bold !leading-tight text-transparent sm:text-3xl">
                  You've got a new NFT
                </h2>

                <img
                  className="mt-3 w-3/4 rounded-md border border-sds-blue p-5"
                  src={
                    getResponseDisplayField(data.data[0], 'image_url') ||
                    undefined
                  }
                  alt="Greeting NFT Image"
                />
              </div>

              <Button
                className="mx-auto"
                variant="solid"
                size="4"
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault()
                  handleReset(getResponseObjectId(data.data[0]))
                }}
              >
                Start over
              </Button>
            </div>
          ) : (
            <div className="flex w-full max-w-xs flex-col gap-6 px-2 sm:max-w-lg">
              <TextField.Root
                size="3"
                placeholder="Enter your name..."
                onChange={handleNameChange}
                required
              />
              <Button
                variant="solid"
                size="4"
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault()
                  handleGreetMe(getResponseObjectId(data.data[0]))
                }}
              >
                Greet me!
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default GreetingForm

const TextMessage: FC<PropsWithChildren> = ({ children }) => (
  <div className="text-center">{children}</div>
)
