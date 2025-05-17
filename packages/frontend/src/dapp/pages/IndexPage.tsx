import { FC } from 'react'
import { Flex, Heading, Text, Button, Grid, Box } from '@radix-ui/themes';
// import Layout from '~~/components/layout/Layout' // Remove Layout component
import NetworkSupportChecker from '../../components/NetworkSupportChecker'
// import DashboardFeature from '~~/dapp/components/DashboardFeature' // Let's remove this for now
import { Link } from 'react-router-dom';
// Import the new leaderboard components
import { HotGamesLeaderboard } from '../components/dashboard/HotGamesLeaderboard';
import { TopRatedGamesLeaderboard } from '../components/dashboard/TopRatedGamesLeaderboard';
// Import the data fetching hook
import { useFetchDashboardGames } from '../hooks/useFetchDashboardGames'; 
// Import the type from its correct location
import type { DashboardGameData } from '~~/dapp/types/dashboard.types'; 
import { GameCard } from '../components/game/GameCard';
import { Button as CustomButton } from '~~/components/ui/Button'; // Renamed import to avoid conflict

// --- Recommended Games Section --- 
const RecommendedGamesSection: FC = () => {
     const { games, isLoading, error } = useFetchDashboardGames();
     const recommended = games.slice(0, 3);

     return (
        // Use Tailwind classes for spacing
        <section aria-labelledby="recommended-games-heading" className="space-y-4">
            <Heading id="recommended-games-heading" as="h2" size="5" className="font-semibold text-realm-neon-secondary">
              Recommended For You
            </Heading>
            {isLoading && <Text className="text-muted-foreground">Loading recommendations...</Text>}
            {/* Use semantic destructive color */}
            {error && <Text className="text-destructive">Error loading games: {error}</Text>}
            {!isLoading && !error && (
                 recommended.length > 0 ? (
                    // Adjust grid gap
                     <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="6">
                         {recommended.map((game: DashboardGameData) => (
                            <GameCard 
                                key={game.gameId}
                                gameId={game.gameId}
                                name={game.name}
                                genre={game.genre || 'N/A'} 
                                platform={game.platform || 'N/A'}
                                overallRate={game.overallRate}
                                imageUrl={game.imageUrl}
                            />
                        ))}
                    </Grid>
                 ) : (
                     <Text className="text-muted-foreground">No recommended games found.</Text>
                 )
            )}
        </section>
    );
};

// --- Main Index Page Component ---
const IndexPage: FC = () => {
  return (
    <>
      <NetworkSupportChecker><></></NetworkSupportChecker> 
      <Flex direction="column" align="stretch" className="flex-grow space-y-6">

        <Flex justify="between" align="center" className="mb-2">
             <Heading as="h1" size="7" weight="bold" className="text-realm-neon-primary">
              Discover Games
             </Heading>
             <CustomButton asChild variant="outline" size="sm"> 
               <Link 
                 to="/create-game"
               >
                 List New Game
               </Link>
             </CustomButton>
        </Flex>

        <div className="mb-6">
        <RecommendedGamesSection />
        </div>

        <Flex gap="4" direction={{ initial: 'column', md: 'row' }} justify="between" className="border-t border-border pt-4">
            <Box flexGrow="1" style={{ minWidth: 0 }}> 
                 <HotGamesLeaderboard />
            </Box>
            <Box flexGrow="1" style={{ minWidth: 0 }}> 
                 <TopRatedGamesLeaderboard />
            </Box>
        </Flex>

      </Flex>
    </>
  );
}

export default IndexPage