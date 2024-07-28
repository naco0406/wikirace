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
        <div className="min-h-[100vh] w-full flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
            <p className="text-lg mb-4 text-center text-white">안녕하세요, {nickname}님!</p>
            <Card className="w-full max-w-lg bg-white text-gray-800 shadow-lg rounded-lg overflow-hidden">
                <CardHeader className="p-6">
                </CardHeader>
                <CardContent className="p-6">
                    <h2 className="text-xl mb-4"><strong>오늘의 챌린지</strong> {today}</h2>
                    <p className="text-sm mt-2">{`오늘 완료한 사람 수: ${dailyChallenge ? dailyChallenge.totalCount : '-'}`}</p>

                    <div className="space-y-4 mt-6">
                        {!(hasClearedToday || hasGiveUpToday) ? (
                            <Link href="/game" className="block">
                                <Button className="w-full text-lg p-6">
                                    {hasStartedToday ? '게임 이어서 도전하기' : '게임 시작'}
                                </Button>
                            </Link>
                        ) : (
                            <Button className="w-full text-lg p-6 bg-gray-400 cursor-not-allowed" disabled>
                                {hasClearedToday ? '오늘의 도전을 완료했습니다!' : '오늘의 도전을 포기했습니다.'}
                            </Button>
                        )}
                        {(hasClearedToday || hasGiveUpToday) && (
                            <Fragment>
                                {!hasGiveUpToday && (
                                    <div className="w-full border border-black p-6 text-black border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                                        <div className='flex flex-col justify-between items-center'>
                                            <p><strong>시작:</strong> {dailyChallenge ? dailyChallenge.startPage : '-'}</p>
                                            <p className="my-2">↓</p>
                                            <p><strong>목표:</strong> {dailyChallenge ? dailyChallenge.endPage : '-'}</p>
                                            {localRecord && (
                                                <div className="w-full mt-4 pt-4 border-t border-gray-300">
                                                    <div className="flex items-center justify-center mb-2">
                                                        <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                                                        <span className="font-bold text-lg">오늘 나의 기록</span>
                                                    </div>
                                                    <div className="flex justify-center space-x-4">
                                                        <div className="flex items-center">
                                                            <Move className="w-4 h-4 text-blue-500 mr-1" />
                                                            <span>{localRecord.moveCount}번 이동</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Clock className="w-4 h-4 text-green-500 mr-1" />
                                                            <span>{formatTime(localRecord.time)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {/* <Link href="/ranking" className="block">
                                    <p className="text-sm mt-2 text-center text-gray">
                                        랭킹 보기
                                    </p>
                                </Link> */}
                            </Fragment>
                        )}
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full text-lg p-6">
                                    링클이 무엇인가요?
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>링클, 매일 새로운 위키피디아 스피드런</DialogTitle>
                                    <DialogDescription>
                                        Linkle, a new Wikipedia speedrun every day
                                    </DialogDescription>
                                </DialogHeader>
                                <Carousel className="w-full max-w-xs mx-auto">
                                    <CarouselContent>
                                        {qaPairs.map((qa, index) => (
                                            <CarouselItem key={index}>
                                                <div className="p-4">
                                                    <h3 className="font-bold mb-2">{qa.question}</h3>
                                                    <p>{qa.answer}</p>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
            <Button variant="outline" className="w-full max-w-lg text-lg mt-4 px-6 bg-transparent" onClick={() => router.push('/yesterday')}>
                어제의 기록
            </Button>
            <p className="text-xs mt-8 text-center text-white">© 2024 Naco. All rights reserved.</p>
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