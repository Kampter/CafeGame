import { FC } from 'react';
import { Box, Heading, Text, Flex, Card, Inset, Button } from '@radix-ui/themes';
import Loading from '../../../components/Loading';
import { useFetchGameDetails } from '../../hooks/useFetchGameDetails';
import { useUserAdminCap } from '../../hooks/useUserAdminCap';
import { useCurrentAccount } from '@mysten/dapp-kit';
import UploadGameFile from './UploadGameFile';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// Import placeholder section components (to be created)
import ReviewsSection from '../review/ReviewsSection';
import GuidesSection from '../guide/GuidesSection';
// Update import path
import type { GameDetailsFeatureProps } from '~~/dapp/types/game.types';

// Use the imported GameDetailsFeatureProps type
const GameDetailsFeature: FC<GameDetailsFeatureProps> = ({ gameId }) => {
  const currentAccount = useCurrentAccount();
  const { data: gameData, isLoading: isLoadingDetails, error: detailsError } = useFetchGameDetails(gameId);
  const { adminCapId, isLoading: isLoadingAdminCap, error: adminCapError } = useUserAdminCap(gameId);

  const isLoading = isLoadingDetails || isLoadingAdminCap;

  if (isLoading) {
    return <Loading />;
  }

  const error = detailsError || adminCapError;
  if (error) {
    return <Text color="red">Error loading game details or admin status: {error}</Text>;
  }

  if (!gameData) {
    return <Text>Game ID {gameId} not found or data could not be parsed.</Text>;
  }

  const canUpload = currentAccount?.address === gameData.owner && !!adminCapId;

  return (
    <Flex direction="column" gap="6">
      {/* Section 1: Basic Info & Metadata */}
      <Card size="3">
        <Flex gap="5" align="start">
          <Box width="150px" height="150px" style={{ background: 'var(--gray-a5)', borderRadius: 'var(--radius-3)' }} />
          
          <Flex direction="column" gap="2" style={{ flexGrow: 1 }}>
            <Heading as="h1" size="7">{gameData.name || 'Game Title'}</Heading>
            <Text size="3" color="gray">Genre: {gameData.genre || 'N/A'} | Platform: {gameData.platform || 'N/A'}</Text>
            <Text size="3" color="gray">Price: {gameData.price ? `${gameData.price} MIST` : 'N/A'}</Text>
            <Text size="3" color="gray">Owner: {gameData.owner || 'N/A'}</Text>
            <Text size="3" color="gray">
                Rating: {typeof gameData.overallRate === 'number' 
                            ? `${gameData.overallRate.toFixed(1)} / 5` 
                            : 'N/A'} 
                ({gameData.numReviews || 0} reviews)
            </Text>
            <Text mt="3" size="3">{gameData.description || 'No description provided.'}</Text>
            
            {canUpload && adminCapId && (
                 <Box mt="4" p="3" style={{ border: '1px solid var(--gray-a6)', borderRadius: 'var(--radius-3)' }}>
                      <Heading size="3" mb="2">Admin Zone</Heading>
                      <UploadGameFile gameId={gameId} adminCapId={adminCapId} />
                 </Box>
            )}
          </Flex>
        </Flex>
      </Card>
      
      {/* Section 2: Reviews & Guides using Swiper */}
      <Box className="swiper-container" style={{ border: '1px solid var(--gray-a6)', borderRadius: 'var(--radius-3)', overflow: 'hidden' }}>
           <Swiper
             // Install Swiper modules
             modules={[Navigation, Pagination]}
             spaceBetween={0} // No space between slides
             slidesPerView={1} // Show one slide at a time
             navigation // Enable navigation arrows
             pagination={{ clickable: true }} // Enable clickable pagination dots
             // onSwiper={(swiper) => console.log(swiper)}
             // onSlideChange={() => console.log('slide change')}
             style={{ paddingBottom: '40px' }} // Add padding for pagination
           >
             <SwiperSlide key="reviews">
                 <Box p="4">
                      <ReviewsSection gameId={gameId} reviewsTableId={gameData.reviewsTableId} />
                 </Box>
             </SwiperSlide>
             <SwiperSlide key="guides">
                 <Box p="4">
                      <GuidesSection gameId={gameId} guidesTableId={gameData.guidesTableId} />
                 </Box>
             </SwiperSlide>
             {/* Add more slides here if needed */}
           </Swiper>
        </Box>

    </Flex>
  );
};

export default GameDetailsFeature; 