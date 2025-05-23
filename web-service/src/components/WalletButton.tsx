'use client';
import { 

  useSignPersonalMessage,
  useSuiClient,
  useWallets,
  useDisconnectWallet,
  useConnectWallet,
  useCurrentWallet,
  useAccounts,
  WalletProvider,
  SuiClientProvider,
  createNetworkConfig,
  ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';

export default function WalletButton() {
  const currentAccount = useCurrentAccount();


  const { currentWallet, connectionStatus, isConnected } = useCurrentWallet();

  const { mutateAsync: connect } = useConnectWallet();
  const { mutateAsync: disconnect } = useDisconnectWallet();

  return (
    <div>
      {currentAccount ? (
        <button onClick={() => disconnect()}>
          Disconnect {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
        </button>
      ) : (
        <ConnectButton />
      )}
    </div>
  );
} 