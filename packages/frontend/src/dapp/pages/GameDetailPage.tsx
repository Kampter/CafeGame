import { FC } from 'react';
import { useParams } from 'react-router-dom'; // Assuming react-router-dom
import useGame, { getGameFields } from '~~/dapp/hooks/useGame';
import Layout from '~~/components/layout/Layout'; // Assuming layout structure
import Loading from '~~/components/Loading';
import { Card, Text, Heading, Flex, Box } from '@radix-ui/themes'; // Assuming Radix

const GameDetailPage: FC = () => {
  const { gameId } = useParams<{ gameId: string }>(); // Get gameId from URL
  const { data: gameData, isLoading, error, refetch } = useGame(gameId);

  const gameFields = getGameFields(gameData);

  // TODO: Add Purchase Button, Reviews Section, Guides Section

  return (
    <Layout>
      <Flex direction="column" align="center" gap="4" className="p-4">
        <Heading>Game Details</Heading>
        {isLoading && <Loading />}
        {error && <Text color="red">Error loading game: {error.message}</Text>}
        {!isLoading && !error && !gameFields && (
          <Text color="orange">Game not found or invalid data.</Text>
        )}
        {gameFields && (
          <Card className="w-full max-w-2xl">
            <Flex direction="column" gap="3">
              <Heading size="5">{gameFields.name}</Heading>
              <Text size="2" color="gray">ID: {gameId}</Text>
              <Box>
                <Text weight="bold">Genre:</Text> <Text>{gameFields.genre}</Text>
              </Box>
              <Box>
                <Text weight="bold">Platform:</Text> <Text>{gameFields.platform}</Text>
              </Box>
              <Box>
                <Text weight="bold">Description:</Text> <Text>{gameFields.description}</Text>
              </Box>
              <Box>
                <Text weight="bold">Price:</Text> <Text>{gameFields.price} MIST</Text> {/* Assuming MIST */}
              </Box>
               <Box>
                 <Text weight="bold">Overall Rating:</Text> <Text>{gameFields.overall_rate}</Text> {/* TODO: Format nicely */}
               </Box>
              {/* Add Purchase Button logic here based on ownership check */}
              {/* Add Reviews List component here */}
              {/* Add Guides List component here */}
            </Flex>
          </Card>
        )}
      </Flex>
    </Layout>
  );
};

export default GameDetailPage; 