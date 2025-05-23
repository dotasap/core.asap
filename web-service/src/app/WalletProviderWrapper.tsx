'use client';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletKitProvider } from '@mysten/wallet-kit';

const queryClient = new QueryClient();

export default function WalletProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={{
        mainnet: { url: getFullnodeUrl('mainnet') },
        testnet: { url: getFullnodeUrl('testnet') },
        devnet: { url: getFullnodeUrl('devnet') }
      }} defaultNetwork="testnet">
        <WalletKitProvider>
          <WalletProvider autoConnect>
            {children}
          </WalletProvider>
        </WalletKitProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
} 