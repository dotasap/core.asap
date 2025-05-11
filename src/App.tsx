import { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { WalletProvider, useWallet } from './WalletContext';
import Welcome from './screens/Welcome';
import ShowPhrase from './screens/ShowPhrase';
import SetPassword from './screens/SetPassword';
import Unlock from './screens/Unlock';
import Wallet from './screens/Wallet';

type Screen = 'welcome' | 'show' | 'setPassword' | 'unlock' | 'wallet';

function AppInner() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [phrase, setPhrase] = useState('');
  const { keypair } = useWallet();
  const [dark, setDark] = useState(true);


  useEffect(() => {
    const encrypted = localStorage.getItem('saved_wallet');
    if (encrypted && !keypair) {
      setScreen('unlock');
    }
  }, [keypair]);

  return (
    <div className={dark ? 'dark' : ''} id="root">
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', cursor: 'pointer' }} onClick={() => setDark((d) => !d)}>
        {dark ? <FiSun size={24} /> : <FiMoon size={24} />}
      </div>

      {screen === 'welcome' && (
        <Welcome
          onGenerate={(p) => {
            setPhrase(p);
            setScreen('show');
          }}
          onImport={(p) => {
            setPhrase(p);
            setScreen('setPassword');
          }}
        />
      )}
      {screen === 'show' && <ShowPhrase phrase={phrase} onNext={() => setScreen('setPassword')} />}
      {screen === 'setPassword' && <SetPassword phrase={phrase} onUnlock={() => setScreen('wallet')} />}
      {screen === 'unlock' && <Unlock onUnlock={() => setScreen('wallet')} />}
      {screen === 'wallet' && <Wallet />}
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <AppInner />
    </WalletProvider>
  );
}
