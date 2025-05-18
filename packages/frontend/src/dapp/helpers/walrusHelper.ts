import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient } from '@mysten/walrus';
import walrusWasmUrl from '@mysten/walrus-wasm/web/walrus_wasm_bg.wasm?url'; // Import WASM URL for Vite
import { Transaction } from '@mysten/sui/transactions';
import { SuiSignAndExecuteTransactionOutput } from '@mysten/wallet-standard';
// --- Seal Imports ---
import { SealClient, getAllowlistedKeyServers } from '@mysten/seal';
import { fromHex, toHex } from '@mysten/sui/utils';

// --- Client Initialization ---
// TODO: Consider making these singletons or context-based if used frequently
// NOTE: SealClient and WalrusClient initialization might be better placed
//       where SuiClient is reliably available (e.g., within the component/hook using this helper)
//       or passed into the function if they need specific configurations per call.
//       For simplicity here, assuming a testnet SuiClient can be created.
const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

// Seal Client (Testnet)
// Ensure verifyKeyServers is false for testnet/devnet unless strictly needed and configured
const sealClient = new SealClient({
  suiClient,
  serverObjectIds: getAllowlistedKeyServers('testnet'),
  verifyKeyServers: false,
});

// Walrus Client (Testnet)
const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient,
  wasmUrl: walrusWasmUrl, // Pass the imported WASM URL
  storageNodeClientOptions: {
    timeout: 60_000, // Example timeout from SDK examples
    // Add onError callback to log individual node request errors
    // According to lint error and docs example, it seems onError only takes one argument
    onError: (error: Error) => {
        console.error(`Walrus SDK: Error during node communication:`, error);
    },
  },
});

// --- Type Definitions ---

// Base Walrus Options
interface UploadOptionsBase {
    epochs?: number;
    deletable?: boolean;
    signAndExecuteTransaction: (
        input: { transaction: Transaction },
        options?: {
            onSuccess?: (result: SuiSignAndExecuteTransactionOutput) => void;
            onError?: (error: Error) => void;
        }
    ) => void; // Function signature from useSignAndExecuteTransaction
    waitForTransaction: (input: { digest: string; options?: any }) => Promise<any>; // Adjust types as needed
    ownerAddress: string;
    onProgress?: (step: string, message?: string) => void; // Optional progress callback
    onError?: (step: string, error: Error) => void; // Optional error callback
}

// Options specific to Seal encryption
interface SealEncryptOptions {
    policyObject: string; // Object ID defining the Seal policy
    sealPackageId: string; // Package ID where the Seal policy module resides
    sealThreshold?: number; // Default is 2
}

// Combined options for the new function
interface EncryptAndUploadOptions extends UploadOptionsBase, SealEncryptOptions {}

// --- Core Encrypt and Upload Function ---

/**
 * Handles Seal encryption followed by the multi-step Walrus upload process
 * using WalrusClient and dapp-kit hooks.
 * Encrypts the file, then encodes, registers, uploads to nodes, and certifies the encrypted blob.
 *
 * @param file The file to encrypt and upload.
 * @param options Contains necessary functions and parameters from the calling hook/component,
 *                including Seal policy details.
 * @returns Promise resolving with the Walrus blobId upon successful upload and certification.
 */
