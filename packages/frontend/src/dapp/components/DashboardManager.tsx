import { Button, Card, Flex, Heading, IconButton, Text, TextField } from '@radix-ui/themes'
import { FC, useState, ChangeEvent, FormEvent } from 'react'
import useDashboardGames, { getGameIdsFromDynamicFields } from '~~/dapp/hooks/useDashboardGames'
import {
  useRegisterGameMutation,
  useUnregisterGameMutation,
} from '~~/dapp/hooks/useDashboardMutations'
import { TrashIcon } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import Loading from '~~/components/Loading'

interface DashboardManagerProps {
  dashboardId: string;
}

const DashboardManager: FC<DashboardManagerProps> = ({
  dashboardId,
}) => {
  const [gameIdInput, setGameIdInput] = useState<string>('')

  const { data: dynamicFieldsData, isLoading: isLoadingGames, refetch: refetchGames, error: gamesError } = useDashboardGames(dashboardId)
  const gameIds = getGameIdsFromDynamicFields(dynamicFieldsData)

  const { registerGame, ...registerMutationResult } = useRegisterGameMutation({
      onSuccess: () => {
        setGameIdInput(''); 
        refetchGames(); 
      }
  })
  const { unregisterGame, ...unregisterMutationResult } = useUnregisterGameMutation({
      onSuccess: () => {
        refetchGames(); 
      }
  })

  const handleGameIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setGameIdInput(e.target.value)
  }

  const handleRegisterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!gameIdInput.trim() || !dashboardId) return
    if (!/^0x[a-fA-F0-9]{64}$/.test(gameIdInput.trim())) {
        alert('Invalid Game ID format. Must be a 64-character hex string starting with 0x.');
        return;
    }
    registerGame(dashboardId, gameIdInput.trim())
  }

  const handleUnregisterClick = (gameIdToUnregister: string) => {
    if (!dashboardId) return
    unregisterGame(dashboardId, gameIdToUnregister)
  }

  if (!dashboardId) {
      return <Text color="orange">Dashboard ID not provided.</Text>;
  }

  return (
    <Card size="3" className="w-full max-w-md">
      <Flex direction="column" gap="4">
        <Heading size="4">Manage Dashboard</Heading> 
        <Text size="2" color="gray">ID: {dashboardId}</Text>

        <form onSubmit={handleRegisterSubmit} className="flex items-end gap-2">
          <TextField.Root
            className="flex-grow"
            size="2"
            placeholder="Enter Game Object ID (0x...)"
            value={gameIdInput}
            onChange={handleGameIdChange}
            required
          />
          <Button 
            type="submit" 
            size="2" 
            disabled={!gameIdInput.trim()}
          >
            Register Game
          </Button>
        </form>

        <Flex direction="column" gap="2">
          <Heading size="3">Registered Games</Heading>
          {isLoadingGames ? (
            <Loading />
          ) : gamesError ? (
            <Text color="red">Error loading games: {gamesError.message}</Text>
          ) : gameIds.length === 0 ? (
            <Text color="gray">No games registered yet.</Text>
          ) : (
            <ul className="list-disc space-y-1 pl-5">
              {gameIds.map((gameId) => (
                <li key={gameId} className="flex items-center justify-between gap-2">
                  <RouterLink to={`/games/${gameId}`} className="truncate hover:underline flex-grow min-w-0" title={`View Game: ${gameId}`}>
                    <Text size="2" className="font-mono block truncate">{gameId}</Text>
                  </RouterLink>
                  <IconButton 
                    size="1" 
                    variant="ghost" 
                    color="red" 
                    onClick={() => handleUnregisterClick(gameId)}
                    title="Unregister Game"
                  >
                    <TrashIcon size={16}/>
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
        </Flex>
      </Flex>
    </Card>
  )
}

export default DashboardManager 