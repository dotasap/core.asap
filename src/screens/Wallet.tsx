import { useEffect, useState } from 'react';
import { useWallet } from '../WalletContext';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { FiCreditCard, FiBox } from 'react-icons/fi';

const client = new SuiClient({ url: getFullnodeUrl('testnet') });

const Wallet = () => {
  const { address } = useWallet();
  const [assets, setAssets] = useState<{ coinType: string; amount: string }[]>([]);

  useEffect(() => {
    if (!address) return;

    client.getAllBalances({ owner: address }).then((res) => {
      const formatted = res.map(({ coinType, totalBalance }) => ({
        coinType,
        amount: `${(Number(totalBalance) / 1e9).toFixed(6)} ${getSymbol(coinType)}`
      }));
      setAssets(formatted);
    });
  }, [address]);

  const getSymbol = (coinType: string) => {
    if (coinType.includes('::sui::SUI')) return 'SUI';
    if (coinType.includes('::usdc')) return 'USDC';
    if (coinType.includes('::usdt')) return 'USDT';
    return coinType.split('::')[2] || 'UNKNOWN';
  };

  return (
    <div className="container">
      <h2 className="sub-container">
        <FiCreditCard style={{ marginRight: '8px' }} />
        Your Wallet
      </h2>
      <p><strong>Address:</strong> {address}</p>
      <div className="wallet-content sub-container">
        <h3>
          <FiBox style={{ marginRight: '8px' }} />
          Assets:
        </h3>
        {assets.length > 0 ? (
          <ul>
            {assets.map((a, i) => (
              <li key={i}>{a.amount}</li>
            ))}
          </ul>
        ) : (
          <p>Loading assets...</p>
        )}
      </div>
    </div>
  );
};

export default Wallet;
