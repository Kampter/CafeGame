import { FC, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button, TextField, TextArea, Flex, Text } from '@radix-ui/themes';
import { useGuideMutations } from '~~/dapp/hooks/useGuideMutations';
import toast from 'react-hot-toast';
import type { SuiTransactionBlockResponse } from '@mysten/sui/client';

interface CreateGuideFormData {
  title: string;
  content: string;
}

interface CreateGuideFormProps {
  gameId: string;
  onSuccess?: () => void; // Callback on successful creation
}

// Constants for validation (should match backend)
const MIN_GUIDE_CONTENT_LEN = 50;
const MAX_GUIDE_CONTENT_LEN = 10000;

const CreateGuideForm: FC<CreateGuideFormProps> = ({ gameId, onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateGuideFormData>();
  const { createGuide, isPending, error: mutationError } = useGuideMutations();

  const onSubmit: SubmitHandler<CreateGuideFormData> = (data) => {
    // --- Frontend Validation --- 
    const contentLength = data.content.trim().length;
    if (contentLength < MIN_GUIDE_CONTENT_LEN) {
        toast.error(`Guide content must be at least ${MIN_GUIDE_CONTENT_LEN} characters long.`);
        return; // Prevent submission
    }
    if (contentLength > MAX_GUIDE_CONTENT_LEN) {
        toast.error(`Guide content must be no more than ${MAX_GUIDE_CONTENT_LEN} characters long.`);
        return; // Prevent submission
    }
    // --- End Validation ---

    console.log('Submitting guide data:', data);
    createGuide(
      { 
        gameId,
        title: data.title,
        content: data.content 
      },
      {
        onSuccess: () => {
          console.log('Guide creation mutation succeeded');
          toast.success('Guide submitted successfully!');
          onSuccess?.(); // Call the success callback if provided
        },
        onError: (err: any) => {
          console.error("Guide submission error in component:", err);
          // Error is already handled within the hook with a toast, 
          // but you could add more specific component-level error handling here if needed.
          // toast.error(`Failed to submit guide: ${err.message || 'Unknown error'}`);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <Flex direction="column" gap="3">
        <TextField.Root
          placeholder="Guide Title"
          {...register('title', { required: 'Title is required' })}
        />
        {errors.title && <Text color="red" size="1">{errors.title.message}</Text>}

        <TextArea
          placeholder={`Guide Content (minimum ${MIN_GUIDE_CONTENT_LEN} characters)`}
          rows={6}
          {...register('content', { 
            required: 'Content is required',
            minLength: { value: MIN_GUIDE_CONTENT_LEN, message: `Minimum length is ${MIN_GUIDE_CONTENT_LEN}` },
            maxLength: { value: MAX_GUIDE_CONTENT_LEN, message: `Maximum length is ${MAX_GUIDE_CONTENT_LEN}` }
           })}
        />
        {errors.content && <Text color="red" size="1">{errors.content.message}</Text>}

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Submitting...' : 'Submit Guide'}
        </Button>
        {/* Display mutation error if any */}
        {/* {mutationError && <Text color="red" size="1">Error: {mutationError.message}</Text>} */} 
      </Flex>
    </form>
  );
};

export default CreateGuideForm; 