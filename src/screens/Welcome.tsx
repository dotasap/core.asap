import { useState } from 'react';
import { generatePhrase } from '../utils/sui';
import { FiPlusCircle, FiDownload } from 'react-icons/fi';

const Welcome = ({ onGenerate, onImport }: { onGenerate: (p: string) => void; onImport: (p: string) => void }) => {
  const [importPhrase, setImportPhrase] = useState('');

  return (
    <div className="container">
      <h2>Welcome to Studio II-III WALLET</h2>

      <button onClick={() => onGenerate(generatePhrase())}>
        <FiPlusCircle style={{ marginRight: '8px' }} />
        Generate New Wallet
      </button>

      <div>
        <textarea
          className="phrase-textarea"
          placeholder="Enter your recovery phrase..."
          value={importPhrase}
          onChange={(e) => setImportPhrase(e.target.value)}
        />
        <button
          className={importPhrase.trim() ? 'active' : 'inactive'}
          disabled={!importPhrase.trim()}
          onClick={() => onImport(importPhrase.trim())}
        >
          <FiDownload style={{ marginRight: '8px' }} />
          Import Wallet
        </button>
      </div>
    </div>
  );
};

export default Welcome;
