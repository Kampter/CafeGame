import React, { useState, useMemo } from 'react';
import { Button, Spinner, Text, Tooltip, Flex } from '@radix-ui/themes';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { getGameFields } from '~~/dapp/hooks/useGame'; // Assuming this helper exists and works
import useNetworkConfig from '~~/hooks/useNetworkConfig';
import { CONTRACT_PACKAGE_VARIABLE_NAME } from '~~/config/network';
import { toast } from 'react-hot-toast';
import { LockClosedIcon, DownloadIcon, VercelLogoIcon } from '@radix-ui/react-icons';
import { bcs } from '@mysten/sui/bcs'; // Import bcs

// Placeholders for imports needed later for download/decrypt
// import { SealClient, SessionKey, NoAccessError, EncryptedObject, getAllowlistedKeyServers } from '@mysten/seal';
// import { WalrusClient } from '@mysten/walrus';
// import { fromHex } from '@mysten/sui/utils';
// import walrusWasmUrl from '@mysten/walrus-wasm/web/walrus_wasm_bg.wasm?url'; 

interface PurchaseDownloadButtonProps {
  gameId: string | undefined;
  gameData: any; // Type this more strictly if possible, maybe using the return type of useGame
  refetchGame: () => void; // Function to refetch game data after purchase
}

type ButtonState = 'idle' | 'checkingAccess' | 'purchasing' | 'downloading' | 'decrypting' | 'error';

// Simple Spinner component using Radix Icon
const LoadingSpinner = () => (
    <VercelLogoIcon className="animate-spin h-4 w-4 mr-2" /> 
);

