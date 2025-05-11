import { FiShield } from 'react-icons/fi';

const ShowPhrase = ({ phrase, onNext }: { phrase: string; onNext: () => void }) => (
  <div className="container">
    <h1>Welcome</h1>
    <h2>
      <FiShield style={{ marginRight: '8px' }} />
      Save Your Recovery Phrase
    </h2>
    <p className="subtitle">
      Write this down and store it somewhere safe. You will need it to restore your wallet.
    </p>
    <pre className="phrase">{phrase}</pre>
    <button onClick={onNext}>I've saved it</button>
  </div>
);

export default ShowPhrase;
