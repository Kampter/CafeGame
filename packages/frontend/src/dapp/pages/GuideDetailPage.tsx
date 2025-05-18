import { useParams } from 'react-router-dom';
import { useSuiClient } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';
import { Container, Heading, Text, Card, Flex, Spinner, Box, Callout } from '@radix-ui/themes';
import { formatAddress } from '@mysten/sui/utils';
import type { SuiObjectData } from '@mysten/sui/client'; // Import SuiObjectData
import type { GuideData } from '~~/dapp/types/guide.types'; // Import GuideData type
import { Link as RouterLink } from 'react-router-dom'; // Alias Link to avoid conflict with Radix Link
import { ArrowLeftIcon } from '@radix-ui/react-icons';

// Function to safely extract fields from Sui Object data
// We need to define the expected structure of the fields based on the Move struct
function extractGuideData(data: SuiObjectData | null | undefined): GuideData | null {
  if (!data || !data.content || data.content.dataType !== 'moveObject') {
    return null;
  }
  // Assuming the fields match the GuideData interface directly
  // We might need adjustments based on the actual Move struct fields
  const fields = data.content.fields as any;
  return {
    guideId: data.objectId, // Use objectId as guideId
    gameId: fields.game_id || '', // Assuming field name is game_id
    title: fields.title || 'Untitled',
    content: fields.content || 'No content available.',
    guideType: fields.guide_type_code !== undefined ? String(fields.guide_type_code) : '0', // Assuming guide_type_code
    createdAt: parseInt(fields.created_at_ms || '0'), // Assuming created_at_ms
    updatedAt: parseInt(fields.updated_at_ms || '0'), // Assuming updated_at_ms
    likes: parseInt(fields.likes || '0'),
    views: parseInt(fields.views || '0'),
    owner: fields.owner || 'Unknown Owner',
  };
}

export default function GuideDetailPage() {
  const { guideId } = useParams<{ guideId: string }>();
  const suiClient = useSuiClient();
  const [guide, setGuide] = useState<GuideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!guideId) {
      setError('Guide ID not found in URL');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    suiClient.getObject({
      id: guideId,
      options: { showContent: true }, // Fetch the content/fields
    })
    .then(response => {
      const extractedData = extractGuideData(response.data);
      if (extractedData) {
        setGuide(extractedData);
      } else {
        setError(`Could not find or parse guide data for ID: ${guideId}`);
      }
    })
    .catch(err => {
      console.error('Error fetching guide details:', err);
      setError(`Failed to fetch guide: ${err.message}`);
    })
    .finally(() => {
      setLoading(false);
    });

  }, [guideId, suiClient]);

  return (
    <Container size="3" mt="5">
       <Box mb="4">
          <RouterLink to={guide ? `/game/${guide.gameId}` : '/dashboard'} style={{ textDecoration: 'none' }}>
            <Flex align="center" gap="2" style={{ color: 'var(--gray-11)', cursor: 'pointer' }}>
              <ArrowLeftIcon />
              <Text>Back to {guide ? 'Game' : 'Dashboard'}</Text>
            </Flex>
          </RouterLink>
        </Box>

      {loading && (
        <Flex justify="center" align="center" style={{ minHeight: '200px' }}>
          <Spinner size="3" />
          <Text ml="2">Loading Guide...</Text>
        </Flex>
      )}

      {error && (
        <Callout.Root color="red" role="alert">
          <Callout.Icon>
            <Text>!</Text>
          </Callout.Icon>
          <Callout.Text>
            <Text weight="bold">Error: </Text>{error}
          </Callout.Text>
        </Callout.Root>
      )}

      {!loading && !error && guide && (
        <Card>
          <Flex direction="column" gap="4">
            <Heading size="7">{guide.title}</Heading>
            
            <Flex align="center" gap="2">
               {/* We don't have creator avatar URL, so use fallback */}
               {/* <Avatar size="2" src={creatorAvatarUrl} fallback={fallbackEmoji} /> */}
               <Text size="2">By: {formatAddress(guide.owner)}</Text>
            </Flex>

            {/* Display creation/update time if needed */}
            {/* <Text size="1" color="gray">Created: {new Date(guide.createdAt).toLocaleString()}</Text> */}
            
            {/* Render the full content */}
            {/* Consider using a Markdown renderer if content is Markdown */}
            <Box style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              <Text as="p" size="3">
                 {guide.content}
              </Text>
            </Box>

            {/* Add like/view counts, buttons etc. later */}
            <Flex gap="3" mt="3">
                <Text size="2" color="gray">Likes: {guide.likes}</Text>
                <Text size="2" color="gray">Views: {guide.views}</Text>
            </Flex>

          </Flex>
        </Card>
      )}
    </Container>
  );
} 