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

interface GameLoadingProps {
    fromPage: string;
    toPage: string;
    moveCount: number;
    path: string[];
}

export const GameLoading: React.FC<GameLoadingProps> = ({ fromPage, toPage, moveCount, path }) => {
    const { formattedTime } = useTimer();
    return (
        <div className="w-full p-6 h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <h1 className="text-4xl font-bold mb-4">Linkle</h1>
            <div className="text-xl mb-8">페이지 이동 중</div>
            <Loader2 className="w-16 h-16 animate-spin mb-8" />
            <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg w-full">
                <h2 className="text-2xl font-semibold mb-4">현재 상태</h2>
                <p className="mb-2">
                    <span className="font-bold">이동:</span> {fromPage ? `${fromPage} → ${toPage}` : toPage}
                </p>
                <p className="mb-2"><span className="font-bold">현재 시간:</span> {formattedTime}</p>
                <p className="mb-2"><span className="font-bold">이동 횟수:</span> {moveCount}</p>
                <div className="mb-2">
                    <span className="font-bold">경로:</span>
                    <ul className="list-disc list-inside">
                        {path.map((page, index) => (
                            <li key={index} className="truncate">{page}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};