'use client';
import { WalletProvider } from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';

export default function WalletProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  );
} 