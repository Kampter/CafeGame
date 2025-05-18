import { useState, useMemo } from 'react';
import { Text, Tooltip, Flex } from '@radix-ui/themes';
import { Button } from '~~/components/ui/Button';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { getGameFields } from '~~/dapp/hooks/useGame';
import useNetworkConfig from '~~/hooks/useNetworkConfig';
import { CONTRACT_PACKAGE_VARIABLE_NAME } from '~~/config/network';
import { toast } from 'react-hot-toast';
import { LockClosedIcon, DownloadIcon } from '@radix-ui/react-icons';
import { bcs } from '@mysten/sui/bcs';
// import { useOwnedGame } from '~~/dapp/hooks/useOwnedGame'; // Removed: Module not found
// import { Spinner } from '~~/components/ui/Spinner'; // Removed: Module not found

interface PurchaseDownloadButtonProps {
  gameId: string | undefined;
  gameData: any;
  refetchGame: () => void;
}

type ButtonState = 'idle' | 'checkingAccess' | 'purchasing' | 'downloading' | 'decrypting' | 'error';

export function PurchaseDownloadButton({ gameId, gameData, refetchGame }: PurchaseDownloadButtonProps) {
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const networkConfig = useNetworkConfig();
  const gamePackageId = networkConfig.useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME);

  const gameFields = getGameFields(gameData);
  // const { data: ownedGame, isLoading: isLoadingOwned, refetch: refetchOwnedGame } = useOwnedGame(gameId, currentAccount?.address); // Removed: useOwnedGame not found

  // Derived state for readability
  // const isGameOwner = currentAccount?.address && gameFields?.owner === currentAccount.address; // Removed: gameFields.owner causes issues
  // const gameIsPurchased = !!ownedGame; // Removed: ownedGame depends on useOwnedGame
  // const gameHasFile = !!gameFields?.game_package_url; // Removed: Unused variable

  // const priceInMist = // Removed: Unused variable
  //   gameFields && (typeof gameFields.price === 'string' || typeof gameFields.price === 'number' || typeof gameFields.price === 'bigint')
  //     ? gameFields.price.toString() 
  //     : '0'; 

  const hasAccess = useMemo(() => {
    if (!currentAccount?.address || !gameFields?.access_list) {
      return false;
    }
    return gameFields.access_list.includes(currentAccount.address);
  }, [currentAccount?.address, gameFields?.access_list]);

  const handlePurchase = async () => {
    if (!currentAccount || !gameId || !gameFields || !gamePackageId || gamePackageId === '0xNOTDEFINED') {
      setErrorMsg('Cannot purchase: Missing required information or connection.');
      setButtonState('error');
      toast.error('Purchase pre-check failed. Missing info.');
      return;
    }
    // if (hasAccess) { // Temporarily relying on gameIsPurchased if available, or direct check to access_list
    //     toast.success("You already own this game!");
    //     return; 
    // }
    // For now, let's assume if not hasAccess (from access_list), they need to purchase.
    // The `gameIsPurchased` logic was removed due to missing `useOwnedGame`.
    // We might need a re-fetch or a different way to check purchase status if `access_list` isn't immediately updated.

    setButtonState('purchasing');
    setErrorMsg(null);
    const purchaseToastId = toast.loading('Preparing purchase transaction...');

    try {
        const tx = new Transaction();
        const priceString = gameFields.price && (typeof gameFields.price === 'string' || typeof gameFields.price === 'number' || typeof gameFields.price === 'bigint') 
                            ? gameFields.price.toString() 
                            : '0';
        
        const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure(bcs.U64.serialize(priceString))]);

        tx.moveCall({
            target: `${gamePackageId}::game::purchase_game`,
            arguments: [
                tx.object(gameId!),
                paymentCoin,
            ],
        });
        tx.setSender(currentAccount.address);
        
        toast.loading('Please approve the purchase in your wallet...', { id: purchaseToastId });
        const result = await signAndExecuteTransaction({ transaction: tx });
        
        toast.loading(`Finalizing transaction (${result.digest.substring(0,6)}...)...`, { id: purchaseToastId });
        await suiClient.waitForTransaction({ digest: result.digest, options: { showEffects: true } });
        
        toast.success('Purchase successful!', { id: purchaseToastId });
        refetchGame(); 
        setButtonState('idle');

    } catch (error: any) {
        console.error('Purchase failed:', error);
        const message = error.message || 'An unknown error occurred.';
        setErrorMsg(`Purchase failed: ${message}`);
        setButtonState('error');
        toast.error(`Purchase failed: ${message}`, { id: purchaseToastId });
    }
  };

  const handleDownload = async () => {
    if (!currentAccount || !gameId || !gameFields?.game_package_url) { 
      toast.error('无法下载：缺少必要信息。');
      return;
    }
    if (!hasAccess) {
        setErrorMsg('Cannot download: Access denied.');
        setButtonState('error');
        return; 
    }
    
    setButtonState('downloading');
    setErrorMsg(null);
    const downloadToastId = toast.loading('Starting download process...');
    
    const blobId = gameFields.game_package_url; 
    console.log('Attempting to download blob:', blobId);

    try {
        toast.error('Download logic not implemented yet.', { id: downloadToastId }); 
        setButtonState('idle'); 
        
    } catch (error: any) {
        console.error('Download failed:', error);
        const message = error.message || 'An unknown error occurred.';
        setErrorMsg(`Download failed: ${message}`);
        setButtonState('error');
        toast.error(`Download failed: ${message}`, { id: downloadToastId });
    }
  };

  const opIsLoading = ['purchasing', 'downloading', 'decrypting'].includes(buttonState);

  if (!gameId || !gameFields) {
      return <Button disabled variant="outline" size="lg">Loading Game Info...</Button>;
  }

  if (!currentAccount) {
      return <Button disabled variant="outline" size="lg">Connect Wallet to Interact</Button>;
  }

  return (
    <Flex direction="column" gap="2" align="stretch" className="w-full">
      {hasAccess ? (
        <Button 
            size="lg"
            variant="primary"
            onClick={handleDownload} 
            // isLoading={opIsLoading && buttonState !== 'purchasing'} // Removed: Spinner not found
            disabled={opIsLoading || !gameFields.game_package_url}
            title={!gameFields.game_package_url ? "No game file uploaded yet" : "Download Game"}
        >
          {/* {opIsLoading && buttonState === 'downloading' ? <Spinner /> : <DownloadIcon className="h-4 w-4 mr-2" />} Removed: Spinner not found */}
          <DownloadIcon className="h-4 w-4 mr-2" /> 
          Download Game
          {!gameFields.game_package_url && <LockClosedIcon className="h-4 w-4 ml-2 opacity-50" />}
        </Button>
      ) : (
        <Tooltip content={`Price: ${gameFields?.price && (typeof gameFields.price === 'string' || typeof gameFields.price === 'number' || typeof gameFields.price === 'bigint') ? (Number(gameFields.price.toString()) / 1_000_000_000).toFixed(2) : 'N/A'} SUI`}>
            <Button 
              size="lg" 
              variant="cta"
              onClick={handlePurchase} 
              // isLoading={opIsLoading && buttonState === 'purchasing'} // Removed: Spinner not found
              disabled={opIsLoading}
            >
            Purchase Game
            </Button>
        </Tooltip>
      )}
      {errorMsg && (
        <Text size="1" className="text-realm-neon-warning text-xs mt-1">Error: {errorMsg}</Text> 
      )}
    </Flex>
  );
}

export default PurchaseDownloadButton;
 