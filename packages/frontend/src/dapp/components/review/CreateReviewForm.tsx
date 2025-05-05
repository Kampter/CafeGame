import { FC, useState, FormEvent, ChangeEvent } from 'react';
import { Button, TextArea, Flex, Text, TextField } from '@radix-ui/themes';
import { useCreateReviewMutation } from '~~/dapp/hooks/useReviewMutations';
import { toast } from 'react-hot-toast';
import type { SuiTransactionBlockResponse } from '@mysten/sui';

interface CreateReviewFormProps {
  gameId: string;
  onSuccess?: () => void;
}

const CreateReviewForm: FC<CreateReviewFormProps> = ({ gameId, onSuccess }) => {
  const [content, setContent] = useState<string>('');
  const [rating, setRating] = useState<string>('5'); // Store as string for TextField
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Manual loading state

  const { createReview } = useCreateReviewMutation({
      onSuccess: (result: SuiTransactionBlockResponse) => { // Add result type here too
          console.log("Review submission success in component:", result)
          setContent('');
          setRating('5');
          setIsSubmitting(false); // Stop loading on success
          onSuccess?.();
      },
      onError: (error: Error) => {
          console.error("Review submission error in component:", error)
          setIsSubmitting(false); // Stop loading on error
          // Error toast is already handled in the hook
      }
  });

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleRatingChange = (e: ChangeEvent<HTMLInputElement>) => {
      // Basic validation to allow only numbers between 1 and 5
      const value = e.target.value;
      if (value === '' || (/^[1-5]$/.test(value) && value.length === 1)) {
          setRating(value);
      }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => { // Make async
    e.preventDefault();
    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        toast.error("Please enter a valid rating between 1 and 5.");
        return;
    }
    if (!content.trim()) {
        toast.error("Review content cannot be empty.");
        return;
    }

    setIsSubmitting(true); // Start loading
    try {
        // The hook now handles async execution internally via .then/.catch
        await createReview(gameId, content.trim(), numericRating);
        // No need to call setIsSubmitting(false) here, it's handled by onSuccess/onError callbacks
    } catch (error) {
        // Catch potential synchronous errors from createReview itself (e.g., wallet not connected)
        console.error("Error initiating review submission:", error);
        setIsSubmitting(false); // Ensure loading stops if initial call fails
        // Toast for specific errors like wallet connection is handled inside createReview
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded border border-gray-a7 p-4">
      <Flex direction="column" gap="2">
        <Text as="label" htmlFor="review-content" size="2" weight="medium">Your Review:</Text>
        <TextArea
          id="review-content"
          placeholder="Share your thoughts about the game..."
          value={content}
          onChange={handleContentChange}
          required
          rows={4}
          disabled={isSubmitting} // Use manual loading state
        />
      </Flex>
      <Flex direction="column" gap="2">
         <Text as="label" htmlFor="review-rating" size="2" weight="medium">Rating (1-5):</Text>
         <TextField.Root
            id="review-rating"
            type="number" // Use number type for better mobile input
            placeholder="5"
            value={rating}
            onChange={handleRatingChange}
            required
            min={1}
            max={5}
            step={1}
            className="w-20" // Make rating input smaller
            disabled={isSubmitting} // Use manual loading state
         />
      </Flex>
      <Button type="submit" variant="solid" disabled={isSubmitting || !content.trim() || !rating}>
        {isSubmitting ? 'Submitting...' : 'Submit Review'} // Use manual loading state
      </Button>
    </form>
  );
};

export default CreateReviewForm; 