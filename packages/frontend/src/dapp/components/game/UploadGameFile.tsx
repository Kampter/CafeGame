import React, { useState, useCallback } from 'react';
import { Button, Card, Flex, Text, Spinner, Box, Heading } from '@radix-ui/themes';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { SealClient, getAllowlistedKeyServers } from '@mysten/seal';
import { WalrusClient } from '@mysten/walrus'; // Assuming walrus SDK is installed
import { Transaction } from '@mysten/sui/transactions';
import { fromHex, toHex } from '@mysten/sui/utils';
import useNetworkConfig from '~~/hooks/useNetworkConfig';
import { CONTRACT_PACKAGE_VARIABLE_NAME } from '~~/config/network';
import { toast } from 'react-hot-toast';

// Import the wasm URL using Vite's ?url syntax
import walrusWasmUrl from '@mysten/walrus-wasm/web/walrus_wasm_bg.wasm?url';

interface UploadGameFileProps {
  gameId: string;
  adminCapId: string; // Pass the verified AdminCap ID
}

// Define states for multi-step process
type UploadStep = 
  | 'idle' 
  | 'encrypting' 
  | 'encoding' 
  | 'registering' 
  | 'writing' 
  | 'certifying' 
  | 'associating' 
  | 'success' 
  | 'error';

const stepMessages: Record<UploadStep, string> = {
  idle: 'Ready to upload',
  encrypting: 'Encrypting file with Seal...',
  encoding: 'Encoding file for Walrus...',
  registering: 'Registering file on chain (Wallet approval needed)...',
  writing: 'Uploading file to Walrus nodes...',
  certifying: 'Certifying file availability (Wallet approval needed)...',
  associating: 'Associating file with game (Wallet approval needed)...',
  success: 'Upload and association successful!',
  error: 'An error occurred during upload.',
};

