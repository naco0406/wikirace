"use client";

import React, { Fragment, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { DailyChallenge, fetchDailyChallenge } from '@/lib/gameData';
import { useNickname } from '@/hooks/useNickname';
import { useLocalRecord } from '@/hooks/useLocalRecord';
import { getKSTDateString } from '@/lib/firebaseConfig';
import { Trophy, Move, Clock } from 'lucide-react';

const StartScreen: React.FC = () => {
    const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
    const nickname = useNickname();
    const { bestRecord, hasClearedToday, hasGiveUpToday, hasStartedToday } = useLocalRecord();
    const today = getKSTDateString();

    useEffect(() => {
        const loadDailyChallenge = async () => {
            const challenge = await fetchDailyChallenge();
            setDailyChallenge(challenge);
        };
        loadDailyChallenge();
    }, []);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
            <p className="text-lg mb-4 text-center text-white">안녕하세요, {nickname}님!</p>
            <Card className="w-full max-w-lg bg-white text-gray-800 shadow-lg rounded-lg overflow-hidden">
                <CardHeader className="p-6">
                    <CardTitle className="text-3xl font-bold text-center">위키 레이스</CardTitle>
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
                                            {bestRecord && (
                                                <div className="w-full mt-4 pt-4 border-t border-gray-300">
                                                    <div className="flex items-center justify-center mb-2">
                                                        <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                                                        <span className="font-bold text-lg">나의 최고 기록</span>
                                                    </div>
                                                    <div className="flex justify-center space-x-4">
                                                        <div className="flex items-center">
                                                            <Move className="w-4 h-4 text-blue-500 mr-1" />
                                                            <span>{bestRecord.moveCount}번 이동</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Clock className="w-4 h-4 text-green-500 mr-1" />
                                                            <span>{formatTime(bestRecord.time)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <Link href="/ranking" className="block">
                                    <p className="text-sm mt-2 text-center text-gray">
                                        랭킹 보기
                                    </p>
                                </Link>
                            </Fragment>
                        )}
                    </div>
                </CardContent>
            </Card>
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