export async function encryptAndUploadToWalrus(file: File, options: EncryptAndUploadOptions): Promise<string> {
    const {
        // Seal options
        policyObject,
        sealPackageId,
        sealThreshold = 2,
        // Walrus/Upload options
        epochs = 3,
        deletable = false,
        signAndExecuteTransaction,
        waitForTransaction,
        ownerAddress,
        onProgress,
        onError
    } = options;

    onProgress?.('reading_file', `Reading file: ${file.name}`);
    const originalFileData = new Uint8Array(await file.arrayBuffer());
    onProgress?.('reading_file_success', `File size: ${originalFileData.length} bytes`);

    // 1. Seal Encryption
    let encryptedData: Uint8Array;
    onProgress?.('seal_encrypting', 'Encrypting file with Seal...');
    try {
        const nonce = crypto.getRandomValues(new Uint8Array(5));
        const policyObjectBytes = fromHex(policyObject);
        // Create a unique ID for this encryption based on policy and nonce
        const id = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));

        const { encryptedObject } = await sealClient.encrypt({
            threshold: sealThreshold,
            packageId: sealPackageId,
            id, // Unique ID for this specific encryption instance
            data: originalFileData,
        });
        encryptedData = encryptedObject; // This is the data to upload to Walrus
        onProgress?.('seal_encrypting_success', `Seal encryption complete. Encrypted size: ${encryptedData.length}`);
    } catch (error) {
        onError?.('seal_encrypting', error as Error);
        throw new Error(`Seal encryption failed: ${error}`);
    }

    // 2. Encode *Encrypted* Blob for Walrus (Local)
    let encodedEncrypted;
    onProgress?.('walrus_encoding', `Encoding encrypted data for Walrus...`);
    try {
        encodedEncrypted = await walrusClient.encodeBlob(encryptedData);
        onProgress?.('walrus_encoding_success', `Walrus Blob ID: ${encodedEncrypted.blobId}`);
    } catch (error) {
        onError?.('walrus_encoding', error as Error);
        throw new Error(`Walrus encoding failed: ${error}`);
    }

    // 3. Prepare Walrus Register Transaction
    let registerTx: Transaction;
    try {
        registerTx = await walrusClient.registerBlobTransaction({
            blobId: encodedEncrypted.blobId,
            rootHash: encodedEncrypted.rootHash,
            size: encryptedData.length, // Use the size of the *encrypted* data
            deletable,
            epochs,
            owner: ownerAddress, // Use the connected wallet address
        });
        registerTx.setSender(ownerAddress); // Explicitly set the sender
    } catch (error) {
         onError?.('prepare_register', error as Error);
        throw new Error(`Failed to prepare Walrus registration transaction: ${error}`);
    }

    // 4. Execute Walrus Register Transaction (User Signs)
    let registerResult: SuiSignAndExecuteTransactionOutput;
    onProgress?.('walrus_registering', 'Please approve the Walrus registration transaction in your wallet.');
    try {
        registerResult = await new Promise<SuiSignAndExecuteTransactionOutput>((resolve, reject) => {
            signAndExecuteTransaction(
                { transaction: registerTx },
                {
                    onSuccess: (result) => resolve(result),
                    onError: (error) => reject(error),
                }
            );
        });
        onProgress?.('walrus_registering_success', `Walrus Registration Tx Digest: ${registerResult.digest}`);
    } catch (error) {
        onError?.('walrus_registering', error as Error);
        throw new Error(`Walrus registration transaction failed: ${error}`);
    }

    // 5. Wait for Walrus Register Tx and Get Object ID
    let blobObjectId: string;
    onProgress?.('waiting_register_tx', 'Waiting for Walrus registration transaction finality...');
    try {
        const { objectChanges, effects } = await waitForTransaction({
            digest: registerResult.digest,
            options: { showObjectChanges: true, showEffects: true }
        });

        if (effects?.status.status !== 'success') {
            throw new Error(`Walrus registration transaction effects status: ${effects?.status.error}`);
        }

        const blobType = await walrusClient.getBlobType();
        const blobObject = objectChanges?.find(
            (change: any) => change.type === 'created' && change.objectType === blobType
        );

        if (!blobObject || blobObject.type !== 'created') {
            // Defensive check: Sometimes the object might be mutated instead of created if retrying?
             const mutatedBlobObject = objectChanges?.find(
                (change: any) => change.type === 'mutated' && change.objectType === blobType
             );
             if (!mutatedBlobObject || mutatedBlobObject.type !== 'mutated') {
                console.error("ObjectChanges:", objectChanges); // Log for debugging
                throw new Error('Walrus Blob object not found (created or mutated) in transaction effects.');
             }
             blobObjectId = mutatedBlobObject.objectId;
        } else {
           blobObjectId = blobObject.objectId;
        }
         onProgress?.('waiting_register_tx_success', `Walrus Blob Object ID: ${blobObjectId}`);
    } catch (error) {
        onError?.('waiting_register_tx', error as Error);
        throw new Error(`Failed to get Walrus Blob Object ID from registration transaction: ${error}`);
    }

    // 6. Upload Encrypted Data to Walrus Nodes (Chain-off)
    let confirmations;
    const MAX_RETRIES = 3; // Maximum number of retry attempts
    const RETRY_DELAY_MS = 3000; // Delay between retries in milliseconds (e.g., 3 seconds)

    onProgress?.('uploading_nodes', 'Uploading encrypted data to Walrus storage nodes...');
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            // Pass the encoded *encrypted* data details
            confirmations = await walrusClient.writeEncodedBlobToNodes({
                blobId: encodedEncrypted.blobId,
                metadata: encodedEncrypted.metadata,
                sliversByNode: encodedEncrypted.sliversByNode,
                deletable,
                objectId: blobObjectId,
                // Consider adding a specific timeout parameter here if the SDK supports it in the future
            });
            onProgress?.('uploading_nodes_success', `Attempt ${attempt}: Successfully uploaded encrypted data and received ${confirmations.length} confirmations.`);
            break; // Success, exit the retry loop
        } catch (error) {
            const attemptError = error as Error;
            onError?.('uploading_nodes_attempt_failed', new Error(`Attempt ${attempt} failed: ${attemptError.message}`));

            if (attempt === MAX_RETRIES) {
                // If it's the last attempt, log the final error and throw
                onError?.('uploading_nodes', attemptError);
                onProgress?.('uploading_nodes_failed', `Upload failed after ${MAX_RETRIES} attempts.`);
                throw new Error(`Failed to upload encrypted blob to Walrus storage nodes after ${MAX_RETRIES} attempts: ${attemptError}`);
            }

            // Log retry attempt and wait
            onProgress?.('uploading_nodes_retry', `Attempt ${attempt} failed. Retrying in ${RETRY_DELAY_MS / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        }
    }

     // Ensure confirmations are defined if the loop finished successfully but confirmations were somehow lost (defensive check)
    if (!confirmations) {
         const finalError = new Error('Failed to upload encrypted blob to Walrus storage nodes: Confirmations missing after supposed success.');
         onError?.('uploading_nodes', finalError);
         throw finalError;
    }

    // Log final success after retries (if any were needed) or immediate success
    onProgress?.('uploading_nodes_final_success', `Successfully uploaded encrypted data with ${confirmations.length} confirmations.`);


    // 7. Prepare Walrus Certify Transaction
    let certifyTx: Transaction;
    try {
        certifyTx = await walrusClient.certifyBlobTransaction({
            blobId: encodedEncrypted.blobId,
            blobObjectId: blobObjectId,
            confirmations,
            deletable,
        });
        certifyTx.setSender(ownerAddress); // Explicitly set the sender
    } catch (error) {
        onError?.('prepare_certify', error as Error);
        throw new Error(`Failed to prepare Walrus certification transaction: ${error}`);
    }

    // 8. Execute Walrus Certify Transaction (User Signs)
    let certifyResult: SuiSignAndExecuteTransactionOutput;
    onProgress?.('walrus_certifying', 'Please approve the Walrus certification transaction in your wallet.');
    try {
         certifyResult = await new Promise<SuiSignAndExecuteTransactionOutput>((resolve, reject) => {
            signAndExecuteTransaction(
                { transaction: certifyTx },
                {
                    onSuccess: (result) => resolve(result),
                    onError: (error) => reject(error),
                }
            );
        });
        onProgress?.('walrus_certifying_success', `Walrus Certification Tx Digest: ${certifyResult.digest}`);
    } catch (error) {
        onError?.('walrus_certifying', error as Error);
        throw new Error(`Walrus certification transaction failed: ${error}`);
    }

    // 9. Wait for Walrus Certify Tx
    onProgress?.('waiting_certify_tx', 'Waiting for Walrus certification transaction finality...');
    try {
        const { effects } = await waitForTransaction({
            digest: certifyResult.digest,
            options: { showEffects: true }
        });

        if (effects?.status.status !== 'success') {
            throw new Error(`Walrus certification transaction effects status: ${effects?.status.error}`);
        }
        onProgress?.('waiting_certify_tx_success', 'Encrypted blob successfully uploaded to Walrus and certified!');
    } catch (error) {
        onError?.('waiting_certify_tx', error as Error);
        throw new Error(`Failed to confirm Walrus certification transaction: ${error}`);
    }

    // Return the Walrus blobId which might be needed for subsequent contract calls
    // Note: This blobId corresponds to the *encrypted* data on Walrus.
    // The Seal `id` used for encryption might also be needed later for decryption.
    // Consider returning both if necessary, or storing the mapping elsewhere.
    onProgress?.('encrypt_upload_complete', `Process complete. Walrus Blob ID (encrypted): ${encodedEncrypted.blobId}`);
    return encodedEncrypted.blobId;
}

// --- (Optional) Keep the original function if needed, or remove it ---
// export async function uploadToWalrus(...) { ... } 