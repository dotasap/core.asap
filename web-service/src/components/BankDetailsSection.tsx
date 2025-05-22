import { useState, useEffect } from 'react';
import { FaUniversity, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function BankDetailsSection({ user, refreshUser }: { user: any, refreshUser: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [banks, setBanks] = useState<any[]>([]);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/paystack/banks')
      .then(res => res.json())
      .then(data => {
        // Ensure unique banks
        const uniqueBanks = data.data.reduce((acc: any[], bank: any) => {
          if (!acc.find(b => b.code === bank.code)) {
            acc.push(bank);
          }
          return acc;
        }, []);
        setBanks(uniqueBanks);
      });
  }, []);

  useEffect(() => {
    if (editing && user?.bankDetails) {
      setBankCode(user.bankDetails.bankCode || '');
      setAccountNumber(user.bankDetails.accountNumber || '');
      setAccountName(user.bankDetails.accountName || '');
    }
  }, [editing, user?.bankDetails]);

  useEffect(() => {
    if (accountNumber.length === 10 && bankCode) {
      handleResolve();
    }
  }, [bankCode, accountNumber]);

  const handleResolve = async () => {
    if (!accountNumber || !bankCode || accountNumber.length !== 10) {
      setAccountName('');
      return;
    }
    setResolving(true);
    setError(null);
    try {
      const res = await fetch('/api/paystack/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, bankCode }),
      });
      const data = await res.json();
      if (data.status && data.data.account_name) {
        setAccountName(data.data.account_name);
      } else {
        setError('Account could not be resolved');
      }
    } catch {
      setError('Failed to resolve account');
    } finally {
      setResolving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankCode || !accountNumber || !accountName) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const selectedBank = banks.find(b => b.code === bankCode);
      const payload = {
        accountName,
        accountNumber,
        bankCode,
        bankName: selectedBank.name,
      };
      const res = await fetch('/api/paystack/recipient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.recipientCode) {
        setSuccess('Bank details saved successfully');
        setEditing(false);
        await refreshUser();
      } else {
        setError('Failed to save bank details');
      }
    } catch {
      setError('Failed to save bank details');
    } finally {
      setLoading(false);
    }
  };

  if (!user.isVerified) {
    return (
      <div className="info-card">
        <div className="info-message">
          <FaExclamationCircle /> This feature is only available for verified users due to regulation issues.
        </div>
      </div>
    );
  }

  if (!editing && user?.bankDetails?.recipientCode) {
    return (
      <div className="info-card">
        <div className="info-group">
          <div className="info-label"><label>Account Name</label></div>
          <div className="info-value">{user.bankDetails.accountName}</div>
        </div>
        <div className="info-group">
          <div className="info-label"><label>Account Number</label></div>
          <div className="info-value">{user.bankDetails.accountNumber}</div>
        </div>
        <div className="info-group">
          <div className="info-label"><label>Bank</label></div>
          <div className="info-value">{user.bankDetails.bankName}</div>
        </div>
        <button className="profile-submit-button" onClick={() => { setEditing(true); setError(null); setSuccess(null); }}>
          <FaCheckCircle /> Edit
        </button>
      </div>
    );
  }

  if (!editing) {
    return (
      <div className="info-card">
        <div className="info-group">
          <div className="info-value">No bank details saved.</div>
        </div>
        <button className="profile-submit-button" onClick={() => setEditing(true)}>
          <FaCheckCircle /> Add Bank Details
        </button>
      </div>
    );
  }

  return (
    <div className="info-card">
      <div className='info-group'>
        <h2 className='info-label'>{user?.bankDetails ? 'Edit Bank Details' : 'Add Bank Details'}</h2>
        <button className='cancel-button' onClick={() => setEditing(false)} disabled={loading || resolving}>Cancel</button>
      </div>
      {error && <div className="error-message"><FaExclamationCircle /> {error}</div>}
      {success && <div className="success-message"><FaCheckCircle /> {success}</div>}
      <form onSubmit={handleSave} className="profile-form">
        <div className="form-group">
          <label>Bank</label>
          <select 
            value={bankCode} 
            onChange={e => {
              setBankCode(e.target.value);
              setError(null);
            }} 
            required 
            className="select"
          >
            <option value="">Select Bank</option>
            {banks.map((bank: any, index: number) => (
              <option key={`${bank.code}-${index}`} value={bank.code}>{bank.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Account Number</label>
          <input
            type="text"
            value={accountNumber}
            onChange={e => {
              setAccountNumber(e.target.value);
              setError(null);
            }}
            onBlur={handleResolve}
            required
            maxLength={10}
            placeholder="Enter 10-digit account number"
          />
        </div>
        {accountNumber.length === 10 && bankCode && (
          <div className="form-group">
            <label>Account Name</label>
            <div className="info-value">
              {resolving ? (
                <span className="resolving-text">Resolving account name...</span>
              ) : accountName ? (
                <span className="resolved-text">{accountName}</span>
              ) : (
                <span className="error-text">Could not resolve account name</span>
              )}
            </div>
          </div>
        )}
        <button 
          type="submit" 
          className="profile-submit-button" 
          disabled={loading || resolving || !accountName || !bankCode || accountNumber.length !== 10}
        >
          {loading ? 'Saving...' : 'Save Bank Details'}
        </button>
      </form>
    </div>
  );
} 