import { FC } from 'react';
import { Box, Heading, Text, Flex } from '@radix-ui/themes';
import Loading from '../../../components/Loading';
import { useFetchReviews } from '../../hooks/useFetchReviews';
import type { ReviewData } from '~~/dapp/types/review.types';
import ReviewCard from './ReviewCard';

interface ReviewsSectionProps {
  gameId: string;
  reviewsTableId: string | undefined; // The ID of the ObjectTable<address, Review>
}

const ReviewsSection: FC<ReviewsSectionProps> = ({ gameId, reviewsTableId }) => {
  const { reviews, isLoading, error } = useFetchReviews(reviewsTableId);

  console.log('[ReviewsSection] Hook State:', { isLoading, error, reviews, reviewsTableId });

  const renderContent = () => {
    if (!reviewsTableId) {
      console.log('[ReviewsSection] Rendering: No Table ID');
      return <Text color="gray">Reviews are not enabled for this game (missing table ID).</Text>;
    }
    if (isLoading) {
      console.log('[ReviewsSection] Rendering: Loading');
      return <Loading />;
    }
    if (error) {
      console.log('[ReviewsSection] Rendering: Error -', error);
      return <Text color="red">Error loading reviews: {error}</Text>;
    }
    if (reviews.length === 0) {
      console.log('[ReviewsSection] Rendering: No reviews found.');
      return <Text color="gray">No reviews yet. Be the first!</Text>;
    }
    
    console.log(`[ReviewsSection] Rendering: ${reviews.length} review(s)`);
    return (
        <Flex direction="column" gap="3">
            {reviews.map((review) => {
              console.log('[ReviewsSection] Mapping review:', review.reviewId);
              return <ReviewCard key={review.reviewId} review={review} />;
            })}
        </Flex>
    );
  };

  return (
    <Box>
      <Heading mb="4">Reviews</Heading>
      
      {reviewsTableId && (
            <Box mb="4" p="3" style={{ border: '1px dashed var(--gray-a7)', borderRadius: 'var(--radius-2)' }}>
                <Text color="gray">(Create Review Form Placeholder)</Text>
            </Box>
      )}

      {renderContent()}
    </Box>
  );
};

export default ReviewsSection; 