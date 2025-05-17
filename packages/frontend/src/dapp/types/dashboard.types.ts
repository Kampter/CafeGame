import React from 'react'; // Import React for ReactNode

// Types related to Dashboard feature

export interface DashboardManagerProps {
  dashboardId: string;
}

export interface CreateDashboardFormProps {
  onSuccess?: () => void;
}

// Added from useFetchDashboardGames.ts
export interface DashboardGameData {
    gameId: string;
    name: string;
    genre?: string;
    platform?: string;
    overallRate?: number;
    numReviews?: number;
    imageUrl?: string;
    // Add other fields like imageUrl if needed
}

// Added from HotGamesLeaderboard.tsx & TopRatedGamesLeaderboard.tsx
export interface LeaderboardItemProps {
    rank: number;
    gameId: string;
    name: string;
    score: React.ReactNode; // Changed type to ReactNode
}

// Add other dashboard related types here later 