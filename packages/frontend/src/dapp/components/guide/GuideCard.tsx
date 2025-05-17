import { FC } from 'react';
import { Box, Text, Flex, IconButton, Tooltip, Heading } from '@radix-ui/themes';
import { Heart, Eye } from 'lucide-react';
import { GuideData } from '../../types/guide.types'; // Assuming GuideData is exported here
import { formatDistanceToNow } from 'date-fns'; // For relative time
import type { GuideCardProps } from '../../types/guide.types';
import { Link } from 'react-router-dom'; // Re-import Link

// Helper to format address (reuse or move to a central helper file)
const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

// Updated badge styling to use realm colors directly
const getGuideTypeClasses = (type: string) => {
    // Base classes for all badges
    const baseClasses = "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium";
    // Consistent realm styling for now, can be differentiated more later
    return `${baseClasses} bg-realm-surface-secondary text-realm-text-primary`; 
};

const GuideCard: FC<GuideCardProps> = ({ guide }) => {

  // Placeholder like handler
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation when clicking button
    console.log('Liking guide:', guide.guideId);
    // toast({ title: 'Liking not implemented yet.', type:'info'});
  };

  return (
    // Use Link directly, styling the inner Box as the card
    <Link 
        to={`/guide/${guide.guideId}`} 
        className="block group bg-realm-surface-primary border border-realm-border rounded-lg p-4 space-y-3 shadow-sm hover:shadow-realm-glow-primary-md hover:border-realm-neon-primary/30 transition-all duration-300 ease-in-out"
    >
        {/* Header: Title, Author, Time, Badge */}
        <Flex justify="between" align="start" gap="3">
            <Box className="flex-grow min-w-0"> {/* Added min-w-0 for truncation */}
                <Heading size="4" mb="1" className="text-realm-text-primary group-hover:text-realm-neon-primary transition-colors duration-200 truncate">
                    {guide.title}
                </Heading>
                <Flex gap="2" align="center" className="text-xs">
                  <Tooltip content={guide.owner}>
                    <Text className="text-realm-text-secondary">
                        By: <span className="text-realm-neon-secondary font-medium">{formatAddress(guide.owner)}</span>
                    </Text>
                  </Tooltip>
                    <Text className="text-realm-text-secondary">•</Text> 
                    <Text className="text-realm-text-secondary">
                        {formatDistanceToNow(new Date(guide.createdAt), { addSuffix: true })}
                    </Text>
               </Flex>
           </Box>
            <span className={`${getGuideTypeClasses(guide.guideType)} flex-shrink-0 ml-2`}> {/* Added ml-2 for spacing */}
                {guide.guideType}
            </span>
        </Flex>

        {/* Footer: Likes, Views */}
        <Flex justify="end" align="center" gap="4" className="text-sm mt-2"> {/* Added mt-2 */}
            <Tooltip content="Likes">
                <Flex align="center" gap="1">
                    <IconButton size="1" variant="ghost" className="text-realm-text-secondary hover:text-realm-neon-cta hover:bg-realm-surface-secondary rounded-full transition-colors" onClick={handleLike}>
                        <Heart size={16} />
                    </IconButton>
                    <Text size="2" className="text-realm-text-secondary group-hover:text-realm-neon-cta transition-colors">{guide.likes}</Text>
                </Flex>
            </Tooltip>
             <Tooltip content="Views">
                 <Flex align="center" gap="1">
                    <Eye size={16} className="text-realm-text-secondary"/>
                    <Text size="2" className="text-realm-text-secondary">{guide.views}</Text>
                </Flex>
            </Tooltip>
        </Flex>
    </Link>
  );
};

export default GuideCard; 