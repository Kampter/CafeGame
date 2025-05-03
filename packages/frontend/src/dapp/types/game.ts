import { Balance } from '@mysten/sui/client'; // Assuming Balance type is available or define similarly

// Define auxiliary types if not already present
export type SuiAddress = string;
export type ObjectId = string;

// A placeholder for ObjectTable type - adjust as needed based on actual data structure
export interface ObjectTable {
  id: { id: ObjectId };
  size: string; // u64 as string
  // Note: Actual contents are dynamic fields, not directly in the object
}

// Interface based on the Game struct in game.move
export interface IGame {
  id: { id: ObjectId }; // Assuming the standard UID structure
  reward_pool: Balance; // Or a simplified type like { value: string }
  top_reviews: ObjectId[];
  reviews: ObjectTable; // No type parameters needed here for this placeholder
  guides: ObjectTable;  // No type parameters needed here for this placeholder
  recommended_guides: ObjectId[];
  overall_rate: string; // Using string for u64
  total_rate: string;   // Using string for u64
  num_reviews: string;  // Using string for u64
  num_guides: string;   // Using string for u64
  access_list: SuiAddress[]; // Be mindful of fetching this potentially large list

  // --- Basic Information ---
  name: string;
  genre: string;
  platform: string;
  price: string;        // Using string for u64
  description: string;
  game_package_url: string;
}

// You might also want to define a type for the fields within the Game object content
export interface IGameFields extends Omit<IGame, 'id'> {} 