// Adapted from Seal examples

export type WalrusService = {
    id: string;
    name: string;
    publisherUrl: string;
    aggregatorUrl: string;
};
  
// TODO: Replace with actual service URLs if different from example defaults
export const services: WalrusService[] = [
    {
        id: 'service1',
        name: 'walrus.space', // 你无法访问
        publisherUrl: '/publisher1',
        aggregatorUrl: '/aggregator1',
      },
      {
        id: 'service2',
        name: 'staketab.org',
        publisherUrl: '/publisher2',
        aggregatorUrl: '/aggregator2',
      },
      {
        id: 'service3',
        name: 'redundex.com',
        publisherUrl: '/publisher3',
        aggregatorUrl: '/aggregator3',
      },
      {
        id: 'service4',
        name: 'nodes.guru',
        publisherUrl: '/publisher4',
        aggregatorUrl: '/aggregator4',
      },
      {
        id: 'service5',
        name: 'banansen.dev',
        publisherUrl: '/publisher5',
        aggregatorUrl: '/aggregator5',
      },
      {
        id: 'service6',
        name: 'everstake.one',
        publisherUrl: '/publisher6',
        aggregatorUrl: '/aggregator6',
      },
];
  
/**
 * Constructs the full aggregator URL for a given service and path.
 */
export function getAggregatorUrl(serviceId: string, path: string): string {
    const service = services.find((s) => s.id === serviceId);
    if (!service) throw new Error(`Walrus service not found: ${serviceId}`);
    // Basic path cleaning, adjust if needed
    const cleanPath = path.replace(/^\/+/, ''); 
    // Assuming URLs in config already include base path like /v1/
    return `${service.aggregatorUrl}/${cleanPath}`;
}

/**
 * Constructs the full publisher URL for a given service and path.
 */
export function getPublisherUrl(serviceId: string, path: string): string {
    const service = services.find((s) => s.id === serviceId);
    if (!service) throw new Error(`Walrus service not found: ${serviceId}`);
    const cleanPath = path.replace(/^\/+/, '');
    return `${service.publisherUrl}/${cleanPath}`;
}

/**
 * Uploads encrypted data to a Walrus publisher.
 * @param encryptedBytes The encrypted data.
 * @param serviceId The ID of the target Walrus service from the `services` array.
 * @param numEpochs Number of epochs to store the blob for.
 * @returns Promise containing the storage info from Walrus.
 */
export async function storeBlob(
    encryptedBytes: Uint8Array, 
    serviceId: string, 
    numEpochs: number = 1
): Promise<{ info: any }> {
    // Use default service if needed, or handle error
    const targetServiceId = serviceId || services[0]?.id || 'service1'; 
    const url = getPublisherUrl(targetServiceId, `/v1/blobs?epochs=${numEpochs}`);

    console.log(`Uploading ${encryptedBytes.length} bytes to ${url}`);

    const response = await fetch(url, {
      method: 'PUT',
      body: encryptedBytes,
      // Add content type if required by Walrus API
      // headers: {
      //   'Content-Type': 'application/octet-stream' 
      // }
    });

    if (!response.ok) {
        // Attempt to get more detailed error
        let errorBody = 'Unknown error';
        try {
            errorBody = await response.text();
        } catch (e) {}
        console.error("Walrus upload error response:", errorBody);
        throw new Error(`Failed to store blob on Walrus (${response.status}): ${response.statusText}. ${errorBody}`);
    }

    const info = await response.json();
    console.log("Walrus upload successful:", info);
    return { info };
}

// TODO: Implement downloadAndDecryptGame function later 