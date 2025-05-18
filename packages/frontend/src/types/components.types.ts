// types related to UI components

import { ReactNode } from 'react'; // Need to import ReactNode
// import type { VariantProps } from "class-variance-authority"; // Removed
import { ToastType } from 'react-hot-toast'; // Need to import ToastType
// import { buttonVariants } from '~~/components/ui/Button'; // Removed

export interface CreateGameFormProps {
  onSuccess?: () => void;
}

export interface ProgressDisplayProps {
  step: string;
  message?: string;
  error?: string;
  isLoading: boolean;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'cta' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  // isLoading prop is already in Button.tsx, not strictly needed here if ButtonProps in types is for general use
  // but if it's meant to mirror Button.tsx's props, it could be added.
}

export interface BalanceBadgeProps {
  className?: string;
}

export interface LoadingProps {
  // message?: string; // Keep commented out as in original file
}

export interface NetworkSupportCheckerProps {
  children: ReactNode;
}

export interface INotification {
  id?: string;
  type: ToastType;
}

export interface AppLayoutProps {
  children?: ReactNode;
}

export interface AnimalEmojiProps {
  index: number;
} 