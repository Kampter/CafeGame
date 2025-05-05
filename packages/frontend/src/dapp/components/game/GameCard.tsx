import React from 'react';
import { Text, Heading, Box, Flex } from '@radix-ui/themes'; // Re-add Flex import
import { Link } from 'react-router-dom';
// import { StarFilledIcon } from '@radix-ui/react-icons'; // Can add back later with theme colors
// Import the type
import type { GameCardProps } from '../../types/game.types';

/**
 * A reusable component to display basic game information in a card format.
 * Links to the game's detail page. Redesigned with Wabi-Sabi style.
 */
export function GameCard({ 
    gameId, 
    name, 
    genre, 
    platform, 
    overallRate, 
    imageUrl 
}: GameCardProps) {
    
    const displayImageUrl = imageUrl || 'https://via.placeholder.com/400x250.png/EAE8E1/737373?text=Game+Cover'; // Placeholder with muted colors

    return (
        // Use Link directly and style the inner Box as the card
        <Link 
            to={`/game/${gameId}`} 
            className="block group rounded-lg overflow-hidden shadow-sm hover:shadow-lg border border-transparent hover:border-border transition-all duration-300 ease-in-out bg-card"
        >
            <Flex direction="column" className="h-full"> {/* Use Radix Flex */}
                {/* Image Section - Use Tailwind for aspect ratio */}
                <Box className="aspect-[16/10] overflow-hidden bg-muted"> {/* Muted background for image area */}
                        <img 
                            src={displayImageUrl} 
                            alt={`${name} game cover`} 
                        className="block object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105" 
                         />
                    </Box>

                {/* Content Section - Use Tailwind for padding and spacing */}
                <Flex direction="column" className="p-4 flex-grow justify-between space-y-2"> {/* Increased padding & space */}
                    <Box>
                        {/* Use Tailwind text colors */}
                        <Heading size="4" mb="1" trim="start" className="text-card-foreground group-hover:text-accent transition-colors duration-200">
                            {name || 'Untitled Game'}
                        </Heading>
                        <Text as="p" size="2" className="text-muted-foreground">
                                {genre || 'Unknown Genre'} | {platform || 'Unknown Platform'}
                            </Text>
                        </Box>
                        
                    {/* Rating Display */}
                    {typeof overallRate === 'number' && overallRate > 0 && (
                            <Flex align="center" gap="1">
                            {/* TODO: Use themed star icon */}
                            <Text size="2" weight="medium" className="text-amber-600"> {/* Use a muted yellow/gold color */}
                                ⭐ {overallRate.toFixed(1)}
                            </Text> 
                            {/* Add review count if available later */} 
                            </Flex>
                        )}
                    </Flex>
                </Flex>
            </Link>
    );
}

// export default GameCard; // Optional default export 