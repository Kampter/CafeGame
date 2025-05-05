// Types related to the Guide concept in the DApp

export interface GuideData {
    guideId: string;
    gameId: string;
    title: string;
    content: string; // Maybe fetch content separately if it's large?
    guideType: string; // Store enum as string for simplicity
    createdAt: number;
    updatedAt: number;
    likes: number;
    views: number;
    owner: string;
}

// Added from GuideCard.tsx
export interface GuideCardProps {
  guide: GuideData; // GuideData should be imported or defined here
  // TODO: Add functions for handling like/view clicks later
  // onLike: (guideId: string) => void;
  // onView: (guideId: string) => void;
}

// Add other guide-related types here later 