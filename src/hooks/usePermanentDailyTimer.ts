"use client"

import { useState, useEffect, useCallback } from 'react';
import { getKSTDateString } from '@/lib/firebaseConfig';

export function usePermanentDailyTimer() {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    const startTimer = useCallback(() => {
        const today = getKSTDateString();
        const storedData = localStorage.getItem('dailyTimer');
        let startTime: number;

        if (storedData) {
            const { date, time } = JSON.parse(storedData);
            if (date === today) {
                startTime = time;
            } else {
                startTime = Date.now();
                localStorage.setItem('dailyTimer', JSON.stringify({ date: today, time: startTime }));
            }
        } else {
            startTime = Date.now();
            localStorage.setItem('dailyTimer', JSON.stringify({ date: today, time: startTime }));
        }

        setIsTimerRunning(true);
    }, []);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | undefined;

        if (isTimerRunning) {
            const storedData = localStorage.getItem('dailyTimer');
            if (storedData) {
                const { time } = JSON.parse(storedData);
                intervalId = setInterval(() => {
                    setElapsedTime(Math.floor((Date.now() - time) / 1000));
                }, 1000);
            }
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isTimerRunning]);

    const resetTimer = useCallback(() => {
        localStorage.removeItem('dailyTimer');
        setElapsedTime(0);
        setIsTimerRunning(false);
    }, []);

    return { elapsedTime, formattedTime: formatTime(elapsedTime), startTimer, resetTimer };
}

export const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};