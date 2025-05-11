import { useState } from 'react';
import { useWallet } from '../WalletContext';
import { decryptMnemonic } from '../utils/encryption';
import { keypairFromPhrase } from '../utils/sui';
import { FiKey } from 'react-icons/fi';

const Unlock = ({ onUnlock }: { onUnlock: () => void }) => {
  const [password, setPassword] = useState('');
  const { setWallet } = useWallet();

  const handleUnlock = async () => {
    const encrypted = localStorage.getItem('saved_wallet');
    if (!encrypted) {
      return alert('No wallet found. Please onboard again.');
    }

    try {
      const phrase = await decryptMnemonic(encrypted, password);
      const keypair = keypairFromPhrase(phrase);
      setWallet(keypair);
      onUnlock();
    } catch (err) {
      alert('Incorrect password!');
    }
  };

  return (
    <div className="container">
      <h2>
        <FiKey style={{ marginRight: '8px' }} />
        Unlock Wallet
      </h2>
      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleUnlock}>Unlock</button>
    </div>
  );
};

export default Unlock;
