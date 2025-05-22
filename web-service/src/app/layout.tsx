import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';
import ThemeWrapper from './ThemeWrapper';
import WalletProviderWrapper from './WalletProviderWrapper';

export const metadata: Metadata = {
  title: '.ASAP',
  description: 'Bridge/swap/offramp',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProviderWrapper>
          <AuthProvider>
            <ThemeWrapper>
              {children}
            </ThemeWrapper>
          </AuthProvider>
        </WalletProviderWrapper>
      </body>
    </html>
  );
}
