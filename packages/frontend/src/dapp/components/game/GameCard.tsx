import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Card, CardContent } from '~~/components/ui/Card';
import type { GameCardProps } from '../../types/game.types';

/**
 * A reusable component to display basic game information in a card format.
 * Links to the game's detail page. Redesigned with Wabi-Sabi style.
 */
export const GameCard: FC<GameCardProps> = ({ 
    gameId, 
    name, 
    genre, 
    platform, 
    overallRate, 
    imageUrl 
}) => {
    // Default placeholder if imageUrl is not provided or is an empty string
    const displayImageUrl = imageUrl || `https://source.unsplash.com/random/400x300/?game,${encodeURIComponent(name || 'concept')}`;

    return (
        <Link 
            to={`/game/${gameId}`} 
            className="block group h-full"
        >
            <Card 
                className={[
                    "h-full flex flex-col",
                    "bg-realm-surface-primary border border-realm-border rounded-lg",
                    "transition-all duration-300 ease-in-out",
                    "hover:-translate-y-1 hover:shadow-realm-glow-primary-md hover:border-realm-neon-primary/50"
                ].join(' ')}
            >
                <div className="aspect-video overflow-hidden bg-realm-surface-secondary rounded-t-lg">
                    <img 
                        src={displayImageUrl} 
                        alt={`${name || 'Game'} cover`} 
                        className="block object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105" 
                    />
                </div>
                <CardContent className="p-3 space-y-1.5 flex-grow flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-realm-text-primary group-hover:text-realm-neon-primary transition-colors duration-200 truncate">
                            {name || 'Untitled Game'}
                        </h3>
                        <p className="text-xs text-realm-text-secondary truncate">
                            {genre || 'N/A'} | {platform || 'N/A'}
                        </p>
                    </div>
                    {typeof overallRate === 'number' && overallRate > 0 && (
                        <div className="flex items-center gap-1 pt-1">
                            <Star size={14} className="text-realm-neon-primary flex-shrink-0" />
                            <span className="text-xs font-medium text-realm-neon-primary">
                                {overallRate.toFixed(1)}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
};

// export default GameCard; // Optional default export 