import { FC, HTMLAttributes } from 'react';
import { cn } from '~~/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
  glow?: boolean;
}

export const Card: FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  glow = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-lg bg-realm-surface-primary text-realm-text-primary transition-shadow duration-300',
        {
          'border border-realm-border': variant === 'bordered' || variant === 'default',
          'shadow-realm-glow-primary-sm': variant === 'elevated',
          'hover:shadow-realm-glow-secondary-xs': glow,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader: FC<CardHeaderProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-4 md:p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle: FC<CardTitleProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h3
      className={cn(
        'text-xl font-semibold leading-none tracking-tight text-realm-neon-secondary',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
};

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription: FC<CardDescriptionProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p
      className={cn('text-sm text-realm-text-secondary', className)}
      {...props}
    >
      {children}
    </p>
  );
};

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent: FC<CardContentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('p-4 md:p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const CardFooter: FC<CardFooterProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('flex items-center p-4 md:p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
}; 