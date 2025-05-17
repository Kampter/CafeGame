import { toast } from 'react-hot-toast';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const useToast = () => {
  const showToast = ({ title, description, variant = 'default' }: ToastOptions) => {
    toast(
      `${title}${description ? `\n${description}` : ''}`,
      {
        className: variant === 'destructive' ? 'bg-destructive text-destructive-foreground' : '',
        duration: 3000,
        style: {
          background: variant === 'destructive' ? 'var(--destructive)' : 'var(--background)',
          color: variant === 'destructive' ? 'var(--destructive-foreground)' : 'var(--foreground)',
          padding: '1rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      }
    );
  };

  return { toast: showToast };
}; 