export function UploadGameFile({ gameId, adminCapId }: UploadGameFileProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState<UploadStep>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [blobId, setBlobId] = useState<string | null>(null);
  const [storageEpochs, setStorageEpochs] = useState<number>(365); // Default to ~1 year

  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const networkConfig = useNetworkConfig();
  const gamePackageId = networkConfig.useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME);

  // Initialize SealClient
  // Note: verifyKeyServers might need adjustment for production
  const sealClient = new SealClient({
    suiClient,
    serverObjectIds: getAllowlistedKeyServers('testnet'), // Or networkConfig.network
    verifyKeyServers: false,
  });

  // Initialize WalrusClient
  const walrusClient = new WalrusClient({
    network: 'testnet', // Or networkConfig.network
    suiClient,
    wasmUrl: walrusWasmUrl, // Provide the wasm URL
    storageNodeClientOptions: {
      timeout: 120_000, // Increase timeout to 120 seconds
      onError: (err) => console.warn('[Walrus Node Error]:', err), // Log individual node errors
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // TODO: Add file size/type validation if necessary for game files
      setFile(selectedFile);
      setUploadStep('idle');
      setErrorMsg(null);
      setBlobId(null);
    }
  };

  const handleEpochChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      setStorageEpochs(value);
    } else {
      setStorageEpochs(1);
    }
  };

  const resetState = () => {
      setFile(null);
      setUploadStep('idle');
      setErrorMsg(null);
      setBlobId(null);
      setStorageEpochs(365);
      // Clear the file input visually if possible (might need ref)
  }

  // Core multi-step upload function (Placeholder)
  const uploadFile = useCallback(async () => {
    // Stricter check at the beginning and store the address
    if (!currentAccount?.address || !file || !gamePackageId || gamePackageId === '0xNOTDEFINED') {
      setErrorMsg('Missing file, wallet connection, or package ID configuration.');
      setUploadStep('error');
      toast.error('Pre-check failed: Wallet not connected or configuration missing.');
      return;
    }
    const senderAddress = currentAccount.address; // Store the address

    setUploadStep('idle');
    setErrorMsg(null);
    let currentBlobId: string | null = null;

    try {
        // Step 0: Read file and Encrypt with Seal
        setUploadStep('encrypting');
        const fileBuffer = await file.arrayBuffer();
        const fileBytes = new Uint8Array(fileBuffer);
        const nonce = crypto.getRandomValues(new Uint8Array(5)); 
        const gameIdBytes = fromHex(gameId.startsWith('0x') ? gameId.substring(2) : gameId); // Ensure gameId is bytes
        const idForSeal = toHex(new Uint8Array([...gameIdBytes, ...nonce])); // Use gameId + nonce for Seal ID
        
        const { encryptedObject: encryptedBytes } = await sealClient.encrypt({
            threshold: 2, // Example threshold
            packageId: gamePackageId, // Seal needs packageId? Check Seal docs/examples
            id: idForSeal, // Use generated ID
            data: fileBytes, 
        });
        toast.success('File encrypted.');

        // --- Walrus SDK Multi-Step Upload --- 
        // Step 1: Encode Blob
        setUploadStep('encoding');
        console.log('Encoding encrypted data for Walrus...');
        const encoded = await walrusClient.encodeBlob(encryptedBytes);
        currentBlobId = encoded.blobId;
        setBlobId(currentBlobId); // Store blobId for potential retry/info
        toast.success('File encoded for Walrus.');
        console.log('Encoded Blob ID:', currentBlobId);

        // Step 2: Register Blob Transaction
        setUploadStep('registering');
        console.log(`Building registration transaction for ${storageEpochs} epochs...`);
        const registerBlobTransaction = await walrusClient.registerBlobTransaction({
            blobId: encoded.blobId,
            rootHash: encoded.rootHash,
            size: encryptedBytes.length, 
            deletable: false, 
            epochs: storageEpochs,
            owner: senderAddress, // Use the stored address
        });
        registerBlobTransaction.setSender(senderAddress); // Use the stored address

        console.log('Signing and executing registration transaction...');
        toast.loading('Please approve Blob Registration in wallet...');
        const { digest: registerDigest } = await signAndExecuteTransaction({ transaction: registerBlobTransaction });
        toast.dismiss();
        toast.loading(`Waiting for registration transaction (${registerDigest.substring(0,6)}...) to finalize...`);
        console.log('Registration Tx Digest:', registerDigest);
        const { objectChanges: registerObjectChanges, effects: registerEffects } = await suiClient.waitForTransaction({ 
            digest: registerDigest, 
            options: { showObjectChanges: true, showEffects: true }
        });
        toast.dismiss();

        if (registerEffects?.status.status !== 'success') {
            throw new Error(`Failed to register blob on-chain: ${registerEffects?.status.error || 'Unknown reason'}`);
        }
        toast.success('Blob registered on chain.');

        const blobType = await walrusClient.getBlobType();
        const blobObject = registerObjectChanges?.find(
            (change) => change.type === 'created' && change.objectType === blobType,
        );
        if (!blobObject || blobObject.type !== 'created') {
            throw new Error('Registered Blob object not found in transaction effects.');
        }
        const blobObjectId = blobObject.objectId;
        console.log('Registered Blob Object ID:', blobObjectId);

        // Step 3: Write Encoded Blob to Nodes
        setUploadStep('writing');
        toast.loading('Uploading file shards to Walrus nodes...');
        console.log('Writing encoded blob to Walrus nodes...');
        const confirmations = await walrusClient.writeEncodedBlobToNodes({
            blobId: encoded.blobId,
            metadata: encoded.metadata,
            sliversByNode: encoded.sliversByNode,
            deletable: false, // Match registration
            objectId: blobObjectId,
        });
        toast.dismiss();
        toast.success('File shards uploaded.');
        console.log('Write confirmations received:', confirmations.length);
        
        // Step 4: Certify Blob Transaction
        setUploadStep('certifying');
        console.log('Building certification transaction...');
        const certifyBlobTransaction = await walrusClient.certifyBlobTransaction({
            blobId: encoded.blobId,
            blobObjectId: blobObjectId,
            confirmations,
            deletable: false, // Match registration
        });
        certifyBlobTransaction.setSender(senderAddress); // Use the stored address

        console.log('Signing and executing certification transaction...');
        toast.loading('Please approve Blob Certification in wallet...');
        const { digest: certifyDigest } = await signAndExecuteTransaction({ transaction: certifyBlobTransaction });
        toast.dismiss();
        toast.loading(`Waiting for certification transaction (${certifyDigest.substring(0,6)}...) to finalize...`);
        console.log('Certification Tx Digest:', certifyDigest);
        const { effects: certifyEffects } = await suiClient.waitForTransaction({ 
            digest: certifyDigest, 
            options: { showEffects: true } 
        });
        toast.dismiss();

        if (certifyEffects?.status.status !== 'success') {
            throw new Error(`Failed to certify blob on-chain: ${certifyEffects?.status.error || 'Unknown reason'}`);
        }
        toast.success('Blob certified on chain.');
        console.log('Blob certified successfully.');

        // Step 5: Associate Blob with Game Object
        setUploadStep('associating');
        console.log('Building association transaction...');
        const associateTx = new Transaction();
        const { bcs } = await import('@mysten/sui/bcs'); 

        associateTx.moveCall({
            target: `${gamePackageId}::game::update_package_url`,
            arguments: [
                associateTx.object(gameId),
                associateTx.pure(bcs.String.serialize(encoded.blobId)),
                associateTx.object(adminCapId),
            ],
        });
        associateTx.setSender(senderAddress); // Use the stored address

        console.log('Signing and executing association transaction...');
        toast.loading('Please approve Game Update in wallet...');
        const { digest: associateDigest } = await signAndExecuteTransaction({ transaction: associateTx });
        toast.dismiss();
        toast.loading(`Waiting for association transaction (${associateDigest.substring(0,6)}...) to finalize...`);
        console.log('Association Tx Digest:', associateDigest);
        const { effects: associateEffects } = await suiClient.waitForTransaction({ 
            digest: associateDigest, 
            options: { showEffects: true } 
        });
        toast.dismiss();

        if (associateEffects?.status.status !== 'success') {
            throw new Error(`Failed to associate blob with game: ${associateEffects?.status.error || 'Unknown reason'}`);
        }

        setUploadStep('success');
        toast.success('Game file uploaded and associated successfully!');
        console.log('Upload and association complete.');

    } catch (error: any) {
        console.error('Upload process failed:', error);
        setErrorMsg(`Error during ${uploadStep}: ${error.message}`);
        setUploadStep('error');
        toast.error(`Upload failed: ${error.message}`);
    }

  }, [file, currentAccount, gamePackageId, gameId, adminCapId, sealClient, walrusClient, suiClient, signAndExecuteTransaction, uploadStep, storageEpochs]);

  const isLoading = ![ 'idle', 'success', 'error'].includes(uploadStep);

  return (
    <Card className="max-w-lg mt-5 bg-card border border-border rounded-lg shadow-sm dark:shadow-none p-5">
      <Heading size="4" mb="3" className="text-foreground">Upload New Game File (Admin)</Heading>
      <Flex direction="column" gap="4">
        <Box>
          <label htmlFor="gameFileInput" className="block mb-1 text-sm font-medium text-foreground">Select Game File:</label>
        <input 
            id="gameFileInput" 
            type="file" 
            onChange={handleFileChange} 
            disabled={isLoading} 
            className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-border file:bg-card file:text-sm file:font-semibold file:text-accent hover:file:bg-accent hover:file:bg-opacity-10 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </Box>

        <Box>
          <label htmlFor="storageEpochsInput" className="block mb-1 text-sm font-medium text-foreground">Storage Duration (Epochs, ~6 hours each):</label>
          <Flex align="center" gap="2">
            <input
              id="storageEpochsInput"
              type="number"
              value={storageEpochs}
              onChange={handleEpochChange}
              min="1"
              disabled={isLoading}
              className="w-24 px-3 py-2 border rounded-md bg-card border-border placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Text size="1" className="text-muted-foreground">
              (e.g., 365 for ~1 year, 1825 for ~5 years)
            </Text>
          </Flex>
        </Box>

        <button 
          type="button"
          onClick={uploadFile} 
          disabled={!file || isLoading || storageEpochs < 1}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-accent text-accent-foreground hover:bg-accent hover:bg-opacity-90 h-10 px-4 py-2"
        >
          {isLoading ? <Spinner /> : 'Upload and Associate File'}
        </button>

        {uploadStep !== 'idle' && (
          <Flex direction="column" gap="1" mt="2">
            <Text size="2" weight="bold" className="text-foreground">Status: {uploadStep}</Text>
            <Text size="2" className="text-muted-foreground">{stepMessages[uploadStep]}</Text>
            {blobId && <Text size="1" className="text-muted-foreground">Blob ID: {blobId.substring(0,10)}...</Text>}
          </Flex>
        )}
        {errorMsg && (
            <Text className="text-destructive text-sm mt-2">Error: {errorMsg}</Text>
        )}
        {uploadStep === 'success' && (
            <button 
              type="button" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-success-border bg-success-background text-success-foreground hover:bg-success-background/80 h-9 px-3 mt-2"
              onClick={resetState}
            >
              Upload Another File
            </button>
        )}
         {uploadStep === 'error' && (
            <button 
              type="button" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-warning-border bg-warning-background text-warning-foreground hover:bg-warning-background/80 h-9 px-3 mt-2"
              onClick={resetState}
            >
              Try Again
            </button>
         )}
      </Flex>
    </Card>
  );
}

export default UploadGameFile; 