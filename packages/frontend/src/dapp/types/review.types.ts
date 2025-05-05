// Types related to the Review concept in the DApp

export interface ReviewData {
    reviewId: string;
    gameId: string;
    content: string;
    timeIssued: number; // Store as number (timestamp ms)
    rating: number;
    len: number;
    votes: number;
    duration: number;
    totalScore: number;
    owner: string;
}

// Added from ReviewCard.tsx
export interface ReviewCardProps {
  review: ReviewData; // ReviewData should be imported or defined here
  // TODO: Add functions for handling upvote/downvote clicks later
  // onUpvote: (reviewId: string) => void;
  // onDownvote: (reviewId: string) => void;
  // isVoting: boolean;
}

// Add other review-related types here later 