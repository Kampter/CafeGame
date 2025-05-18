import { FC, useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import useGame, { getGameFields } from '~~/dapp/hooks/useGame';
import Loading from '~~/components/Loading';
import { Text, Heading, Flex, Box, Separator, Button, Tabs, Card } from '@radix-ui/themes';
import { ChevronLeft, Star } from 'lucide-react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import useNetworkConfig from '~~/hooks/useNetworkConfig';
import { CONTRACT_PACKAGE_VARIABLE_NAME } from '~~/config/network';
import { useFetchReviews } from '~~/dapp/hooks/useFetchReviews';
import ReviewCard from '~~/dapp/components/review/ReviewCard';
import { CreateReviewForm } from '../components/review/CreateReviewForm';
import { useFetchGuides } from '~~/dapp/hooks/useFetchGuides';
import GuideCard from '~~/dapp/components/guide/GuideCard';
import { CreateGuideForm } from '../components/guide/CreateGuideForm';
import PurchaseDownloadButton from '~~/dapp/components/game/PurchaseDownloadButton';
import { useToast } from '~~/components/ui/use-toast';
// import { useGameContract } from '~~/hooks/useGameContract'; // Commented out

export const GameDetailPage: FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { data: gameData, isLoading: isLoadingGame, error: gameError, refetch: refetchGame } = useGame(gameId);
  const currentAccount = useCurrentAccount(); 
  const suiClient = useSuiClient();
  const networkConfig = useNetworkConfig();
  const gamePackageId = networkConfig.useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME);
  const { toast } = useToast();
  // const { contract } = useGameContract(); // Commented out

  const [isAdminCheckLoading, setIsAdminCheckLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'reviews' | 'guides'>('reviews');

  const gameFields = getGameFields(gameData);
  console.log('[GameDetailPage] gameData:', gameData);
  console.log('[GameDetailPage] gameFields:', gameFields);
  console.log('[GameDetailPage] gameFields.reviews:', gameFields?.reviews);
  console.log('[GameDetailPage] gameFields.guides:', gameFields?.guides);

  const gameObjectOwner = gameData?.data?.owner;

  useEffect(() => {
    // Admin check logic might use gameId, currentAccount, etc.
    // For now, assuming it's self-contained or uses already declared variables.
  }, [gameData, gameFields]); // Simplified deps for now

  let displayOwnerString: string = 'N/A';
  if (gameObjectOwner) {
    if (typeof gameObjectOwner === 'string' && gameObjectOwner === 'Immutable') {
      displayOwnerString = 'Immutable';
    } else if (typeof gameObjectOwner === 'object' && 'AddressOwner' in gameObjectOwner && typeof gameObjectOwner.AddressOwner === 'string') {
      displayOwnerString = formatAddress(gameObjectOwner.AddressOwner);
    } else if (typeof gameObjectOwner === 'object' && 'ObjectOwner' in gameObjectOwner && typeof gameObjectOwner.ObjectOwner === 'string') {
      displayOwnerString = formatAddress(gameObjectOwner.ObjectOwner);
    } else if (typeof gameObjectOwner === 'object' && 'Shared' in gameObjectOwner) {
      displayOwnerString = 'Shared';
    }
  }

  const reviewsTableId = gameFields?.reviews?.id as string | undefined;
  const guidesTableId = gameFields?.guides?.id as string | undefined;
  
  const { reviews, isLoading: isLoadingReviews, error: reviewsError, refetch: refetchReviews } = useFetchReviews(reviewsTableId);
  const { guides, isLoading: isLoadingGuides, error: guidesError, refetch: refetchGuides } = useFetchGuides(guidesTableId);

  // Admin check effect (modified to use new state)
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [userAdminCapId, setUserAdminCapId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentAccount?.address || !gameId || !gamePackageId || gamePackageId === '0xNOTDEFINED') {
      setUserIsAdmin(false);
      setUserAdminCapId(null);
      return;
    }
    const checkAdminStatus = async () => {
      setIsAdminCheckLoading(true);
      setUserIsAdmin(false); 
      setUserAdminCapId(null);
      try {
        const adminCapType = `${gamePackageId}::game::AdminCap`;
        const ownedObjects = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          filter: { StructType: adminCapType }, 
          options: { showType: true }, 
        });

        if (!ownedObjects.data || ownedObjects.data.length === 0) {
          setIsAdminCheckLoading(false);
          return; 
        }

        const potentialCapIds = ownedObjects.data.map(obj => obj.data?.objectId).filter(Boolean) as string[];
        
        if (potentialCapIds.length === 0) {
            setIsAdminCheckLoading(false);
            return;
        }

        const capsContent = await suiClient.multiGetObjects({
          ids: potentialCapIds,
          options: { showContent: true },
        });

        for (const cap of capsContent) {
          if (cap.data?.content?.dataType === 'moveObject') {
            const fields = cap.data.content.fields as { game_id?: string }; 
            if (fields.game_id === gameId) {
              setUserIsAdmin(true);
              setUserAdminCapId(cap.data.objectId);
              break; 
            }
          }
        }
      } catch (error) {         
        console.error('Error checking admin status:', error);
      } finally {
        setIsAdminCheckLoading(false);
      }
    };
    checkAdminStatus();
  }, [currentAccount?.address, gameId, gamePackageId, suiClient]); 

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

  const renderReviewListContent = () => {
      if (isLoadingReviews) return <Loading />;
      if (reviewsError) return <Text className="text-destructive">Error loading reviews: {reviewsError}</Text>;
      if (reviews.length === 0 && !isCreatingReview) return <Text className="text-realm-text-secondary">No reviews yet. Be the first!</Text>;
      if (reviews.length > 0) {
      return (
                 <Flex direction="column" gap="3">
                    {reviews.map((review) => (
                        <ReviewCard key={review.reviewId} review={review} />
                    ))}
                 </Flex>
          );
      }
      return null;
  };

  const renderGuideListContent = () => {
      if (isLoadingGuides) return <Loading />;
      if (guidesError) return <Text className="text-destructive">Error loading guides: {guidesError}</Text>;
      if (guides.length === 0 && !isCreatingGuide) return <Text className="text-realm-text-secondary">No guides available yet. Share your knowledge!</Text>;
      if (guides.length > 0) {
      return (
                 <Flex direction="column" gap="3">
                   {guides.map((guide) => {
                        return <GuideCard key={guide.guideId} guide={guide} />;
                    })}
                 </Flex>
      );
      }
      return null;
  };

  if (isLoadingGame || isAdminCheckLoading) {
    return <Loading />;
  }

  if (gameError || !gameFields) {
    return <Text className="text-destructive">Error loading game details or game not found.</Text>;
  }

  const displayImageUrl = gameFields.imageUrl || `https://source.unsplash.com/random/800x600/?game,${encodeURIComponent(gameFields.name || 'concept')}`;

  return (
    <Box className="space-y-6">
      <RouterLink to="/" className="inline-flex items-center gap-1 text-realm-text-secondary hover:text-realm-neon-primary transition-colors">
        <ChevronLeft size={20} />
        <Text size="2">Back to Discover</Text>
      </RouterLink>

      <Flex direction={{ initial: 'column', md: 'row' }} gap="6">
        <Box className="w-full md:w-1/3 lg:w-2/5 flex-shrink-0">
          <div className="aspect-video bg-realm-surface-secondary rounded-lg overflow-hidden shadow-lg">
            <img 
              src={displayImageUrl} 
              alt={`${gameFields.name} cover`} 
              className="w-full h-full object-cover"
            />
          </div>
        </Box>

        <Flex direction="column" gap="3" className="flex-grow">
          <Heading as="h1" size="8" weight="bold" className="text-realm-neon-primary">
            {gameFields?.name || 'Game Title Not Available'}
          </Heading>
          <Text size="3" className="text-realm-text-secondary">
            Owner: {displayOwnerString}
          </Text>
          
          <Text size="3" className="text-realm-text-primary leading-relaxed">
            {gameFields.description || 'No description available.'}
          </Text>

          <Flex align="center" gap="2" className="mt-2">
            <Star size={20} className="text-yellow-400 fill-yellow-400" />
            <Text size="4" weight="medium" className="text-realm-text-primary">
              {gameFields.overall_rate ? parseFloat(gameFields.overall_rate).toFixed(1) : 'N/A'} / 5 
            </Text>
            <Text size="3" className="text-realm-text-secondary">
              ({gameFields.num_reviews || 0} Reviews)
            </Text>
          </Flex>

          <Text size="5" weight="bold" className="text-realm-neon-secondary mt-1">
            Price: {gameFields.price ? `${(parseInt(gameFields.price) / 1_000_000_000).toFixed(2)} SUI` : 'N/A'}
          </Text>

          <Box className="mt-auto pt-4"> {/* Push button to bottom of this flex container */}
            <PurchaseDownloadButton 
              gameId={gameId!} 
              gameData={gameData}
              refetchGame={refetchGame}
            />
          </Box>

          {userIsAdmin && userAdminCapId && (
            <Box mt="4" p="4" className="bg-realm-surface-secondary border border-realm-border rounded-lg">
              <Heading size="4" mb="3" className="text-realm-neon-danger">Admin Zone</Heading>
              {/* Removed UploadGameFile as it was an unused import, assuming this is where it would go if re-enabled */}
              <Text size="2" className="text-realm-text-secondary">AdminCap ID: {formatAddress(userAdminCapId)}</Text>
              <Text size="2" className="text-realm-text-secondary"> (Upload functionality placeholder)</Text>
            </Box>
          )}
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
            <Tabs.Trigger value="reviews" className="data-[state=active]:text-realm-neon-primary data-[state=active]:border-b-realm-neon-primary">Reviews ({reviews.length})</Tabs.Trigger>
            <Tabs.Trigger value="guides" className="data-[state=active]:text-realm-neon-primary data-[state=active]:border-b-realm-neon-primary">Guides ({guides.length})</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="reviews" className="pt-4">
            <Flex direction="column" gap="4">
              {renderReviewListContent()}
              {!isCreatingReview && (
                <Button variant="outline" onClick={() => setIsCreatingReview(true)} className="self-start mt-3">Write a Review</Button>
              )}
              {isCreatingReview && (
                <Card mt="4">
                  <CreateReviewForm 
                    onSubmit={async (data) => {
                      console.log("Submitting review:", data, "for game:", gameId);
                      toast({ title: "Submitting Review...", description: "Please wait."});
                      await handleReviewSuccess();
                    }}
                  />
                  <Button variant="ghost" color="gray" onClick={() => setIsCreatingReview(false)} className="mt-2">Cancel</Button>
                </Card>
              )}
            </Flex>
          </Tabs.Content>
          <Tabs.Content value="guides" className="pt-4">
            <Flex direction="column" gap="4">
              {renderGuideListContent()}
               {!isCreatingGuide && (
                  <Button variant="outline" onClick={() => setIsCreatingGuide(true)} className="self-start mt-3">Create a Guide</Button>
              )}
              {isCreatingGuide && (
                <Card mt="4">
                  <CreateGuideForm
                    onSubmit={async (data) => {
                      console.log("Submitting guide:", data, "for game:", gameId);
                      toast({ title: "Submitting Guide...", description: "Please wait."});
                      await handleGuideSuccess();
                    }}
                  />
                  <Button variant="ghost" color="gray" onClick={() => setIsCreatingGuide(false)} className="mt-2">Cancel</Button>
                </Card>
              )}
            </Flex>
          </Tabs.Content>
        </Tabs.Root>
      </Flex>
    </Box>
  );
};

// Helper to format address (if not already globally available)
const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

export default GameDetailPage; 