export function PurchaseDownloadButton({ gameId, gameData, refetchGame }: PurchaseDownloadButtonProps) {
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const networkConfig = useNetworkConfig();
  const gamePackageId = networkConfig.useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME);

  // Memoize game fields extraction
  const gameFields = useMemo(() => getGameFields(gameData), [gameData]);

  // Determine if the current user has access
  const hasAccess = useMemo(() => {
    if (!currentAccount?.address || !gameFields?.access_list) {
      return false;
    }
    return gameFields.access_list.includes(currentAccount.address);
  }, [currentAccount?.address, gameFields?.access_list]);

  // --- Purchase Logic --- 
  const handlePurchase = async () => {
    if (!currentAccount || !gameId || !gameFields || !gamePackageId || gamePackageId === '0xNOTDEFINED') {
      setErrorMsg('Cannot purchase: Missing required information or connection.');
      setButtonState('error');
      return;
    }
    if (hasAccess) {
        toast.success("You already own this game!");
        return; // Already has access
    }

    setButtonState('purchasing');
    setErrorMsg(null);
    toast.loading('Preparing purchase transaction...')

    try {
        const tx = new Transaction();
        // Ensure price is a string or bigint for bcs.U64
        const priceString = typeof gameFields.price === 'bigint' 
                            ? gameFields.price.toString() 
                            : String(gameFields.price);

        // Ensure user has enough balance? (Optional but good UX)
        // const balance = await suiClient.getBalance({ owner: currentAccount.address });
        // if (BigInt(balance.totalBalance) < priceMIST + GAS_BUDGET) { ... }
        
        // Split coin for payment using bcs.U64
        const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure(bcs.U64.serialize(priceString))]);

        tx.moveCall({
            target: `${gamePackageId}::game::purchase_game`,
            arguments: [
                tx.object(gameId!),
                paymentCoin,
            ],
        });
        tx.setSender(currentAccount.address);
        // Optionally set a gas budget
        // tx.setGasBudget(10000000); 

        toast.dismiss();
        toast.loading('Please approve the purchase in your wallet...');
        const result = await signAndExecuteTransaction({ transaction: tx });
        toast.dismiss();
        toast.loading(`Finalizing transaction (${result.digest.substring(0,6)}...)...`);

        // Wait for transaction finality (optional but recommended for state update)
        await suiClient.waitForTransaction({ digest: result.digest, options: { showEffects: true } });
        toast.dismiss();
        toast.success('Purchase successful!');

        // Refetch game data to update access list and button state
        refetchGame(); 
        setButtonState('idle');

    } catch (error: any) {
        console.error('Purchase failed:', error);
        setErrorMsg(`Purchase failed: ${error.message}`);
        setButtonState('error');
        toast.dismiss();
        toast.error(`Purchase failed: ${error.message}`);
    }
  };

  // --- Download Logic Placeholder --- 
  const handleDownload = async () => {
    if (!currentAccount || !gameId || !gameFields?.game_package_bolb_id) {
        setErrorMsg('Cannot download: Missing required information.');
        setButtonState('error');
        return;
    }
    if (!hasAccess) {
        setErrorMsg('Cannot download: Access denied.');
        setButtonState('error');
        return; // Should not happen if button logic is correct
    }
    
    setButtonState('downloading');
    setErrorMsg(null);
    toast.loading('Starting download process...');
    
    const blobId = gameFields.game_package_bolb_id;
    console.log('Attempting to download blob:', blobId);

    try {
        // TODO: 
        // 1. Initialize Walrus Client (needs wasmUrl)
        // const walrusClient = new WalrusClient({...});
        // 2. Read Blob: const encryptedBytes = await walrusClient.readBlob({ blobId });
        // 3. Get Seal Session Key: const sessionKey = await getSealSessionKey(); <-- HOW?
        // 4. Initialize Seal Client
        // const sealClient = new SealClient({...});
        // 5. Build Access Proof TxBytes: const txBytes = await buildAccessProofTxBytes(...);
        // 6. Fetch Seal Keys: await sealClient.fetchKeys({...});
        // 7. Decrypt: const decryptedBytes = await sealClient.decrypt({...});
        // 8. Determine Filename & MIME Type <-- HOW?
        // 9. Trigger file download (create Blob, ObjectURL, click link)

        toast.dismiss();
        toast.error('Download logic not implemented yet.'); // Placeholder
        setButtonState('idle'); // Reset for now
        
    } catch (error: any) {
        console.error('Download failed:', error);
        setErrorMsg(`Download failed: ${error.message}`);
        setButtonState('error');
        toast.dismiss();
        toast.error(`Download failed: ${error.message}`);
    }
  };

  // --- Render Logic --- 
  const isLoading = ['purchasing', 'downloading', 'decrypting'].includes(buttonState);

  if (!gameId || !gameFields) {
      return <Button disabled size="3" className="bg-muted text-muted-foreground cursor-not-allowed">Loading Game Info...</Button>;
  }

  if (!currentAccount) {
      // Use ConnectButton styling? Or a generic disabled button
      return <Button disabled size="3" className="bg-muted text-muted-foreground cursor-not-allowed">Connect Wallet to Interact</Button>;
  }

  return (
    <Flex direction="column" gap="2" align="stretch" className="w-full"> {/* Ensure full width */}
      {hasAccess ? (
        // Download Button
        <Button 
            size="3" 
            onClick={handleDownload} 
            disabled={isLoading || !gameFields.game_package_bolb_id} 
            className={`inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors duration-200 ${ 
                !gameFields.game_package_bolb_id || isLoading 
                ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                : 'bg-accent text-accent-foreground hover:bg-accent/90' 
            }`}
            title={!gameFields.game_package_bolb_id ? "No game file uploaded yet" : "Download Game"}
        >
          {isLoading && buttonState !== 'purchasing' ? <LoadingSpinner /> : <DownloadIcon className="h-4 w-4 mr-2" />} 
          Download Game
          {!gameFields.game_package_bolb_id && <LockClosedIcon className="h-4 w-4 ml-2 opacity-50" />}
        </Button>
      ) : (
        // Purchase Button
        <Tooltip content={`Price: ${gameFields?.price ?? 'N/A'} MIST`}>
            <Button 
              size="3" 
              onClick={handlePurchase} 
              disabled={isLoading}
              className={`inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors duration-200 ${ 
                isLoading 
                ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                : 'bg-accent text-accent-foreground hover:bg-accent/90' 
              }`}
            >
            {isLoading && buttonState === 'purchasing' ? <LoadingSpinner /> : null} 
            Purchase Game
            </Button>
        </Tooltip>
      )}
      {errorMsg && (
        <Text className="text-red-600 text-xs mt-1">Error: {errorMsg}</Text> // Smaller error text
      )}
    </Flex>
  );
}

export default PurchaseDownloadButton;
 