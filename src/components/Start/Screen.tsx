"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { DailyChallenge, fetchDailyChallenge } from '@/lib/gameData';
import { useNickname } from '@/hooks/useNickname';

const StartScreen: React.FC = () => {
    const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
    const nickname = useNickname();

    useEffect(() => {
        const loadDailyChallenge = async () => {
            const challenge = await fetchDailyChallenge();
            setDailyChallenge(challenge);
        };
        loadDailyChallenge();
    }, []);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
            <p className="text-md mb-4 text-center text-white">안녕하세요, {nickname}님!</p>
            <Card className="w-full max-w-lg bg-white text-gray-800 shadow-lg rounded-lg overflow-hidden">
                <CardHeader className="p-6">
                    <CardTitle className="text-3xl font-bold text-center">위키 레이스</CardTitle>
                </CardHeader>
                <CardContent className="p-6">

                    <h2 className="text-xl font-semibold mb-4">오늘의 챌린지</h2>
                    <p className="mb-2"><strong>시작:</strong> {dailyChallenge ? dailyChallenge.startPage : '-'}</p>
                    <p className="mb-2 ml-2">↓</p>
                    <p className="mb-4"><strong>목표:</strong> {dailyChallenge ? dailyChallenge.endPage : '-'}</p>

                    <div className="space-y-4 mt-6">
                        <Link href="/game" className="block">
                            <Button className="w-full text-lg p-6">게임 시작</Button>
                        </Link>
                        <Link href="/ranking" className="block">
                            <Button variant="outline" className="w-full border border-black p-6">랭킹 보기</Button>
                        </Link>
                    </div>
                    <p className="text-center text-sm mt-2">{`오늘 완료한 사람 수: ${dailyChallenge ? dailyChallenge.totalCount : '-'}`}</p>
                </CardContent>
            </Card>
            <p className="text-xs mt-8 text-center text-white">© 2024 Naco. All rights reserved.</p>
        </div>
    );
};

export default StartScreen;
