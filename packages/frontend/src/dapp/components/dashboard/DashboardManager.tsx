import { Flex, Heading, IconButton, Text, Button, Spinner } from '@radix-ui/themes'
import { FC, useState, ChangeEvent, FormEvent } from 'react'
import useDashboardGames, { getGameIdsFromDynamicFields } from '~~/dapp/hooks/useDashboardGames'
import {
  useRegisterGameMutation,
  useUnregisterGameMutation,
} from '~~/dapp/hooks/useDashboardMutations'
import { TrashIcon } from 'lucide-react' 
import { Link as RouterLink } from 'react-router-dom'
import Loading from '~~/components/Loading'
import type { DashboardManagerProps } from '~~/dapp/types/dashboard.types';
import { Card, CardHeader, CardContent, CardTitle } from '~~/components/ui/Card';
import { Input } from '~~/components/ui/Input';

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
      return <Text className="text-realm-neon-warning">Dashboard ID not provided.</Text>;
  }

  return (
    <Card className="w-full max-w-md" glow>
      <CardHeader>
        <CardTitle>Manage Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Flex direction="column" gap="4">
          <Text size="2" className="text-realm-text-secondary">ID: {dashboardId}</Text>

          <form onSubmit={handleRegisterSubmit} className="flex items-end gap-2">
            <div className="flex-grow">
              <Input
                placeholder="Enter Game Object ID (0x...)"
                value={gameIdInput}
                onChange={handleGameIdChange}
                required
                name="gameIdInput"
                disabled={registerMutationResult.isLoading || unregisterMutationResult.isLoading}
              />
            </div>
            <Button 
              type="submit" 
              size="2" 
              disabled={!gameIdInput.trim() || registerMutationResult.isLoading || unregisterMutationResult.isLoading}
              variant='solid'
            >
              {registerMutationResult.isLoading ? <Spinner size="1" /> : 'Register Game'}
            </Button>
          </form>

          <Flex direction="column" gap="2">
            <Heading size="3" className="text-realm-neon-secondary">Registered Games</Heading>
            {isLoadingGames ? (
              <Loading />
            ) : gamesError ? (
              <Text className="text-realm-neon-warning">Error loading games: {gamesError.message}</Text>
            ) : gameIds.length === 0 ? (
              <Text className="text-realm-text-secondary">No games registered yet.</Text>
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
      </CardContent>
    </Card>
  )
}

export default DashboardManager 