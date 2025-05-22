'use client';
import { useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true);

  const toggleDark = () => {
    setDark(prev => !prev);
  };

  return (
    <>
      <div id="root" className={dark ? 'dark' : ''}>
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', cursor: 'pointer' }} onClick={toggleDark}>
          {dark ? <FiSun size={24} /> : <FiMoon size={24} />}
        </div>
        {children}
      </div>
    </>
  );
}
