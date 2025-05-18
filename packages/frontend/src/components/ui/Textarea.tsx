import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '~~/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-realm-border bg-realm-surface-primary px-3 py-2 text-sm text-realm-text-primary ring-offset-realm-bg-primary placeholder:text-realm-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-realm-neon-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm focus:shadow-realm-glow-primary-xs',
            {
              'border-realm-neon-warning focus-visible:ring-realm-neon-warning': error,
            },
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-realm-neon-warning">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea"; 