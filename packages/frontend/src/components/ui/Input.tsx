import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '~~/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  isLoading?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, isLoading, type, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-realm-border bg-realm-surface-primary px-3 py-2 text-sm text-realm-text-primary ring-offset-realm-bg-primary file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-realm-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-realm-neon-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm focus:shadow-realm-glow-primary-xs',
            {
              'border-realm-neon-warning focus-visible:ring-realm-neon-warning': error,
              'pr-10': isLoading,
            },
            className
          )}
          ref={ref}
          {...props}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent text-realm-neon-primary" />
          </div>
        )}
        {error && (
          <p className="mt-1 text-xs text-realm-neon-warning">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input"; 