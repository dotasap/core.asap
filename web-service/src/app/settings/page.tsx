'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaWallet, FaUnlink, FaPlus, FaTrash, FaEdit, FaCheck, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { useCurrentAccount } from '@mysten/dapp-kit';
import WalletButton from '@/components/WalletButton';
import { useAuth } from '@/contexts/AuthContext';

interface BridgeAddress {
  chainId: string;
  address: string;
  isEditing?: boolean;
}

interface WalletSettings {
  slippage: string;
  bridgeAddresses: BridgeAddress[];
}

const CHAIN_OPTIONS = [
  { id: '1', name: 'Ethereum', disabled: true },
  { id: '56', name: 'BSC', disabled: true },
  { id: 'sui', name: 'Sui' },
];

const DEFAULT_SETTINGS: WalletSettings = {
  slippage: '0.5',
  bridgeAddresses: []
};

function shortenAddress(address: string) {
  if (!address) return '';
  if (address.length <= 12) return address;
  return address.slice(0, 6) + '...' + address.slice(-4);
}

export default function SettingsPage() {
  const currentAccount = useCurrentAccount();
  const { user, checkAuth } = useAuth();
  const [settings, setSettings] = useState<WalletSettings>(DEFAULT_SETTINGS);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentAccount) {
      fetchWalletSettings(currentAccount.address);
    } else {
      setSettings(DEFAULT_SETTINGS);
    }
  }, [currentAccount]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchWalletSettings = async (address: string) => {
    try {
      const res = await fetch(`/api/wallets/${address}/settings`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch wallet settings');
      }

      // Convert bridgeAddresses map to array
      const bridgeAddressesArray = Object.entries(data.settings.bridgeAddresses || {}).map(([chainId, address]) => ({
        chainId,
        address: address as string,
        isEditing: false
      }));

      setSettings({
        slippage: data.settings.swapSlippage || '0.5',
        bridgeAddresses: bridgeAddressesArray
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch wallet settings');
      setSettings(DEFAULT_SETTINGS);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAccount) {
      setError('Please connect your wallet first');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/wallets/${currentAccount.address}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }
      setSuccess('Settings updated successfully');
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update settings');
      setSuccess(null);
    } finally {
      setIsSaving(false);
    }
  };

  const addBridgeAddress = () => {
    setSettings(prev => ({
      ...prev,
      bridgeAddresses: [...(prev?.bridgeAddresses || []), { chainId: '', address: '', isEditing: true }]
    }));
  };

  const removeBridgeAddress = (index: number) => {
    setSettings(prev => ({
      ...prev,
      bridgeAddresses: (prev?.bridgeAddresses || []).filter((_, i) => i !== index)
    }));
  };

  const updateBridgeAddress = (index: number, field: keyof BridgeAddress, value: string) => {
    setSettings(prev => ({
      ...prev,
      bridgeAddresses: (prev?.bridgeAddresses || []).map((bridge, i) => 
        i === index ? { ...bridge, [field]: value } : bridge
      )
    }));
  };

  const toggleEdit = (index: number) => {
    setSettings(prev => ({
      ...prev,
      bridgeAddresses: (prev?.bridgeAddresses || []).map((bridge, i) => 
        i === index ? { ...bridge, isEditing: !bridge.isEditing } : bridge
      )
    }));
  };

  const isChainSelected = (chainId: string) => {
    return (settings?.bridgeAddresses || []).some(bridge => bridge.chainId === chainId);
  };

  const getAvailableChains = () => {
    const selectedChains = new Set(settings.bridgeAddresses.map(bridge => bridge.chainId));
    return CHAIN_OPTIONS.filter(chain => !selectedChains.has(chain.id));
  };

  const isWalletLinked = user?.linkedWallets?.includes(currentAccount?.address || '');

  const handleLinkWallet = async () => {
    if (!currentAccount) return;
    setLinking(true);
    setError(null);
    try {
      const res = await fetch('/api/wallets/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: currentAccount.address })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to link wallet');
      await checkAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link wallet');
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="container">
      <div className="box-header-row">
        <Link href="/" className="button">
          <button><FaArrowLeft /></button>
        </Link>
        <h1 className="header-title">Wallet Settings</h1>
        <div className="header-spacer" />
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div>
        <div className="wallet-connect">
          <WalletButton />
          {currentAccount && (
            <p>{currentAccount.address}</p>
          )}
        </div>

        {currentAccount ? (
          isWalletLinked ? (
            <form onSubmit={handleSubmit} className="settings-form">
              <div className="form-group">
                <h3>Slippage Tolerance (%)</h3>
                <input
                  type="number"
                  id="slippage"
                  value={settings.slippage}
                  onChange={(e) => setSettings(prev => ({ ...prev, slippage: e.target.value }))}
                  min="0.1"
                  max="100"
                  step="0.1"
                  required
                  style={{borderRadius: '4px'}}
                />
              </div>

              <div className="bridge-addresses">
                <div className="notification-message">
                  Only <b>Solana → Sui</b> bridge route is active for now. Other chains are coming soon.
                </div>
                <h3>Bridge Addresses</h3>
                {(settings.bridgeAddresses || []).map((bridge, index) => (
                  <div key={index} className="bridge-address-group">
                    {bridge.isEditing ? (
                      <>
                        <div className="form-group">
                          <label>Chain</label>
                          <select
                            value={bridge.chainId}
                            onChange={(e) => updateBridgeAddress(index, 'chainId', e.target.value)}
                            required
                          >
                            <option value="">Select Chain</option>
                            {CHAIN_OPTIONS.map(chain => (
                              <option 
                                key={chain.id} 
                                value={chain.id}
                                disabled={chain.disabled || (isChainSelected(chain.id) && bridge.chainId !== chain.id)}
                              >
                                {chain.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Address</label>
                          <input
                            type="text"
                            value={bridge.address}
                            onChange={(e) => updateBridgeAddress(index, 'address', e.target.value)}
                            placeholder="0x..."
                            required
                          />
                        </div>
                        <div className="button-group">
                          <button 
                            type="button" 
                            onClick={() => toggleEdit(index)}
                            className="cancel-button"
                          >
                            <FaTimes />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => toggleEdit(index)}
                            className="save-button"
                          >
                            <FaCheck />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bridge-info">
                          <div className="chain-name">
                            {CHAIN_OPTIONS.find(c => c.id === bridge.chainId)?.name || 'Unknown Chain'}
                          </div>
                          <div className="bridge-address">
                            {shortenAddress(bridge.address)}
                          </div>
                        </div>
                        <div className="button-group">
                          <button 
                            type="button" 
                            onClick={() => toggleEdit(index)}
                            className="edit-button"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => removeBridgeAddress(index)}
                            className="remove-button"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {getAvailableChains().length > 0 && (
                  <button 
                    type="button" 
                    onClick={addBridgeAddress}
                    className="add-button"
                  >
                    <FaPlus /> Add Bridge Address
                  </button>
                )}
              </div>

              <button type="submit" className="settings-submit-button" disabled={isSaving}>
                <FaCheckCircle /> {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          ) : (
            <div className="info-message">
              <div>
                <p>This wallet is not linked to your account.</p>
                <button onClick={handleLinkWallet} className="add-button" disabled={linking}>
                  {linking ? 'Linking...' : 'Link Wallet'}
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="info-message">
            <FaWallet className="section-icon" /> Connect your wallet to view and edit settings
          </div>
        )}

        <div className="info-message">
          <FaUnlink className="section-icon" /> To edit settings for another wallet, please disconnect the current wallet first
        </div>
      </div>
    </div>
  );
}
  