import { FC } from 'react'
import { Flex, Spinner, Text } from '@radix-ui/themes'
// Import the extracted type
import type { LoadingProps } from '~~/types/components.types';

// Remove original LoadingProps definition
// interface LoadingProps {
//   // Removed message prop as it caused issues earlier
//   // You can add it back if needed, ensuring the calling components provide it
//   // message?: string;
// }

// Use the imported LoadingProps type
const Loading: FC<LoadingProps> = (/*{ message }*/) => {
  return (
    <Flex direction="column" align="center" justify="center" gap="3" style={{ padding: 'var(--space-5)' }}>
      <Spinner size="3" />
      {/* {message && <Text color="gray">{message}</Text>} */}
      <Text color="gray">Loading...</Text>
    </Flex>
  )
}

export default Loading
