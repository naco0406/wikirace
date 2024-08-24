import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="full-height-container bg-background text-foreground">
      <div className="w-full h-full mx-auto bg-white shadow-md overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default Layout;