// Adapted from Seal examples

export type WalrusService = {
    id: string;
    name: string;
    publisherUrl: string; // Now stores the full base URL
    aggregatorUrl: string; // Now stores the full base URL
};
  
// Updated services with full Testnet URLs from config
export const services: WalrusService[] = [
    {
        id: 'service1',
        name: 'walrus.space',
        publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
        aggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space',
      },
      {
        id: 'service2',
        name: 'staketab.org',
        publisherUrl: 'https://wal-publisher-testnet.staketab.org',
        aggregatorUrl: 'https://wal-aggregator-testnet.staketab.org',
      },
      {
        id: 'service3',
        name: 'redundex.com',
        publisherUrl: 'https://walrus-testnet-publisher.redundex.com',
        aggregatorUrl: 'https://walrus-testnet-aggregator.redundex.com',
      },
      {
        id: 'service4',
        name: 'nodes.guru',
        publisherUrl: 'https://walrus-testnet-publisher.nodes.guru',
        aggregatorUrl: 'https://walrus-testnet-aggregator.nodes.guru',
      },
      {
        id: 'service5',
        name: 'banansen.dev',
        publisherUrl: 'https://publisher.walrus.banansen.dev',
        aggregatorUrl: 'https://aggregator.walrus.banansen.dev',
      },
      {
        id: 'service6',
        name: 'everstake.one',
        publisherUrl: 'https://walrus-testnet-publisher.everstake.one',
        aggregatorUrl: 'https://walrus-testnet-aggregator.everstake.one',
      },
];
  
/**
 * Returns the full base aggregator URL for a given service.
 * Path parameter is ignored as it should be appended by the caller.
 */
export function getAggregatorUrl(serviceId: string, _path?: string): string {
    const service = services.find((s) => s.id === serviceId);
    if (!service) throw new Error(`Walrus service not found: ${serviceId}`);
    return service.aggregatorUrl; // Return the full base URL
}

/**
 * Returns the full base publisher URL for a given service.
 * Path parameter is ignored as it should be appended by the caller.
 */
export function getPublisherUrl(serviceId: string, _path?: string): string {
    const service = services.find((s) => s.id === serviceId);
    if (!service) throw new Error(`Walrus service not found: ${serviceId}`);
    return service.publisherUrl; // Return the full base URL
}

/**
 * Uploads encrypted data to a Walrus publisher using fetch.
 */
export async function storeBlob(
    encryptedBytes: Uint8Array, 
    serviceId: string, 
    numEpochs: number = 1
): Promise<{ info: any }> {
    const targetServiceId = serviceId || services[0]?.id || 'service1'; 
    // Get the full base URL
    const baseUrl = getPublisherUrl(targetServiceId); 
    // Construct the final URL by appending the path
    const finalUrl = `${baseUrl}/v1/blobs?epochs=${numEpochs}`;

    console.log(`Uploading ${encryptedBytes.length} bytes to ${finalUrl}`);

    const response = await fetch(finalUrl, { // Use the final URL
      method: 'PUT',
      body: encryptedBytes,
    });

    if (!response.ok) {
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