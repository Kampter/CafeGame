import { FC } from 'react';
import { Box, Text, Flex, IconButton, Tooltip, Badge, Heading } from '@radix-ui/themes';
import { Heart, Eye } from 'lucide-react';
import { GuideData } from '../../types/guide.types'; // Assuming GuideData is exported here
import { formatDistanceToNow } from 'date-fns'; // For relative time
import type { GuideCardProps } from '../../types/guide.types';
import { Link } from 'react-router-dom'; // Re-import Link

// Helper to format address (reuse or move to a central helper file)
const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

// Define badge styles using Tailwind classes (can be more sophisticated later)
const getGuideTypeClasses = (type: string) => {
    const baseClasses = "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium";
    switch (type.toLowerCase()) {
        // Use muted background with slightly colored text for subtlety 
        case 'walkthrough': return `${baseClasses} bg-blue-100 text-blue-700`;
        case 'tipsandtricks': return `${baseClasses} bg-green-100 text-green-700`;
        case 'characterguide': return `${baseClasses} bg-purple-100 text-purple-700`;
        case 'bossstrategy': return `${baseClasses} bg-red-100 text-red-700`;
        case 'resourcefarming': return `${baseClasses} bg-amber-100 text-amber-700`;
        case 'levelupguide': return `${baseClasses} bg-teal-100 text-teal-700`;
        default: return `${baseClasses} bg-muted text-muted-foreground`;
    }
};

const GuideCard: FC<GuideCardProps> = ({ guide }) => {

  // Placeholder like handler
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation when clicking button
    console.log('Liking guide:', guide.guideId);
    alert('Liking not implemented yet.');
  };

  return (
    // Use Link directly, styling the inner Box as the card
    <Link 
        to={`/guide/${guide.guideId}`} 
        className="block group bg-card rounded-lg shadow-sm p-5 border border-border hover:shadow-md transition-all duration-200 ease-in-out space-y-3"
    >
        {/* Header: Title, Author, Time, Badge */}
        <Flex justify="between" align="start" gap="3">
            <Box className="flex-grow">
                <Heading size="4" mb="1" className="text-foreground group-hover:text-accent transition-colors">
                    {guide.title}
                </Heading>
                <Flex gap="2" align="center" className="text-xs text-muted-foreground">
                  <Tooltip content={guide.owner}>
                        <span>By: {formatAddress(guide.owner)}</span>
                  </Tooltip>
                    <span>•</span> {/* Separator */}
                    <span>{formatDistanceToNow(new Date(guide.createdAt), { addSuffix: true })}</span>
               </Flex>
           </Box>
            {/* Styled Badge */}
            <span className={`${getGuideTypeClasses(guide.guideType)} flex-shrink-0`}>
                {guide.guideType}
            </span>
        </Flex>

        {/* Footer: Likes, Views */}
        <Flex justify="end" align="center" gap="4" className="text-sm text-muted-foreground">
            <Tooltip content="Likes">
                <Flex align="center" gap="1">
                    <IconButton size="1" variant="ghost" className="text-muted-foreground hover:text-red-600 hover:bg-red-100/50 rounded-full" onClick={handleLike}>
                        <Heart size={16} />
                    </IconButton>
                    <Text size="2">{guide.likes}</Text>
                </Flex>
            </Tooltip>
             <Tooltip content="Views">
                 <Flex align="center" gap="1">
                    <Eye size={16} className="text-muted-foreground"/>
                    <Text size="2">{guide.views}</Text>
                </Flex>
            </Tooltip>
        </Flex>
    </Link>
  );
};

export default GuideCard; 