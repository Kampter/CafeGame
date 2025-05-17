import { FC } from 'react';
import { Box, Text, Flex, IconButton, Tooltip } from '@radix-ui/themes';
import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { ReviewData } from '../../types/review.types';
import { formatDistanceToNow } from 'date-fns';
import type { ReviewCardProps } from '../../types/review.types';

// Helper to format address
const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

// Simple Star Rating component
const StarRating: FC<{ rating: number; size?: number }> = ({ rating, size = 16 }) => (
    <Flex gap="0.5" align="center">
        {[...Array(5)].map((_, i) => (
            <Star 
                key={i} 
                size={size} 
                className={i < rating ? 'text-realm-neon-primary fill-realm-neon-primary/30' : 'text-realm-text-secondary opacity-40'} 
            />
        ))}
    </Flex>
);

const ReviewCard: FC<ReviewCardProps> = ({ review }) => {

  // Placeholder vote handlers
  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Upvoting review:', review.reviewId);
  };
  const handleDownvote = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Downvoting review:', review.reviewId);
  };

  return (
    <Box className="bg-realm-surface-primary border border-realm-border rounded-lg p-4 space-y-3 shadow-sm hover:shadow-realm-glow-secondary-xs transition-shadow duration-300">
      {/* Header: Rating, Author, Time */}
      <Flex justify="between" align="center" gap="4">
        <StarRating rating={review.rating} size={18}/>
        <Flex gap="2" align="center" className="text-xs">
             <Tooltip content={review.owner}>
              <Text className="text-realm-text-secondary">
                By: <span className="text-realm-neon-secondary font-medium">{formatAddress(review.owner)}</span>
              </Text>
             </Tooltip>
           <Text className="text-realm-text-secondary">•</Text>
           <Text className="text-realm-text-secondary">
            {formatDistanceToNow(new Date(review.timeIssued), { addSuffix: true })}
           </Text>
          </Flex>
        </Flex>

        {/* Content */}
      <Box>
          <Text as="p" size="3" className="text-realm-text-primary leading-relaxed break-words">{review.content}</Text>
        </Box>

        {/* Footer: Votes, Score, Actions */}
      <Flex justify="end" align="center" className="text-sm">
           <Flex align="center" gap="2">
              <Tooltip content="Helpful">
                  <IconButton size="1" variant="ghost" className="text-realm-text-secondary hover:text-realm-neon-primary hover:bg-realm-surface-secondary rounded-full transition-colors" onClick={handleUpvote}>
                      <ThumbsUp size={16} />
                    </IconButton>
                </Tooltip>
                <Text size="2" weight="medium" className={`${review.votes > 0 ? 'text-realm-neon-primary' : review.votes < 0 ? 'text-realm-neon-warning' : 'text-realm-text-secondary'}`}>
                    {review.votes}
                </Text>
              <Tooltip content="Not Helpful">
                  <IconButton size="1" variant="ghost" className="text-realm-text-secondary hover:text-realm-neon-warning hover:bg-realm-surface-secondary rounded-full transition-colors" onClick={handleDownvote}>
                       <ThumbsDown size={16} />
                    </IconButton>
                </Tooltip>
           </Flex>
      </Flex>
    </Box>
  );
};

export default ReviewCard; 