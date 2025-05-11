import { createContext, useContext, useState } from 'react';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

interface WalletContextType {
  keypair?: Ed25519Keypair;
  address?: string;
  setWallet: (kp: Ed25519Keypair) => void;
}

const WalletContext = createContext<WalletContextType>({
  setWallet: () => {},
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [keypair, setKeypair] = useState<Ed25519Keypair>();

  return (
    <WalletContext.Provider
      value={{
        keypair,
        address: keypair?.getPublicKey().toSuiAddress(),
        setWallet: setKeypair,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
