'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaUser, FaShieldAlt, FaCheckCircle, FaTimesCircle, FaKey, FaUniversity, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import BankDetailsSection from '@/components/BankDetailsSection';

type TabType = 'account' | 'password' | 'bank' | 'wallets';

export default function ProfilePage() {
  const { user, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: user?.bankDetails?.accountNumber || '',
    bankName: user?.bankDetails?.bankName || '',
    accountName: user?.bankDetails?.accountName || '',
    recipientCode: user?.bankDetails?.recipientCode || ''
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    console.log(user?.bankDetails);
    console.log(bankDetails);
    setBankDetails({
      accountNumber: user?.bankDetails?.accountNumber || '',
      bankName: user?.bankDetails?.bankName || '',
      accountName: user?.bankDetails?.accountName || '',
      recipientCode: user?.bankDetails?.recipientCode || ''
    });
  }, [user?.bankDetails]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleBankDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile/bank-details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bankDetails),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update bank details');
      }

      setSuccess('Bank details updated successfully');
      setError(null);
      await checkAuth(); // Refresh user data
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update bank details');
      setSuccess(null);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setSuccess('Password updated successfully');
      setError(null);
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update password');
      setSuccess(null);
    }
  };

  const handleVerify = async () => {
    try {
      const res = await fetch('/api/profile/verify', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify profile');
      }

      setSuccess('Profile verified successfully');
      setError(null);
      await checkAuth(); // Refresh user data
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to verify profile');
      setSuccess(null);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <div className="box-header-row">
        <Link href="/" className="button">
          <button><FaArrowLeft /></button>
        </Link>
        <h1 className="header-title">Profile</h1>
        <div className="header-spacer" />
      </div>
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          Account
        </button>
        <button 
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Password
        </button>
        <button 
          className={`tab-button ${activeTab === 'bank' ? 'active' : ''}`}
          onClick={() => setActiveTab('bank')}
        >
          Bank Details
        </button>
        <button 
          className={`tab-button ${activeTab === 'wallets' ? 'active' : ''}`}
          onClick={() => setActiveTab('wallets')}
        >
          Wallets
        </button>
      </div>

      {activeTab === 'account' && (
        <div className="sub-container">
          <h2>
            <FaUser className="section-icon" /> Account Information
          </h2>
          <div className='info-card'>
            <div className="info-group">
              <div className="info-label">
                <label>Email Address</label>
              </div>
              <div className="info-value">{user.email}</div>
            </div>
            <div className="info-group">
              <div className="info-label">
                <label>Verification Status</label>
              </div>
              <div className="info-value status-value">
                {user.isVerified ? (
                  <span className="verified">
                    <FaCheckCircle className="status-icon" /> Verified
                  </span>
                ) : (
                  <span className="not-verified">
                    <FaTimesCircle className="status-icon" /> Not Verified
                  </span>
                )}
              </div>
            </div>
            {!user.isVerified && (
              <button onClick={handleVerify} className="profile-submit-button">
                <FaShieldAlt className="button-icon" /> Verify Account
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="sub-container">
        <h2>
          <FaKey className="profile-card-icon" />
          <span>Password Change</span>
        </h2>
        {success && <div className="success-message"><FaCheckCircle /> {success}</div>}
        {error && <div className="error-message"><FaExclamationCircle /> {error}</div>}
        <form onSubmit={handlePasswordSubmit} className="profile-form">

            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={passwords.newPassword}
                onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />
            </div>
            <button type="submit" className="profile-submit-button"><FaCheckCircle /> Change Password</button>
          </form>
        </div>
      )}

      {activeTab === 'bank' && (
        <div className="sub-container">
          <h2>
            <FaUniversity className="profile-card-icon" />
            <span>Bank Details</span>
          </h2>
          {success && <div className="success-message"><FaCheckCircle /> {success}</div>}
          {error && <div className="error-message"><FaExclamationCircle /> {error}</div>}
          <BankDetailsSection user={user} refreshUser={checkAuth} />
        </div>
      )}

      {activeTab === 'wallets' && (
        <div className="sub-container">
          <h2>Linked Wallets</h2>
          {user.linkedWallets?.length > 0 ? (
            <div className="linked-wallets">
              {user.linkedWallets?.map((wallet, index) => (
                <div key={index} className="wallet-address">
                  {wallet}
                </div>
              ))}
            </div>
          ) : (
            <p>No wallets linked yet</p>
          )}
        </div>
      )}
    </div>
  );
}
  