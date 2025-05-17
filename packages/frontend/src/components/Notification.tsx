import { Button } from '~~/components/ui/Button'
import c from 'clsx'
import { XIcon } from 'lucide-react'
import { FC, PropsWithChildren } from 'react'
import toast, { ToastType } from 'react-hot-toast'
import type { INotification } from '~~/types/components.types'

// Helper to add type-specific icons and colors, can be expanded
const getTypeSpecificClasses = (type: ToastType | undefined) => {
  switch (type) {
    case 'success':
      return 'text-realm-neon-primary' // Or a specific success neon color if defined
    case 'error':
      return 'text-realm-neon-warning'
    case 'loading':
      return 'text-realm-text-secondary'
    default:
      return 'text-realm-text-primary' // Default text color from Toaster
  }
}

const Notification: FC<PropsWithChildren<INotification>> = ({
  children,
  id,
  type,
}) => {
  const isCloseButtonVisible = id !== null && type !== 'loading'

  // Apply type-specific styling to the children (message)
  // This assumes children is usually a string or simple ReactNode.
  // More complex children might need different handling.
  const messageContent = (
    <span className={c(getTypeSpecificClasses(type))}>{children}</span>
  )

  return (
    // The outer div gets general padding from Toaster options (p-4 in Extra.tsx)
    <div className="flex w-full flex-row items-center justify-between gap-3"> {/* Increased gap slightly */}
      <div
        className={c('text-pretty flex-grow', {
          'mr-2': isCloseButtonVisible,
        })}
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}
      >
        {messageContent} {/* Display styled message */}
      </div>
      {isCloseButtonVisible && (
        <Button
          variant="secondary" // Using our custom button's secondary variant
          size="icon"        // Using our custom button's icon size
          onClick={() => toast.dismiss(id)}
          // className adjustments for a tighter icon button if needed, e.g. p-1
          // Default "icon" size in our Button.tsx is h-10 w-10, which might be too large here.
          // Let's refine the className for a smaller, circular close button for toasts.
          className="!h-7 !w-7 !p-0 rounded-full text-realm-text-secondary hover:text-realm-neon-primary hover:bg-realm-surface-primary/70"
        >
          <XIcon size={16} />
        </Button>
      )}
    </div>
  )
}

export default Notification
