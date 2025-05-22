import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { getEnv } from './config';

interface ClientConfig {
  url: string;
  maxRetries?: number;
  retryDelay?: number;
}

const DEFAULT_CONFIG: ClientConfig = {
  url: getFullnodeUrl('testnet'),
  maxRetries: 3,
  retryDelay: 1000, // 1second
};

let suiClient: SuiClient | null = null;

export async function getClient(config: Partial<ClientConfig> = {}): Promise<SuiClient> {
  if (suiClient) {
    return suiClient;
  }

  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { url, maxRetries, retryDelay } = finalConfig;

  let retries = 0;
  while (retries < maxRetries!) {
    try {
      suiClient = new SuiClient({ url });
      return suiClient;
    } catch (error) {
      retries++;
      if (retries === maxRetries) {
        throw new Error(`Failed to connect to Sui network after ${maxRetries} attempts: ${error}`);
      }
      console.warn(`Connection attempt ${retries} failed, retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw new Error('Failed to establish Sui client connection');
}

export async function getTestnetClient(): Promise<SuiClient> {
  return getClient({ url: getFullnodeUrl('testnet') });
}

export async function getMainnetClient(): Promise<SuiClient> {
  return getClient({ url: getFullnodeUrl('mainnet') });
}

export async function getDevnetClient(): Promise<SuiClient> {
  return getClient({ url: getFullnodeUrl('devnet') });
}


export async function getClientForEnvironment(): Promise<SuiClient> {
  const network = getEnv('SUI_NETWORK') || 'testnet';
  
  switch (network.toLowerCase()) {
    case 'mainnet':
      return getMainnetClient();
    case 'testnet':
      return getTestnetClient();
    case 'devnet':
      return getDevnetClient();
    default:
      console.warn(`Unknown network ${network}, defaulting to testnet`);
      return getTestnetClient();
  }
}

