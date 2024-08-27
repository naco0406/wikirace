"use client"

import { useState, useEffect, useCallback } from 'react';

export function useChallengeTimer(challengeId: string) {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    const startTimer = useCallback(() => {
        const storedData = localStorage.getItem(`linkleChallenge_${challengeId}`);
        let startTime: number;

        if (storedData) {
            const { time } = JSON.parse(storedData);
            startTime = time;
        } else {
            startTime = Date.now();
            localStorage.setItem(`linkleChallenge_${challengeId}`, JSON.stringify({ time: startTime }));
        }

        setIsTimerRunning(true);
    }, [challengeId]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | undefined;

        if (isTimerRunning) {
            const storedData = localStorage.getItem(`linkleChallenge_${challengeId}`);
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
    }, [isTimerRunning, challengeId]);

    const resetTimer = useCallback(() => {
        localStorage.removeItem(`linkleChallenge_${challengeId}`);
        setElapsedTime(0);
        setIsTimerRunning(false);
    }, [challengeId]);

    return { elapsedTime, formattedTime: formatTime(elapsedTime), startTimer, resetTimer };
}

export const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};