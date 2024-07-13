"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { usePermanentDailyTimer } from '@/hooks/usePermanentDailyTimer';

interface TimerContextType {
    elapsedTime: number;
    formattedTime: string;
    startTimer: () => void;
    resetTimer: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const timer = usePermanentDailyTimer();

    return (
        <TimerContext.Provider value={timer}>
            {children}
        </TimerContext.Provider>
    );
};

export const useTimer = () => {
    const context = useContext(TimerContext);
    if (context === undefined) {
        throw new Error('useTimer must be used within a TimerProvider');
    }
    return context;
};