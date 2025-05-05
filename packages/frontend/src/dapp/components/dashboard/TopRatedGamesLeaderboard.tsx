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
       className="py-3 border-b border-border last:border-b-0"
     >
        <Flex align="center" gap="3">
            <Text size="2" className="text-muted-foreground w-5 text-right">{rank}.</Text> {/* Adjusted width & alignment */}
             <RadixLink asChild>
                 <Link to={`/game/${gameId}`} className="text-foreground hover:text-accent transition-colors">
                     <Text size="2" weight="medium" truncate>{name}</Text>
                 </Link>
             </RadixLink>
        </Flex>
        <Text size="2" className="text-muted-foreground">{score}</Text>
    </Flex>
);

/**
 * Component to display the Top Rated Games Leaderboard.
 * TODO: Implement proper rating calculation if needed.
 */
export function TopRatedGamesLeaderboard() {
    const { games, isLoading, error } = useFetchDashboardGames();

    // Placeholder sorting: Sort by overall rating (descending)
    // Ensure overallRate exists for sorting
    const sortedGames = useMemo(() => {
        return [...games]
            .filter(game => typeof game.overallRate === 'number')
            .sort((a, b) => (b.overallRate ?? 0) - (a.overallRate ?? 0))
            .slice(0, 10); // Show top 10
    }, [games]);

    return (
        // Wrap in a styled Box (Card-like)
        <Box className="bg-card rounded-lg shadow-sm p-5 space-y-4">
            <Heading id="top-rated-games-heading" as="h3" size="5" className="font-semibold text-foreground">Top Rated</Heading> {/* Changed title */}
            {isLoading && <Text className="text-muted-foreground text-sm">Loading top rated games...</Text>}
            {error && <Text className="text-red-600 text-sm">Error: {error}</Text>}
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
                                    score={`⭐ ${(game.overallRate ?? 0).toFixed(1)}`}
                                />
                            ))}
                        </Flex>
                    </ScrollArea>
                 ) : (
                      <Text className="text-muted-foreground text-sm">No rated games found.</Text>
                 )
            )}
        </Box>
    );
} 