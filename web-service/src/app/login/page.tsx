'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FaUser, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
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
          <h2>Login</h2>
        </div>
        {error && <div className="error-message"><FaExclamationCircle /> {error}</div>}
        <form onSubmit={handleLogin}>
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
          <button 
            className="profile-submit-button" 
            type="submit"
            disabled={isLoading}
          >
            <FaCheckCircle /> {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="subtitle" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <FaUser style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Don't have an account?{' '}
          <a href="/register" style={{ color: 'inherit', textDecoration: 'underline' }}>
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
