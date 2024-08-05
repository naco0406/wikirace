"use client";

import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Link from 'next/link';
import { DailyChallenge, fetchDailyChallenge } from '@/lib/gameData';
import { useNickname } from '@/hooks/useNickname';
import { useLocalRecord } from '@/hooks/useLocalRecord';
import { getKSTDateString } from '@/lib/firebaseConfig';
import { Trophy, Move, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useKeyboard } from '@/hooks/useKeyboard';
import Logo from '@/assets/Logo';

const StartScreen: React.FC = () => {
    const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
    const nickname = useNickname();
    const { localRecord, hasClearedToday, hasGiveUpToday, hasStartedToday } = useLocalRecord();
    const today = getKSTDateString();
    const [open, setOpen] = useState(false);
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
                    <Button className="w-full text-lg bg-linkle p-6 text-white">
                        {hasStartedToday ? '이어서 도전하기' : '시작'}
                    </Button>
                </Link>
            ) : (
                <Button className="w-full text-lg p-6 bg-linkle text-white cursor-not-allowed" disabled>
                    {hasClearedToday ? '오늘의 도전을 완료했습니다!' : '오늘의 도전을 포기했습니다.'}
                </Button>
            )}
            <p className="text-xs mt-[300px] text-center text-linkle-foreground">© 2024 Naco & Minseo Lim. All rights reserved.</p>
        </div>
    );
};

export default StartScreen;

const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const qaPairs = [
    {
        question: "링클이 무엇인가요?",
        answer: "링클은 매일 새로운 위키피디아 스피드런을 즐기는 게임입니다."
    },
    {
        question: "링클은 어떻게 플레이하나요?",
        answer: "매일 새로운 시작 페이지와 목표 페이지가 주어집니다. 시작 페이지에서 위키피디아 링크만을 통해 목표 페이지에 도달해야 합니다."
    },
    {
        question: "다른 플레이어들과 경쟁할 수 있나요?",
        answer: "네, 일일 랭킹을 통해 다른 플레이어들의 성적을 확인하고 경쟁할 수 있습니다."
    },
    {
        question: "랭킹은 어떻게 계산되나요?",
        answer: "하루동안 가장 먼저 클리어 한 사람, 가장 빠르게 클리어 한 사람, 가장 적은 이동 횟수로 클리어 한 사람이 각각 제공됩니다."
    },
    {
        question: "매일 새로운 챌린지가 제공되나요?",
        answer: "네, 매일 자정에 새로운 시작 페이지와 목표 페이지가 제공됩니다."
    },
];