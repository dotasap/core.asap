"use client";
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const authenticatedNavItems = [
  { name: 'Profile', href: '/profile' },
  { name: 'Settings', href: '/settings' },
];

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="center" style={{ justifyContent: 'flex-end' }}>
      {user ? (
        <>
          {authenticatedNavItems.map((item) => (
            <span key={item.href}>
              <Link href={item.href}>
                <button>{item.name}</button>
              </Link>
            </span>
          ))}
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <Link href="/login">
          <button>Login</button>
        </Link>
      )}
    </nav>
  );
} 