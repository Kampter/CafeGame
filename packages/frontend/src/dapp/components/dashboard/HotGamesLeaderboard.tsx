import React, { useMemo } from 'react';
import { Flex, Heading, Text, Box, ScrollArea, Link as RadixLink } from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import { useFetchDashboardGames } from '../../hooks/useFetchDashboardGames';
// Import the shared type
import type { LeaderboardItemProps } from '../../types/dashboard.types';

// Remove internal LeaderboardItemProps definition
// interface LeaderboardItemProps {
//     rank: number;
//     gameId: string;
//     name: string;
//     score: number | string; // Can be rating or review count
// }

// Use imported type
const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ rank, gameId, name, score }) => (
    // Apply Wabi-Sabi styling to list items
     <Flex 
       justify="between" 
       align="center" 
       className="py-3 border-b border-realm-border last:border-b-0"
     >
        <Flex align="center" gap="3">
            <Text size="2" className="text-realm-text-secondary w-5 text-right">{rank}.</Text> {/* Adjusted width & alignment */}
             <RadixLink asChild>
                 <Link to={`/game/${gameId}`} className="text-realm-text-primary hover:text-realm-neon-primary transition-colors">
                     <Text size="2" weight="medium" truncate>{name}</Text>
                 </Link>
             </RadixLink>
        </Flex>
        {/* Directly render the score prop (which is now ReactNode) */}
        {score}
    </Flex>
);

/**
 * Component to display the Hot Games Leaderboard.
 * TODO: Implement proper popularity calculation (e.g., based on recent purchases, reviews, playtime).
 */
export function HotGamesLeaderboard() {
    const { games, isLoading, error } = useFetchDashboardGames();

    // Placeholder sorting: Sort by number of reviews (descending) as a proxy for popularity
    // Ensure num_reviews exists for sorting
    const sortedGames = useMemo(() => {
        return [...games]
             .filter(game => typeof game.numReviews === 'number') // Assuming numReviews exists
            .sort((a, b) => (b.numReviews ?? 0) - (a.numReviews ?? 0))
            .slice(0, 10); // Show top 10
    }, [games]);

    return (
        // Wrap in a styled Box (Card-like)
        <Box className="bg-realm-surface-primary rounded-lg shadow-realm-glow-secondary-xs p-5 space-y-4">
            <Heading id="hot-games-heading" as="h3" size="5" className="font-semibold text-realm-neon-secondary">Most Popular</Heading> {/* Changed title */}
             {isLoading && <Text className="text-realm-text-secondary text-sm">Loading popular games...</Text>}
            {error && <Text className="text-destructive text-sm">Error: {error}</Text>}
            {!isLoading && !error && (
                 sortedGames.length > 0 ? (
                    <ScrollArea type="auto" scrollbars="vertical" style={{ maxHeight: 300 }}>
                         {/* Remove extra padding from Flex, handled by parent Box */}
                         <Flex direction="column" gap="0"> {/* Reduce gap, handled by item padding/border */}
                            {sortedGames.map((game, index) => (
                                <LeaderboardItem 
                                    key={game.gameId}
                                    rank={index + 1}
                                    gameId={game.gameId}
                                    name={game.name}
                                    // Pass score as a styled Text element
                                    score={(
                                        <Text size="2" className="text-realm-text-secondary">{`${game.numReviews ?? 0} Reviews`}</Text>
                                    )}
                                />
                            ))}
                        </Flex>
                    </ScrollArea>
                 ) : (
                    <Text className="text-realm-text-secondary text-sm">No popular games found.</Text>
                 )
            )}
        </Box>
    );
} 