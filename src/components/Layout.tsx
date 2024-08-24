import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="full-height bg-background text-foreground overflow-hidden h-[100dvh]">
      <div className="w-full h-full mx-auto bg-white shadow-md overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Layout;