import { FC } from 'react';
import { Box, Text, Flex, IconButton, Tooltip } from '@radix-ui/themes';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { ReviewData } from '../../types/review.types';
import { formatDistanceToNow } from 'date-fns';
import type { ReviewCardProps } from '../../types/review.types';

// Helper to format address
const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

// Simple Star Rating component (can be moved to shared components later)
const StarRating: FC<{ rating: number }> = ({ rating }) => (
    <Flex gap="1" align="center">
        {[...Array(5)].map((_, i) => (
            <span key={i} className={i < rating ? 'text-amber-500' : 'text-muted-foreground/50'}>⭐</span>
        ))}
    </Flex>
);

const ReviewCard: FC<ReviewCardProps> = ({ review }) => {

  // Placeholder vote handlers
  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent triggering link if card is linked
    console.log('Upvoting review:', review.reviewId);
    alert('Voting not implemented yet.');
  };
  const handleDownvote = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Downvoting review:', review.reviewId);
    alert('Voting not implemented yet.');
  };

  return (
    // Use Box with Tailwind for card styling
    <Box className="bg-card rounded-lg shadow-sm p-5 border border-border space-y-3">
        {/* Header: Rating, Author, Time */}
      <Flex justify="between" align="center" gap="4">
        <StarRating rating={review.rating} />
        <Flex gap="2" align="center" className="text-xs text-muted-foreground">
             <Tooltip content={review.owner}>
              <span>By: {formatAddress(review.owner)}</span>
             </Tooltip>
           <span>•</span> {/* Separator */}
           <span>{formatDistanceToNow(new Date(review.timeIssued), { addSuffix: true })}</span>
          </Flex>
        </Flex>

        {/* Content */}
      <Box>
          <Text as="p" size="3" className="text-foreground leading-relaxed">{review.content}</Text>
        </Box>

        {/* Footer: Votes, Score, Actions */}
      <Flex justify="between" align="center" className="text-sm text-muted-foreground">
           <Flex align="center" gap="2">
              <Tooltip content="Helpful">
                  <IconButton size="1" variant="ghost" className="text-muted-foreground hover:text-green-600 hover:bg-green-100/50 rounded-full" onClick={handleUpvote}>
                      <ThumbsUp size={16} />
                    </IconButton>
                </Tooltip>
                <Text size="2" weight="medium">{review.votes}</Text> {/* Display net votes */}
              <Tooltip content="Not Helpful">
                  <IconButton size="1" variant="ghost" className="text-muted-foreground hover:text-red-600 hover:bg-red-100/50 rounded-full" onClick={handleDownvote}>
                       <ThumbsDown size={16} />
                    </IconButton>
                </Tooltip>
           </Flex>
         {/* Removed technical score info for cleaner UI, can add back if needed */}
         {/* <Text size="1">Score: {review.totalScore} | Len: {review.len} | Dur: {review.duration}s</Text> */}
      </Flex>
    </Box>
  );
};

export default ReviewCard; 