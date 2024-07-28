import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-[100vh] bg-background text-foreground">
      <div className="w-full mx-auto bg-white shadow-md overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default Layout;