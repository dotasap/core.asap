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
      <p className="subtitle">All blockchain transactions in one click</p>

      <div className="sub-container">
        <h2>Revolutionising transactions as we know them</h2>
        <ul className="instructions-list">
          <li><span className="step-icon">1</span> Dedicated Memo Protocol</li>
          <li><span className="step-icon">2</span> Swap tokens in seconds</li>
          <li><span className="step-icon">3</span> Bridge tokens to/from any chain</li>
          <li><span className="step-icon">4</span> Direct off-ramp in one click</li>
        </ul>
      </div>
    </div>
  );
}
