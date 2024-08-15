"use client";

import Logo from '@/assets/Logo';
import { useTimer } from '@/contexts/TimerContext';
import { useLocalRecord } from '@/hooks/useLocalRecord';
import { usePermanentDailyTimer } from '@/hooks/usePermanentDailyTimer';
import { DailyChallenge, fetchDailyChallenge } from '@/lib/gameData';
import { Loader2, MoveDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export const Loading: React.FC = () => {
    const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
    const { formattedTime, startTimer } = usePermanentDailyTimer();
    const { setHasStartedToday } = useLocalRecord();

    useEffect(() => {
        startTimer();
        setHasStartedToday(true);
    }, [startTimer]);

    useEffect(() => {
        const loadChallenge = async () => {
            const dailyChallenge = await fetchDailyChallenge();
            setChallenge(dailyChallenge);
        };
        loadChallenge();
    }, []);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white overflow-hidden">
            <p className="mt-[28px] mb-[100px]" />
            <Logo width={250} height={75} />
            <Loader2 className="w-[48px] h-[48px] animate-spin mt-[50px] mb-[40px] text-[#3366CC]" />
            <p className="font-[400] text-24 leading-28 mb-[80px]">오늘의 게임을 로딩 중입니다</p>
            <div className="flex flex-col min-h-[280px] items-center">
                {challenge ? (
                    <>
                        <p className="mb-[30px]">출발 문서 : <span className="font-[600] text-[#3366CC]">{challenge.startPage}</span></p>
                        <MoveDown />
                        <p className="mt-[30px]">도착 문서 : <span className="font-[600] text-[#3366CC]">{challenge.endPage}</span></p>
                    </>
                ) : (
                    null
                )}
            </div>
        </div>
    );
};
