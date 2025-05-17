export interface IGame {
  id: number;
  name: string;
  description: string;
  genre: string;
  platform: string;
  price: string;
  imageUrl: string;
  overallRate: number;
  owner: string;
  isPurchased: boolean;
}

export interface GameCardProps {
  gameId: string;
  name: string;
  genre: string;
  platform: string;
  overallRate: number;
  imageUrl: string;
} 