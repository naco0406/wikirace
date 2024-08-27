"use client";

import { calculateLinkleDayNumber } from '@/assets/constants';
import { Help } from '@/components/Help';
import { PathResult } from '@/components/PathRecord';
import { Button } from '@/components/ui/button';
import { useKeyboard } from '@/hooks/useKeyboard';
import { OpenAIService } from '@/service/OpenAI/OpenAIService';
import { CircleHelp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { formatTimeInKor } from './SuccessScreen';
import { useLocalRecordDev } from '../hooks/useLocalRecordDev';
import { DailyChallenge, fetchDailyChallenge } from '../utils/gameDataDev';


const DEV_StartScreen: React.FC = () => {
    const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
    const { hasClearedToday, hasStartedToday } = useLocalRecordDev();
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

    const handleNormal = useCallback(() => {
        router.push('/');
    }, [router]);

    const handleDevGame = useCallback(() => {
        router.push('/dev/game');
    }, [router]);

    const handleAuthor = useCallback(() => {
        router.push('/author');
    }, [router]);

    const handleOpenHelpModal = () => {
        setIsDialogOpen(true);
    };

    const { dailyStatus, localFullRecord, setResultOfToday } = useLocalRecordDev();
    const linkleCount = calculateLinkleDayNumber();
    const [shareResult, setShareResult] = useState<string | null>(dailyStatus.resultOfToday);
    const [shareText, setShareText] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        setShareResult(dailyStatus.resultOfToday);
    }, [dailyStatus.resultOfToday]);
    const [isLoading, setIsLoading] = useState(false);

    const handleShareResult = async () => {
        setIsLoading(true);
        if (shareResult === null) {
            try {
                const openAIService = new OpenAIService();
                const result = await openAIService.GET_result_for_share(localFullRecord.path);
                setShareResult(result.result);
                setResultOfToday(result.result);
                const shareText = `${linkleCount}번째 링클을 클리어했습니다!\n이동 횟수: ${localFullRecord.moveCount}\n소요 시간: ${formatTimeInKor(localFullRecord.time)}\n\n${result.result}\n\nhttps://linkle-beta.vercel.app/`;
                setShareText(shareText);
                await navigator.clipboard.writeText(shareText);
            } catch (error) {
                console.error('Error getting share result:', error);
                setShareResult('오류가 발생했습니다. 다시 시도해 주세요.');
            }
        } else {
            setShareResult(dailyStatus.resultOfToday);
            const shareText = `${linkleCount}번째 링클을 클리어했습니다!\n이동 횟수: ${localFullRecord.moveCount}\n소요 시간: ${formatTimeInKor(localFullRecord.time)}\n\n${dailyStatus.resultOfToday}\n\nhttps://linkle-beta.vercel.app/`;
            setShareText(shareText);
            await navigator.clipboard.writeText(shareText);
        }
        setIsLoading(false);
    }

    const handleShare = async () => {
        await handleShareResult();
        alert('결과가 클립보드에 복사되었습니다.');
    };

    return (
        <>
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F3F7FF] overflow-hidden bg-red">
                <header className="absolute top-0 right-0 items-center">
                    <div className="flex flex-row px-4 h-[80px] justify-between items-center">
                        <Button
                            variant="ghost"
                            onClick={handleOpenHelpModal}
                        >
                            <CircleHelp className="w-6 h-6 text-linkle-foreground" />
                        </Button>
                    </div>
                </header>
                <div className='pl-[32px] flex flex-row space-x-2'>
                    <h1 className="pt-[24px] font-['Rhodium_Libre'] text-[#3366CC] text-6xl sm:text-8xl font-[400]">Linkle</h1>
                    <p className="font-['Rhodium_Libre'] text-[#3366CC] text-md">#{linkleCount}</p>
                </div>
                <p className="font-[400] text-24 leading-28 mb-[60px] text-red-500">Dev Database</p>
                {!hasClearedToday ? (
                    <div className="block mb-[40px]" onClick={handleDevGame}>
                        <Button className="w-full text-lg bg-linkle px-20 py-6 text-white h-[56px] rounded-[28px]">
                            {hasStartedToday ? '이어서 도전하기' : '시작'}
                        </Button>
                    </div>
                ) : (
                    <div className='flex flex-col space-y-8 items-center w-full max-w-md px-4'>
                        <div className="flex flex-col space-y-4 w-full">
                            <div className="text-xl font-[600] text-center my-6 text-linkle-foreground">{linkleCount}번째 링클을 클리어했습니다!</div>
                            <div className="flex flex-col space-y-2 w-full justify-start">
                                <span className='font-[400] text-24 leading-28 text-linkle-foreground'>소요 시간: <span className="font-[600] text-[#3366CC]">{formatTimeInKor(localFullRecord.time)}</span></span>
                                <span className='font-[400] text-24 leading-28 text-linkle-foreground'>이동 횟수: <span className="font-[600] text-[#3366CC]">{localFullRecord.moveCount}</span></span>
                            </div>
                            <div className="flex flex-col w-full bg-white rounded-xl border border-[2px] border-[#DBE8F9] py-4">
                                <PathResult path={localFullRecord.path} />
                            </div>
                        </div>
                        <Button className="w-full max-w-[250px] text-lg px-20 py-6 bg-linkle text-white h-[56px] rounded-[28px]" onClick={handleShare}>
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <span>결과 공유</span>
                            )}
                        </Button>
                    </div>
                )}
                <div className='flex flex-col space-y-2 items-center w-full max-w-sm px-4'>
                    <Button
                        onClick={handleNormal}
                        className="w-full text-md bg-transparent text-black h-[40px] rounded-[20px] border border-black hover:bg-black hover:text-white"
                    >
                        일반 모드
                    </Button>
                </div>
                <p className="text-xs text-center text-linkle-foreground cursor-pointer absolute bottom-10" onClick={handleAuthor}>
                    © 2024 <span className='text-[#3366CC] font-[600] underline'>Linkle</span>. All rights reserved.
                </p>
                <Help isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>
        </>
    );
};

export default DEV_StartScreen;