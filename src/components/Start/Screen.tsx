"use client";

import Logo from '@/assets/Logo';
import { Button } from '@/components/ui/button';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useLocalRecord } from '@/hooks/useLocalRecord';
import { DailyChallenge, fetchDailyChallenge } from '@/lib/gameData';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

const StartScreen: React.FC = () => {
    const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
    const { hasClearedToday, hasGiveUpToday, hasStartedToday } = useLocalRecord();
    const router = useRouter();

    const handleAdminAction = useCallback(() => {
        router.push('/admin');
    }, [router]);

    const keyMap = {
        'meta+a+z': handleAdminAction,
        'ctrl+a+z': handleAdminAction,
    };

    const { isPressed } = useKeyboard(keyMap);

    useEffect(() => {
        if (isPressed('meta+a+d') || isPressed('ctrl+a+d')) {
            console.log('Admin shortcut detected');
            handleAdminAction();
        }
    }, [isPressed, handleAdminAction]);

    useEffect(() => {
        const loadDailyChallenge = async () => {
            const challenge = await fetchDailyChallenge();
            setDailyChallenge(challenge);
        };
        loadDailyChallenge();
    }, []);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white overflow-hidden">
            <p className="mt-[28px] mb-[100px]" />
            <Logo width={250} height={75} />
            <p className="font-[400] text-24 leading-28 mt-[28px] mb-[100px] text-linkle-foreground">{`오늘 완료한 사람 수 : ${dailyChallenge ? dailyChallenge.totalCount : '-'}`}</p>
            {!(hasClearedToday || hasGiveUpToday) ? (
                <Link href="/game" className="block">
                    <Button className="w-full text-lg bg-linkle px-20 py-6 text-white">
                        {hasStartedToday ? '이어서 도전하기' : '시작'}
                    </Button>
                </Link>
            ) : (
                <Button className="w-full text-lg px-20 py-6 bg-linkle text-white cursor-not-allowed" disabled>
                    {hasClearedToday ? '오늘의 도전을 완료했습니다!' : '오늘의 도전을 포기했습니다.'}
                </Button>
            )}
            <p className="text-xs mt-[300px] text-center text-linkle-foreground">© 2024 Naco & Minseo Lim. All rights reserved.</p>
        </div>
    );
};

export default StartScreen;