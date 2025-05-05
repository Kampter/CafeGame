import { FC } from 'react';
import { Box, Heading, Text, Flex } from '@radix-ui/themes';
import Loading from '../../../components/Loading';
import { useFetchGuides, GuideData } from '../../hooks/useFetchGuides';
import GuideCard from './GuideCard';

interface GuidesSectionProps {
  gameId: string;
  guidesTableId: string | undefined; // The ID of the ObjectTable<address, Guide>
}

const GuidesSection: FC<GuidesSectionProps> = ({ gameId, guidesTableId }) => {
  const { guides, isLoading, error } = useFetchGuides(guidesTableId);

  console.log('[GuidesSection] Hook State:', { isLoading, error, guides, guidesTableId });

  const renderContent = () => {
    if (!guidesTableId) {
        console.log('[GuidesSection] Rendering: No Table ID');
        return <Text color="gray">Guides are not enabled for this game (missing table ID).</Text>;
    }
    if (isLoading) {
        console.log('[GuidesSection] Rendering: Loading');
        return <Loading />;
    }
    if (error) {
         console.log('[GuidesSection] Rendering: Error -', error);
        return <Text color="red">Error loading guides: {error}</Text>;
    }
    if (guides.length === 0) {
        console.log('[GuidesSection] Rendering: No guides found.');
        return <Text color="gray">No guides available yet.</Text>;
    }

    console.log(`[GuidesSection] Rendering: ${guides.length} guide(s)`);
    return (
      <Flex direction="column" gap="3">
        {guides.map((guide) => (
          <GuideCard key={guide.guideId} guide={guide} />
        ))}
      </Flex>
    );
  };

  return (
    <Box>
      <Heading mb="4">Guides</Heading>
       {guidesTableId && (
          <Box mb="4" p="3" style={{ border: '1px dashed var(--gray-a7)', borderRadius: 'var(--radius-2)' }}>
            <Text color="gray">(Create Guide Form Placeholder)</Text>
          </Box>
      )}
      {renderContent()}
    </Box>
  );
};

export default GuidesSection; 