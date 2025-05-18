import { Card, Text, Flex, Heading, Avatar } from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import type { GuideData } from '~~/dapp/types/guide.types';
import { formatAddress } from '@mysten/sui/utils';
import { numToAnimalEmoji } from '~~/dapp/helpers/misc';

interface GuideCardProps {
  guide: GuideData;
}

export function GuideCard({ guide }: GuideCardProps) {
  const previewContent = guide.content.length > 100 
    ? `${guide.content.substring(0, 100)}...` 
    : guide.content;

  const randomEmojiIndex = Math.floor(Math.random() * 64) + 1;
  const fallbackEmoji = numToAnimalEmoji(randomEmojiIndex);

  return (
    <Card size="2" style={{ width: '100%' }}>
      <Link to={`/guide/${guide.guideId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Flex direction="column" gap="3">
          <Heading size="4" weight="bold">{guide.title}</Heading>
          <Text size="2" color="gray" style={{ 
            display: '-webkit-box', 
            WebkitLineClamp: 3, 
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '3.6em'
          }}>
            {previewContent}
          </Text>
          <Flex align="center" justify="between" mt="2">
              <Flex align="center" gap="2">
                 <Avatar
                    size="1"
                    fallback={fallbackEmoji}
                  />
                <Text size="1" color="gray">By: {formatAddress(guide.owner)}</Text>
              </Flex>
          </Flex>
        </Flex>
      </Link>
    </Card>
  );
} 