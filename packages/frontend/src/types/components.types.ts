// types related to UI components

import { ReactNode } from 'react'; // Need to import ReactNode
import type { VariantProps } from "class-variance-authority";
import { ToastType } from 'react-hot-toast'; // Need to import ToastType
// Import the value to get its type
import { buttonVariants } from '~~/components/ui/Button'; 

export interface CreateGameFormProps {
  onSuccess?: () => void;
}

export interface ProgressDisplayProps {
  step: string;
  message?: string;
  error?: string;
  isLoading: boolean;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
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