import { FC, useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import useGame, { getGameFields } from '~~/dapp/hooks/useGame';
// import Layout from '~~/components/layout/Layout'; // Remove Layout
import Loading from '~~/components/Loading';
import { Card, Text, Heading, Flex, Box, Separator, Button, Tabs } from '@radix-ui/themes'; // Keep Radix components
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import useNetworkConfig from '~~/hooks/useNetworkConfig';
import { CONTRACT_PACKAGE_VARIABLE_NAME } from '~~/config/network';
import { useFetchReviews } from '~~/dapp/hooks/useFetchReviews';
import ReviewCard from '~~/dapp/components/review/ReviewCard';
import CreateReviewForm from '~~/dapp/components/review/CreateReviewForm';
import { useFetchGuides } from '~~/dapp/hooks/useFetchGuides';
import GuideCard from '~~/dapp/components/guide/GuideCard';
import CreateGuideForm from '~~/dapp/components/guide/CreateGuideForm';
import UploadGameFile from '~~/dapp/components/game/UploadGameFile';
import PurchaseDownloadButton from '~~/dapp/components/game/PurchaseDownloadButton';

const GameDetailPage: FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { data: gameData, isLoading: isLoadingGame, error: gameError, refetch: refetchGame } = useGame(gameId);
  const currentAccount = useCurrentAccount(); 
  const suiClient = useSuiClient();
  const networkConfig = useNetworkConfig();
  const gamePackageId = networkConfig.useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCapId, setAdminCapId] = useState<string | null>(null);
  const [isAdminCheckLoading, setIsAdminCheckLoading] = useState(false);

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
  const handleReviewSuccess = () => {
      console.log('Review created successfully, refetching reviews and game data...');
      refetchReviews();
      refetchGame();
      setIsCreatingReview(false);
  };
  const handleGuideSuccess = () => {
      console.log('Guide created successfully, refetching guides and game data...');
      refetchGuides();
      refetchGame();
      setIsCreatingGuide(false);
  };

  const [isCreatingReview, setIsCreatingReview] = useState(false);
  const [isCreatingGuide, setIsCreatingGuide] = useState(false);

  // Helper functions need to be defined before use in the main return block

  // Renders the list of reviews or loading/error state
  const renderReviewListContent = () => {
      if (isLoadingReviews) return <Loading />;
      if (reviewsError) return <Text className="text-red-600">Error loading reviews: {reviewsError}</Text>;
      if (reviews.length === 0 && !isCreatingReview) return <Text className="text-muted-foreground">No reviews yet. Be the first!</Text>;
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
      if (guidesError) return <Text className="text-red-600">Error loading guides: {guidesError}</Text>;
      // console.log('[GameDetailPage] Guides array for rendering:', guides);
      if (guides.length === 0 && !isCreatingGuide) return <Text className="text-muted-foreground">No guides available yet. Share your knowledge!</Text>;
      if (guides.length > 0) {
      return (
                 <Flex direction="column" gap="3"> {/* Style the guide list container */}
                   {guides.map((guide) => {
                        // console.log('[GameDetailPage] Rendering GuideCard for:', guide);
                        return <GuideCard key={guide.guideId} guide={guide} />;
                    })}
                 </Flex>
      );
      }
      return null; // Render nothing if loading form and no guides yet
  };

  // --- Loading / Error / Not Found States --- 
  if (isLoadingGame || isAdminCheckLoading) return <Loading />;
  if (gameError) return <Text className="text-red-600 p-6">Error loading game: {gameError.message}</Text>; // Add padding
  if (!gameFields) return <Text className="text-muted-foreground p-6">Game not found.</Text>; // Add padding

  // --- Main Content --- 
  return (
    // Removed Layout wrapper
    <Flex direction="column" gap="8" className="flex-grow w-full"> {/* Use full width, gap for sections */} 

      {/* Back Button - Positioned at top */}
      <Box className="mb-0"> {/* Reduce bottom margin */}
          <RouterLink to={'/'} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeftIcon />
              <Text size="2">Back</Text> {/* English text */} 
          </RouterLink>
      </Box>

      {/* --- Game Header Section --- */}
      <Flex direction={{ initial: 'column', md: 'row' }} gap="8">
        {/* Left Column: Image/Video Placeholder */}
        <Box className="w-full md:w-1/3 lg:w-2/5 flex-shrink-0">
          <Box className="aspect-video bg-muted rounded-lg shadow-sm flex items-center justify-center"> 
            {/* TODO: Replace with actual game image/video carousel */}
            <Text className="text-muted-foreground">Game Media Placeholder</Text>
          </Box>
        </Box>

        {/* Right Column: Details & Actions */}
        <Flex direction="column" gap="4" className="w-full">
          <Heading as="h1" size="8" weight="bold" className="text-foreground">{gameFields.name}</Heading>
          <Flex gap="4" align="center" wrap="wrap"> {/* Wrap tags/info */} 
            <Text size="3" className="text-muted-foreground">{gameFields.genre}</Text>
            <Separator orientation="vertical" size="2" />
            <Text size="3" className="text-muted-foreground">{gameFields.platform}</Text>
             {/* TODO: Display rating more prominently */}
             {gameFields.overall_rate && (
                <>
                    <Separator orientation="vertical" size="2" />
                    <Text size="3" className="text-amber-600 font-medium">⭐ {gameFields.overall_rate}</Text>
                </>
             )}
          </Flex>
          {/* Price and Purchase Button */} 
          <Flex align="center" justify="between" gap="4" className="mt-4">
             <Text size="5" weight="medium" className="text-foreground">{gameFields.price ?? 0} MIST</Text>
             {gameId && currentAccount && (
                <PurchaseDownloadButton
                  gameId={gameId}
                  gameData={gameData} 
                  refetchGame={refetchGame}
                  // We might need to pass styling props or wrap this button later 
                />
              )}
          </Flex>
        </Flex>
      </Flex>

      {/* --- Description Section --- */}
      <Box className="space-y-2">
          <Heading as="h2" size="5" className="font-semibold text-foreground">Description</Heading>
          <Text as="p" className="text-muted-foreground leading-relaxed">{gameFields.description}</Text>
      </Box>

      {/* --- Admin Upload Section --- */}
      {isAdmin && gameId && adminCapId && (
        <Box className="bg-card rounded-lg shadow-sm p-5 mt-6"> {/* Style container */}
          <UploadGameFile gameId={gameId} adminCapId={adminCapId} />
        </Box>
      )}

      {/* --- Tabs Section (Reviews & Guides) --- */}
      {(reviewsTableId || guidesTableId) && ( 
        <Tabs.Root defaultValue="reviews" className="w-full mt-6">
            {/* Style Tabs List and Triggers */}
            <Tabs.List className="border-b border-border mb-4">
                {reviewsTableId && (
                    <Tabs.Trigger 
                      value="reviews" 
                      className="px-4 py-2 text-muted-foreground data-[state=active]:text-accent data-[state=active]:border-accent data-[state=active]:border-b-2 data-[state=active]:font-medium transition-colors"
                    >
                        Reviews
                    </Tabs.Trigger>
                )}
                {guidesTableId && (
                    <Tabs.Trigger 
                      value="guides" 
                      className="px-4 py-2 text-muted-foreground data-[state=active]:text-accent data-[state=active]:border-accent data-[state=active]:border-b-2 data-[state=active]:font-medium transition-colors"
                    >
                        Guides
                    </Tabs.Trigger>
                )}
            </Tabs.List>

            <Box pt="4"> {/* Increased padding */}
                {/* Reviews Tab Content */}
                {reviewsTableId && gameId && (
                    <Tabs.Content value="reviews">
                        <Flex direction="column" gap="6"> {/* Increased gap */} 
                            {/* Create Button - Styled & English text */} 
                            {!isCreatingReview && (
                                <Flex justify="end"> 
                                     <Button 
                                       variant="outline" 
                                       color="gray"
                                       highContrast
                                       className="border-accent text-accent hover:bg-accent/10 hover:text-accent transition-colors"
                                       onClick={() => setIsCreatingReview(true)}
                                      >
                                        Write Review
                                    </Button>
                                </Flex>
                            )}
                            {/* Create Form Container & Cancel Button */}
                            {isCreatingReview && (
                                <Box className="bg-card rounded-lg shadow-sm p-5 border border-border space-y-4"> {/* Styled container */}
                                    <CreateReviewForm gameId={gameId} onSuccess={handleReviewSuccess} />
                                    <Button variant="ghost" color="gray" onClick={() => setIsCreatingReview(false)} >Cancel</Button>
                                </Box>
                            )}
                            {/* Review List - Needs ReviewCard styling */}
                            {renderReviewListContent()}
                        </Flex>
                    </Tabs.Content>
                )}

                {/* Guides Tab Content */}
                {guidesTableId && gameId && (
                    <Tabs.Content value="guides">
                        <Flex direction="column" gap="6"> {/* Increased gap */} 
                            {/* Create Button - Styled & English text */}
                             {!isCreatingGuide && (
                                <Flex justify="end">
                                     <Button 
                                       variant="outline" 
                                       color="gray"
                                       highContrast
                                       className="border-accent text-accent hover:bg-accent/10 hover:text-accent transition-colors"
                                       onClick={() => setIsCreatingGuide(true)}
                                      >
                                        Create Guide
                                    </Button>
                                </Flex>
                            )}
                            {/* Create Form Container & Cancel Button */}
                            {isCreatingGuide && (
                                <Box className="bg-card rounded-lg shadow-sm p-5 border border-border space-y-4"> {/* Styled container */}
                                    <CreateGuideForm gameId={gameId} onSuccess={handleGuideSuccess} />
                                    <Button variant="ghost" color="gray" onClick={() => setIsCreatingGuide(false)}>Cancel</Button>
                                </Box>
                            )}
                            {/* Guide List - Needs GuideCard styling */}
                            {renderGuideListContent()}
                        </Flex>
                    </Tabs.Content>
                )}
            </Box>
        </Tabs.Root>
      )}
    </Flex>
  );
};

export default GameDetailPage; 