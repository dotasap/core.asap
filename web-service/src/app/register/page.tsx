'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FaUser, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import Image from 'next/image';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password);
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="container">
      <div className="profile-card">
        <div className="profile-card-header">
          <Image src="/logo.png" alt="Logo" width={120} height={120} className="profile-card-icon" />
          <h2>Register</h2>
        </div>
        {error && <div className="error-message"><FaExclamationCircle /> {error}</div>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className='login-input'
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className='login-input'
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className='login-input'
            />
          </div>
          <button 
            className="profile-submit-button" 
            type="submit"
            disabled={isLoading}
          >
            <FaCheckCircle /> {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="subtitle" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <FaUser style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Already have an account?{' '}
          <a href="/login" style={{ color: 'inherit', textDecoration: 'underline' }}>
            Login here
          </a>
        </p>
      </div>
    </div>
  );
} 