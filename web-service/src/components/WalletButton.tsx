'use client';
import { ConnectButton, useWallet } from '@suiet/wallet-kit';

export default function WalletButton() {
  const wallet = useWallet();

  return (
    <div className="wallet-button-container">
      {wallet.connected && wallet.account ? (
        <button 
          onClick={() => wallet.disconnect()}
          className="wallet-disconnect-button"
        >
          Disconnect {wallet.account.address.slice(0, 6)}...{wallet.account.address.slice(-4)}
        </button>
      ) : (
        <ConnectButton 
          label="Connect Wallet"
          className="wallet-connect-button"
        />
      )}
    </div>
  );
} 