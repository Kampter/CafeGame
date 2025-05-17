import { Slot } from '@radix-ui/react-slot';
import { FC, ButtonHTMLAttributes } from 'react';
import { cn } from '~~/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'cta' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button: FC<ButtonProps> = ({ 
  className, 
  variant = 'primary',
  size = 'default',
  isLoading = false,
  disabled,
  asChild = false,
  children,
  ...props 
}) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-realm-neon-primary focus-visible:ring-offset-2 focus-visible:ring-offset-realm-bg-primary disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-realm-neon-primary text-realm-bg-primary hover:bg-realm-neon-primary/90 shadow-realm-glow-primary-xs hover:shadow-realm-glow-primary-sm': variant === 'primary',
          'bg-transparent text-realm-text-secondary hover:text-realm-neon-primary hover:bg-realm-surface-primary/50': variant === 'secondary',
          'bg-transparent border border-realm-border text-realm-text-secondary hover:border-realm-neon-secondary hover:text-realm-neon-secondary': variant === 'outline',
          'bg-realm-neon-cta text-white hover:bg-realm-neon-cta/90 shadow-realm-glow-cta-xs hover:shadow-realm-glow-cta-sm': variant === 'cta',
          'bg-transparent text-realm-neon-primary hover:text-realm-neon-primary/80 underline-offset-4 hover:underline': variant === 'link',
          'h-10 px-4 py-2': size === 'default',
          'h-9 rounded-md px-3': size === 'sm',
          'h-11 rounded-md px-8': size === 'lg',
          'h-10 w-10': size === 'icon',
        },
        className
      )}
      disabled={!asChild && (isLoading || disabled)}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {isLoading && (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {children}
        </>
      )}
    </Comp>
  );
}; 