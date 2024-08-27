"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface EnvironmentContextType {
    isDev: boolean;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export const useEnvironment = () => {
    const context = useContext(EnvironmentContext);
    if (context === undefined) {
        throw new Error('useEnvironment must be used within an EnvironmentProvider');
    }
    return context;
};

export const EnvironmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isDev, setIsDev] = useState(false);

    useEffect(() => {
        const hostname = window.location.hostname;
        const isDevEnvironment = () => window.location.hostname === 'linkle-dev.vercel.app' || hostname === 'localhost';
        setIsDev(isDevEnvironment());
    }, []);

    return (
        <EnvironmentContext.Provider value={{ isDev }}>
            {children}
        </EnvironmentContext.Provider>
    );
};