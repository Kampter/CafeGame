import { Balance } from '@mysten/sui/client';

// Types related to the Game concept in the DApp

// Common types (could move to common.types.ts later)
export type ObjectId = string; // Basic type for Sui Object IDs
export type SuiAddress = string; // Added from game.ts

// Placeholder for ObjectTable type
export interface ObjectTable { // Added from game.ts
  id: { id: ObjectId };
  size: string; // u64 as string
}

export interface GameFormData { // Renamed to avoid conflict if FormData is used elsewhere
    name: string;
    genre: string;
    platform: string;
    price: string; // Keep as string for form input consistency
    description: string;
}

// Moved from components.types.ts
export interface GameDetailsFeatureProps {
  gameId: string;
}

// Moved from components.types.ts
export interface UploadGameFileProps {
  gameId: string;
  adminCapId: string;
}

// Added from useFetchGameDetails.ts
export interface GameDetailsData {
    gameId: string;
    name?: string;
    description?: string;
    genre?: string;
    platform?: string;
    price?: string; // Keep as string (MIST value)
    owner?: string; // Address of the game creator/owner
    overallRate?: number;
    numReviews?: number;
    reviewsTableId?: string; // ID of the ObjectTable for reviews
    guidesTableId?: string;  // ID of the ObjectTable for guides
    // Add other fields from your Game struct as needed
    // e.g., creation_timestamp?: string;
}

// Added from useGameMutations.ts (Part 1)
export interface CreateGameArgs {
  name: string;
  genre: string;
  platform: string;
  price: string;
  description: string;
  game_file: File;
}

export interface CreateGameProgress {
    step: string;
    message?: string;
    error?: string;
    isLoading: boolean;
}

export interface CreateGameMetadataArgs {
  name: string;
  genre: string;
  platform: string;
  price: string;
  description: string;
}

export interface CreateGameMetadataResult {
    gameId: string;
    adminCapId: string;
    digest: string;
}

export interface CreateMetadataProgress {
    step: 'idle' | 'preparing' | 'signing' | 'executing' | 'parsing' | 'success' | 'error';
    message?: string;
    error?: string;
    isLoading: boolean;
}

// Added from useGameMutations.ts (Part 2)
export interface UploadAndAssociateArgs {
    gameId: string;
    adminCapId: string;
    game_file: File;
}

export interface UploadAssociateProgress {
    step: 'idle' | 'encrypting_uploading' | 'preparing_association' | 'signing_association' | 'executing_association' | 'success' | 'error';
    message?: string;
    error?: string;
    isLoading: boolean;
    // Optional sub-steps from walrusHelper
    subStep?: string;
    subStepMessage?: string;
}

// Interface based on the Game struct in game.move (from game.ts)
export interface IGame {
  id: { id: ObjectId };
  reward_pool: Balance;
  top_reviews: ObjectId[];
  reviews: ObjectTable;
  guides: ObjectTable;
  recommended_guides: ObjectId[];
  overall_rate: string;
  total_rate: string;
  num_reviews: string;
  num_guides: string;
  access_list: SuiAddress[];
  name: string;
  genre: string;
  platform: string;
  price: string;
  description: string;
  game_package_url: string;
  imageUrl?: string; // Added optional imageUrl for game cover
}

// Type for the fields within the Game object content (from game.ts)
// This definition using Omit is cleaner than the previous explicit one.
// Removing the previous explicit IGameFields definition
// export interface IGameFields {
//     id: { id: ObjectId };
//     name: string;
//     description: string;
//     genre: string;
//     platform: string;
//     price: string; // u64 as string
//     overall_rate: string; // u64 as string (or number if parsed)
//     num_reviews: string; // u64 as string (or number if parsed)
//     reviews: { id: ObjectId }; // Assuming it's an ObjectTable ID struct
//     guides: { id: ObjectId }; // Assuming it's an ObjectTable ID struct
//     // Add any other fields from your Game struct
// }
export interface IGameFields extends Omit<IGame, 'id'> {}

// Added from GameCard.tsx
export interface GameCardProps {
    gameId: string;
    name: string;
    genre: string;
    platform: string;
    overallRate?: number; // Optional rating
    imageUrl?: string; // Optional image URL
}

// Add other game-related types here in the future, e.g.:
// export interface Game extends GameFormData {
//   id: string;
//   publisher: string;
//   // ... other fields
// } 