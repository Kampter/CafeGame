import { FC, useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import useGame, { getGameFields } from '~~/dapp/hooks/useGame';
import Loading from '~~/components/Loading';
import { Card, Text, Heading, Flex, Box, Separator, Button, Tabs } from '@radix-ui/themes'; // Removed Tooltip here as it was for debugging
import { ChevronLeft, Star, Download } from 'lucide-react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import useNetworkConfig from '~~/hooks/useNetworkConfig';
import { CONTRACT_PACKAGE_VARIABLE_NAME } from '~~/config/network';
import { useFetchReviews } from '~~/dapp/hooks/useFetchReviews';
import ReviewCard from '~~/dapp/components/review/ReviewCard';
import { CreateReviewForm } from '../components/review/CreateReviewForm';
import { useFetchGuides } from '~~/dapp/hooks/useFetchGuides';
import GuideCard from '~~/dapp/components/guide/GuideCard';
import { CreateGuideForm } from '../components/guide/CreateGuideForm';
import UploadGameFile from '~~/dapp/components/game/UploadGameFile';
import PurchaseDownloadButton from '~~/dapp/components/game/PurchaseDownloadButton';
import { useToast } from '~~/components/ui/use-toast';
// import { useGameContract } from '~~/hooks/useGameContract'; // Commented out
import type { IGame } from '~~/types/game.types';
import { useQuery } from '@tanstack/react-query';
// import { useAccount } from 'wagmi'; // Commented out wagmi import
// import { usePurchase as useWagmiPurchase } from '../hooks/usePurchase'; // Commented out wagmi import
// import { useDownload as useWagmiDownload } from '../hooks/useDownload'; // Commented out wagmi import
import { CardContent, CardHeader } from '~~/components/ui/Card';
import { Input } from '~~/components/ui/Input';
import { Textarea } from '~~/components/ui/Textarea';
import { useReviews } from '../hooks/useReviews';
import { useGuides } from '../hooks/useGuides';

interface Game {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  creator: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Review {
  id: string;
  content: string;
  rating: number;
  author: string;
  createdAt: Date;
}

interface Guide {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export const GameDetailPage: FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { data: gameData, isLoading: isLoadingGame, error: gameError, refetch: refetchGame } = useGame(gameId);
  const currentAccount = useCurrentAccount(); 
  const suiClient = useSuiClient();
  const networkConfig = useNetworkConfig();
  const gamePackageId = networkConfig.useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME);
  const navigate = useNavigate();
  const { toast } = useToast();
  // const { contract } = useGameContract(); // Commented out

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCapId, setAdminCapId] = useState<string | null>(null);
  const [isAdminCheckLoading, setIsAdminCheckLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'reviews' | 'guides'>('reviews');

  const gameFields = getGameFields(gameData);
  // console.log("[GameDetailPage] gameFields:", gameFields); 

  useEffect(() => {
    // console.log('[GameDetailPage] gameData:', gameData);
    // console.log('[GameDetailPage] gameFields:', gameFields);
    // if (gameFields) {
    //   console.log('[GameDetailPage] gameFields.reviews:', gameFields.reviews);
    //   console.log('[GameDetailPage] gameFields.guides:', gameFields.guides);
    // }
  }, [gameData, gameFields]);

  const reviewsTableId = gameFields?.reviews?.fields?.id?.id as string | undefined;
  const guidesTableId = gameFields?.guides?.fields?.id?.id as string | undefined;
  
  // console.log("[GameDetailPage] reviewsTableId:", reviewsTableId);
  // console.log("[GameDetailPage] guidesTableId:", guidesTableId);

  const { reviews, isLoading: isLoadingReviews, error: reviewsError, refetch: refetchReviews } = useFetchReviews(reviewsTableId);
  const { guides, isLoading: isLoadingGuides, error: guidesError, refetch: refetchGuides } = useFetchGuides(guidesTableId);

  // Admin check effect (keep as is)
  useEffect(() => {
    if (!currentAccount?.address || !gameId || !gamePackageId || gamePackageId === '0xNOTDEFINED') {
      setIsAdmin(false);
      setAdminCapId(null);
      return;
    }
    const checkAdminStatus = async () => {
      setIsAdminCheckLoading(true);
      setIsAdmin(false); // Reset state before check
      setAdminCapId(null);
      try {
        const adminCapType = `${gamePackageId}::game::AdminCap`;
        const ownedObjects = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          filter: { StructType: adminCapType }, // Filter directly for AdminCap type
          options: { showType: true }, // We only need type and objectId initially
        });

        if (!ownedObjects.data || ownedObjects.data.length === 0) {
          console.log('No AdminCaps found for user.');
          setIsAdminCheckLoading(false);
          return; // No caps found
        }

        const potentialCapIds = ownedObjects.data.map(obj => obj.data?.objectId).filter(Boolean) as string[];
        
        if (potentialCapIds.length === 0) {
            setIsAdminCheckLoading(false);
            return;
        }

        // Fetch content for potential caps
        const capsContent = await suiClient.multiGetObjects({
          ids: potentialCapIds,
          options: { showContent: true },
        });

        // Find the cap matching the current gameId
        for (const cap of capsContent) {
          if (cap.data?.content?.dataType === 'moveObject') {
            const fields = cap.data.content.fields as { game_id?: string }; // Assuming field name
            if (fields.game_id === gameId) {
              console.log('AdminCap found for this game:', cap.data.objectId);
              setIsAdmin(true);
              setAdminCapId(cap.data.objectId);
              break; // Found the matching cap
            }
          }
        }
      } catch (error) {         
        console.error('Error checking admin status:', error);
        // Handle error appropriately, maybe show a message
      } finally {
        setIsAdminCheckLoading(false);
      }
    };
    checkAdminStatus();
  }, [currentAccount?.address, gameId, gamePackageId, suiClient]); // Dependencies for the check

  // Success handlers (keep as is)
  const handleReviewSuccess = async (): Promise<void> => {
      console.log('Review created successfully, refetching reviews and game data...');
      await refetchReviews();
      await refetchGame();
      setIsCreatingReview(false);
  };
  const handleGuideSuccess = async (): Promise<void> => {
      console.log('Guide created successfully, refetching guides and game data...');
      await refetchGuides();
      await refetchGame();
      setIsCreatingGuide(false);
  };

  const [isCreatingReview, setIsCreatingReview] = useState(false);
  const [isCreatingGuide, setIsCreatingGuide] = useState(false);

  // Helper functions need to be defined before use in the main return block

  // Renders the list of reviews or loading/error state
  const renderReviewListContent = () => {
      if (isLoadingReviews) return <Loading />;
      if (reviewsError) return <Text className="text-destructive">Error loading reviews: {reviewsError}</Text>;
      if (reviews.length === 0 && !isCreatingReview) return <Text className="text-realm-text-secondary">No reviews yet. Be the first!</Text>;
      if (reviews.length > 0) {
      return (
                 <Flex direction="column" gap="3"> {/* Style the review list container */}
                    {reviews.map((review) => (
                        <ReviewCard key={review.reviewId} review={review} />
                    ))}
                 </Flex>
          );
      }
      return null; // Render nothing if loading form and no reviews yet
  };

  // Renders the list of guides or loading/error state
  const renderGuideListContent = () => {
      if (isLoadingGuides) return <Loading />;
      if (guidesError) return <Text className="text-destructive">Error loading guides: {guidesError}</Text>;
      if (guides.length === 0 && !isCreatingGuide) return <Text className="text-realm-text-secondary">No guides available yet. Share your knowledge!</Text>;
      if (guides.length > 0) {
      return (
                 <Flex direction="column" gap="3"> {/* Style the guide list container */}
                   {guides.map((guide) => {
                        return <GuideCard key={guide.guideId} guide={guide} />;
                    })}
                 </Flex>
      );
      }
      return null; // Render nothing if loading form and no guides yet
  };

  const handlePurchase = async () => {
    console.warn("handlePurchase logic is temporarily commented out.");
    toast({ title: 'Purchase Temporarily Disabled', description: 'Contract interaction needs review.', type: 'info' });
    // if (!contract || !gameId) return;
    // try {
    //   const tx = await contract.purchaseGame(parseInt(gameId), {
    //     value: gameFields?.price,
    //   });
    //   await tx.wait();
    //   toast({
    //     title: '购买成功',
    //     description: '游戏已添加到您的库中',
    //   });
    // } catch (error) {
    //   toast({
    //     title: '购买失败',
    //     description: error instanceof Error ? error.message : '未知错误',
    //     type: 'error',
    //   });
    // }
  };

  const handleDownload = async () => {
    console.warn("handleDownload logic is temporarily commented out.");
    toast({ title: 'Download Temporarily Disabled', description: 'Contract interaction needs review.', type: 'info' });
    // if (!contract || !gameId) return;
    // try {
    //   const tx = await contract.downloadGame(parseInt(gameId));
    //   await tx.wait();
    //   toast({
    //     title: '下载成功',
    //     description: '游戏文件已准备就绪',
    //   });
    // } catch (error) {
    //   toast({
    //     title: '下载失败',
    //     description: error instanceof Error ? error.message : '未知错误',
    //     type: 'error',
    //   });
    // }
  };

  // --- Loading / Error / Not Found States --- 
  if (isLoadingGame || isAdminCheckLoading) {
    return <Loading />;
  }

  if (gameError || !gameFields) {
    return <Text className="text-destructive">Error loading game details or game not found.</Text>;
  }

  const displayImageUrl = gameFields.imageUrl || `https://source.unsplash.com/random/800x600/?game,${encodeURIComponent(gameFields.name || 'concept')}`;

  // --- Main Content --- 
  return (
    <Box className="space-y-6">
      {/* Back Button */}
      <RouterLink to="/" className="inline-flex items-center gap-1 text-realm-text-secondary hover:text-realm-neon-primary transition-colors">
        <ChevronLeft size={20} />
        <Text size="2">Back to Discover</Text>
      </RouterLink>

      {/* Top Game Info Section */}
      <Flex direction={{ initial: 'column', md: 'row' }} gap="6">
        {/* Left: Image */}
        <Box className="w-full md:w-1/3 lg:w-2/5 flex-shrink-0">
          <div className="aspect-video bg-realm-surface-secondary rounded-lg overflow-hidden shadow-lg">
            <img 
              src={displayImageUrl} 
              alt={`${gameFields.name} cover`} 
              className="w-full h-full object-cover"
            />
          </div>
        </Box>

        {/* Right: Details & Actions */}
        <Flex direction="column" gap="3" className="flex-grow">
          <Heading as="h1" size="8" weight="bold" className="text-realm-neon-primary">
            {gameFields.name || 'Untitled Game'}
          </Heading>
          <Text size="3" className="text-realm-text-secondary">
            By: {gameFields.creatorName || 'Unknown Developer'}
          </Text>
          
          <Flex wrap="wrap" gap="2" align="center">
            {gameFields.genre && (
              <Text size="2" className="bg-realm-surface-secondary text-realm-text-secondary px-3 py-1 rounded-md">
                {gameFields.genre}
              </Text>
            )}
             {/* Platform can be added here similarly if available */}
          </Flex>

          {typeof gameFields.overallRate === 'number' && gameFields.overallRate > 0 && (
            <Flex align="center" gap="1.5">
              <Star size={20} className="text-realm-neon-primary" />
              <Text size="4" weight="medium" className="text-realm-neon-primary">
                {gameFields.overallRate.toFixed(1)}
              </Text>
              <Text size="2" className="text-realm-text-secondary">
                ({gameFields.reviewsCount || 0} reviews)
              </Text>
            </Flex>
          )}

          <Text size="5" weight="medium" className="text-realm-text-primary mt-2">
            Price: {gameFields.price ? `${(Number(gameFields.price) / 1_000_000_000).toFixed(2)} SUI` : 'N/A'}
          </Text>

          <Box className="mt-auto pt-4"> {/* Push button to bottom of this flex container */}
            <PurchaseDownloadButton 
              gameId={gameId!} 
              gameData={gameData}
              refetchGame={refetchGame}
            />
          </Box>
        </Flex>
      </Flex>

      <Separator size="4" className="my-6 border-realm-border" />

      {/* Game Description */}
      <Box>
        <Heading as="h2" size="6" className="text-realm-neon-secondary mb-3">
          Description
        </Heading>
        <Text as="p" size="3" className="text-realm-text-primary leading-relaxed">
          {gameFields.description || 'No description available.'}
        </Text>
      </Box>

      <Separator size="4" className="my-6 border-realm-border" />

      {/* Admin Upload Section - Conditionally Rendered */}
      <Flex direction="column" gap="4">
        <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as 'reviews' | 'guides')}>
          <Tabs.List>
            <Tabs.Trigger value="reviews">Reviews</Tabs.Trigger>
            <Tabs.Trigger value="guides">Guides</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="reviews">
            <Flex direction="column" gap="4" className="mt-4">
              {renderReviewListContent()}
              {isCreatingReview && reviewsTableId && (
                <CreateReviewForm 
                  gameId={gameId!} 
                  onSubmit={async (data) => { 
                    console.log("Submitting review data:", data, "for table:", reviewsTableId);
                    // Placeholder for actual submission call
                    // await submitReviewTransaction(reviewsTableId, data.content, data.rating);
                    await handleReviewSuccess(); 
                  }}
                />
              )}
              {!isCreatingReview && (
                <Button 
                  onClick={() => setIsCreatingReview(true)} 
                  disabled={!reviewsTableId || !currentAccount} 
                  className="mt-2 self-start"
                >
                  Add Your Review
                </Button>
                // TODO: Add a cancel button here if isCreatingReview is true and form is shown without internal cancel
              )}
            </Flex>
          </Tabs.Content>
          <Tabs.Content value="guides">
            <Flex direction="column" gap="4" className="mt-4">
              {renderGuideListContent()}
              {isCreatingGuide && guidesTableId && (
                <CreateGuideForm 
                  gameId={gameId!} 
                  onSubmit={async (data) => { 
                    console.log("Submitting guide data:", data, "for table:", guidesTableId);
                    // Placeholder for actual submission call
                    // await submitGuideTransaction(guidesTableId, data.title, data.content);
                    await handleGuideSuccess(); 
                  }}
                />
              )}
              {!isCreatingGuide && (
                <Button 
                  onClick={() => setIsCreatingGuide(true)} 
                  disabled={!guidesTableId || !currentAccount} 
                  className="mt-2 self-start"
                >
                  Create Guide
                </Button>
                // TODO: Add a cancel button here if isCreatingGuide is true and form is shown without internal cancel
              )}
            </Flex>
          </Tabs.Content>
        </Tabs.Root>
      </Flex>
    </Box>
  );
};

export default GameDetailPage; 