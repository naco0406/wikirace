"use client";

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchDailyChallenge, DailyChallenge } from '@/lib/gameData';

export const Loading: React.FC = () => {
    const [challenge, setChallenge] = useState<DailyChallenge | null>(null);

    useEffect(() => {
        const loadChallenge = async () => {
            const dailyChallenge = await fetchDailyChallenge();
            setChallenge(dailyChallenge);
        };
        loadChallenge();
    }, []);

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <h1 className="text-4xl font-bold mb-4">위키 레이스</h1>
            <div className="text-xl mb-8">오늘의 게임을 준비 중입니다</div>
            <Loader2 className="w-16 h-16 animate-spin mb-8" />
            <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">오늘의 챌린지</h2>
                {challenge ? (
                    <>
                        <p className="mb-2"><span className="font-bold">시작:</span> {challenge.startPage}</p>
                        <p><span className="font-bold">목표:</span> {challenge.endPage}</p>
                    </>
                ) : (
                    <p>챌린지 로딩 중</p>
                )}
            </div>
        </div>
    );
};

interface GameLoadingProps {
    fromPage: string;
    toPage: string;
    elapsedTime: string;
    moveCount: number;
    path: string[];
}

export const GameLoading: React.FC<GameLoadingProps> = ({ fromPage, toPage, elapsedTime, moveCount, path }) => {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <h1 className="text-4xl font-bold mb-4">위키 레이스</h1>
            <div className="text-xl mb-8">페이지 이동 중</div>
            <Loader2 className="w-16 h-16 animate-spin mb-8" />
            <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-4">현재 상태</h2>
                <p className="mb-2">
                    <span className="font-bold">이동:</span> {fromPage ? `${fromPage} → ${toPage}` : toPage}
                </p>
                <p className="mb-2"><span className="font-bold">현재 시간:</span> {elapsedTime}</p>
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