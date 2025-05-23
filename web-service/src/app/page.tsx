'use client';
import NavBar from '@/components/NavBar';
import Image from 'next/image';

export default function WelcomePage() {

  return (
    <div className="container">
      <NavBar />
      <h1>
        <Image style={{ marginBottom: '-1rem' }} src="/logo.png" alt="Logo" width={70} height={70} />
        .ASAP
      </h1>
      <p className="subtitle">Revolutionising transactions as we know them</p>

      <div className="sub-container">
        <h2>Swap your tokens in seconds</h2>
        <ul className="instructions-list">
          <li><span className="step-icon">1</span> Open up your wallet</li>
          <li><span className="step-icon">2</span> Choose your preferred token</li>
          <li><span className="step-icon">3</span> Send to <b>tx.asap</b></li>
          <li><span className="step-icon">4</span> Get your swapped token ASAP.</li>
        </ul>
      </div>
    </div>
  );
}
