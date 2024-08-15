"use client";

import { calculateLinkleDayNumber } from '@/assets/constants';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { useKeyboard } from '@/hooks/useKeyboard';
import { useLocalRecord } from '@/hooks/useLocalRecord';
import { DailyChallenge, fetchDailyChallenge } from '@/lib/gameData';
import { OpenAIService } from '@/service/OpenAI/OpenAIService';
import { CircleHelp, Copy, Loader2, Share } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { formatTimeInKor } from '../Success/Screen';

const StartScreen: React.FC = () => {
    const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
    const { hasClearedToday, hasStartedToday } = useLocalRecord();
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

    const handleAuthor = useCallback(() => {
        router.push('/author');
    }, [router]);

    const { dailyStatus, localFullRecord, setResultOfToday } = useLocalRecord();
    const linkleCount = calculateLinkleDayNumber();
    const [shareResult, setShareResult] = useState<string | null>(dailyStatus.resultOfToday);
    useEffect(() => {
        setShareResult(dailyStatus.resultOfToday);
    }, [dailyStatus.resultOfToday]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showCursor, setShowCursor] = useState(true);

    const openShareModal = async () => {
        setIsDialogOpen(true);
        setIsLoading(true);
        setShowCursor(true);
        if (shareResult === null) {
            try {
                const openAIService = new OpenAIService();
                const result = await openAIService.GET_result_for_share(localFullRecord.path);
                setShareResult(result.result);
                setResultOfToday(result.result);
            } catch (error) {
                console.error('Error getting share result:', error);
                setShareResult('오류가 발생했습니다. 다시 시도해 주세요.');
            }
        } else {
            setShareResult(dailyStatus.resultOfToday);
        }
        setIsLoading(false);
        setShowCursor(false);
    };

    const handleShare = async () => {
        const shareText = `${linkleCount}번째 링클을 클리어했습니다!\n이동 횟수: ${localFullRecord.moveCount}\n소요 시간: ${formatTimeInKor(localFullRecord.time)}\n\n${shareResult}\n\nhttps://linkle-beta.vercel.app/`;
        await navigator.clipboard.writeText(shareText);
        alert('결과가 클립보드에 복사되었습니다.');
    };

    return (
        <>
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F3F7FF] overflow-hidden">
                <header className="absolute top-0 right-0 items-center">
                    <div className="flex flex-row px-4 h-[80px] justify-between items-center">
                        <Button
                            variant="ghost"
                            disabled={true}
                        >
                            <CircleHelp className="w-6 h-6 text-linkle-foreground" />
                        </Button>
                    </div>
                </header>
                <div className='pl-[32px] flex flex-row space-x-2'>
                    <h1 className="pt-[24px] font-['Rhodium_Libre'] text-[#3366CC] text-8xl font-[400]">Linkle</h1>
                    <p className="font-['Rhodium_Libre'] text-[#3366CC] text-md">#{linkleCount}</p>
                </div>
                {/* <p className="font-[400] text-24 leading-28 mt-[28px] mb-[60px] text-linkle-foreground">{`오늘 완료한 사람 수 : ${dailyChallenge ? dailyChallenge.totalCount : '-'}`}</p> */}
                <p className="font-[400] text-xl leading-28 mb-[60px] text-linkle-foreground">매일 위키피디아 탐험하기</p>
                {!hasClearedToday ? (
                    <Link href="/game" className="block mb-[40px]">
                        <Button className="w-full text-lg bg-linkle px-20 py-6 text-white h-[56px] rounded-[28px]">
                            {hasStartedToday ? '이어서 도전하기' : '시작'}
                        </Button>
                    </Link>
                ) : (
                    <div className='flex flex-col space-y-4 items-center'>
                        <Button className="w-full max-w-md text-lg px-20 py-6 bg-linkle text-white cursor-not-allowed h-[56px] rounded-[28px]" disabled>
                            오늘의 도전을 완료했습니다!
                        </Button>
                        <Button onClick={openShareModal} className="w-full py-2 px-4 flex items-center justify-center" variant="ghost">
                            <Share className="w-4 h-4 mr-1" />
                            <span className="text-sm">결과 공유</span>
                        </Button>
                    </div>
                )}
                <p className="text-xs text-center text-linkle-foreground cursor-pointer absolute bottom-10" onClick={handleAuthor}>
                    © 2024 <span className='text-[#3366CC] font-[600] underline'>Linkle</span>. All rights reserved.
                </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="rounded-lg">
                    <DialogHeader>
                        <DialogTitle>링클 결과 공유하기</DialogTitle>
                        <DialogDescription>
                            {linkleCount}번째 링클을 클리어했습니다!
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col space-y-2">
                        <span className='font-[400] text-24 leading-28 text-linkle-foreground'>소요 시간: {formatTimeInKor(localFullRecord.time)}</span>
                        <span className='font-[400] text-24 leading-28 text-linkle-foreground'>이동 횟수: {localFullRecord.moveCount}</span>
                        <div className="mt-4 min-h-[2em]">
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <TypeAnimation
                                    sequence={[shareResult ?? '']}
                                    wrapper="span"
                                    cursor={showCursor}
                                    speed={50}
                                    style={{ fontSize: '1em', display: 'inline-block' }}
                                />
                            )}
                        </div>
                    </div>
                    <Button onClick={handleShare} className="mt-4 w-full" disabled={isLoading}>
                        <Copy className="w-4 h-4 mr-2" />
                        결과 복사하기
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default StartScreen;