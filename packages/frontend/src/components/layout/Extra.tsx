import { Toaster } from 'react-hot-toast'
import AnimatedBackground from '~~/components/AnimatedBackground'

const Extra = () => {
  return (
    <>
      <AnimatedBackground />
      <Toaster
        toastOptions={{
          className: 'bg-realm-surface-secondary text-realm-text-primary border border-realm-border rounded-lg shadow-realm-glow-primary-sm w-full md:max-w-md p-4',
          style: {
            // maxWidth: 'none',
          },
          duration: 4000,
        }}
        position="bottom-right"
      />
    </>
  )
}
export default Extra
