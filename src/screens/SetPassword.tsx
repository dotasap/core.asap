import { useState } from 'react';
import { useWallet } from '../WalletContext';
import { encryptMnemonic } from '../utils/encryption';
import { keypairFromPhrase } from '../utils/sui';
import { FiLock } from 'react-icons/fi';

const SetPassword = ({ phrase, onUnlock }: { phrase: string; onUnlock: () => void }) => {
  const [password, setPassword] = useState('');
  const { setWallet } = useWallet();

  const handleSave = async () => {
    try {
      const encrypted = await encryptMnemonic(phrase, password);
      localStorage.setItem('saved_wallet', encrypted);
      const keypair = keypairFromPhrase(phrase);
      setWallet(keypair);
      onUnlock();
    } catch (err) {
      alert('Encryption failed.');
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h2>
        <FiLock style={{ marginRight: '8px' }} />
        Set a Password
      </h2>
      <input
        type="password"
        placeholder="Enter a password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSave}>Save and Unlock</button>
    </div>
  );
};

export default SetPassword;
