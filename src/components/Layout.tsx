"use client"

import React from 'react';
import { useEnvironment } from '@/contexts/EnvironmentContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isDev } = useEnvironment();

  return (
    <div className={`full-height bg-background text-foreground overflow-hidden ${isDev ? 'dev-mode' : ''}`}>
      {isDev && (
        <div className="justify-center z-50 absolute top-0 left-0 w-full">
          <div className="flex flex-row justify-start items-center bg-transparent text-center my-auto px-2">
            <span className="tracking-wider" style={rainbowStyle}>
              ENV: DEV
            </span>
          </div>
        </div>
      )}
      <div className="w-full h-full mx-auto bg-white shadow-md overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Layout;

const rainbowStyle = {
  background: 'linear-gradient(to right, red, red, red, white, red, red, red)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundSize: '200% auto',
  animation: 'rainbow 6s linear infinite, sparkle 2s ease-in-out infinite',
} as React.CSSProperties;