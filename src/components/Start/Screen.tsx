"use client";

import { calculateLinkleDayNumber } from '@/assets/constants';
import { Button } from '@/components/ui/button';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useLocalRecord } from '@/hooks/useLocalRecord';
import { DailyChallenge, fetchDailyChallenge } from '@/lib/gameData';
import { OpenAIService } from '@/service/OpenAI/OpenAIService';
import { CircleHelp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { PathResult } from '../PathRecord';
import { formatTimeInKor } from '../Success/Screen';
import { Help } from '../Help';
import { useEnvironment } from '@/contexts/EnvironmentContext';


const StartScreen: React.FC = () => {
    const { isDev } = useEnvironment();
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

    const handleDev = useCallback(() => {
        router.push('/dev');
    }, [router]);

    const handleOpenHelpModal = () => {
        setIsDialogOpen(true);
    };

    const { dailyStatus, myRank, localRecord, localFullRecord, setResultOfToday } = useLocalRecord();
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
                const shareText = `${linkleCount}번째 링클을 클리어했습니다!\n이동 횟수: ${localFullRecord.moveCount}\n소요 시간: ${formatTimeInKor(localFullRecord.time)}\n\n${result.result}\n\nhttps://linkle-game.vercel.app/`;
                setShareText(shareText);
                await navigator.clipboard.writeText(shareText);
            } catch (error) {
                console.error('Error getting share result:', error);
                setShareResult('오류가 발생했습니다. 다시 시도해 주세요.');
            }
        } else {
            setShareResult(dailyStatus.resultOfToday);
            const shareText = `${linkleCount}번째 링클을 클리어했습니다!\n이동 횟수: ${localFullRecord.moveCount}\n소요 시간: ${formatTimeInKor(localFullRecord.time)}\n\n${dailyStatus.resultOfToday}\n\nhttps://linkle-game.vercel.app/`;
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
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F3F7FF] overflow-hidden">
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
                {isDev && <p className="font-[400] text-24 leading-28 mb-[30px] text-red-500">Prod Database</p>}
                {/* <p className="font-[400] text-24 leading-28 mt-[28px] mb-[60px] text-linkle-foreground">{`오늘 완료한 사람 수 : ${dailyChallenge ? dailyChallenge.totalCount : '-'}`}</p> */}
                {!hasClearedToday && !isDev && <p className="font-[400] text-xl leading-28 mb-[60px] text-linkle-foreground">매일 위키피디아 탐험하기</p>}
                {!hasClearedToday ? (
                    <Link href="/game" className="block mb-[40px]">
                        <Button className="w-full text-lg bg-linkle px-20 py-6 text-white h-[56px] rounded-[28px]">
                            {hasStartedToday ? '이어서 도전하기' : '시작'}
                        </Button>
                    </Link>
                ) : (
                    <div className='flex flex-col space-y-8 items-center w-full max-w-md px-4'>
                        <div className="flex flex-col space-y-4 w-full">
                            <div className="flex flex-col space-y-2 w-full my-6">
                                <div className="text-xl font-[600] text-center text-linkle-foreground'">{linkleCount}번째 링클을 클리어했습니다!</div>
                                <div className='font-[400] text-24 leading-28 text-linkle-foreground text-center'>일일 순위 : <span className="font-[600] text-[#3366CC]">{myRank}</span>등</div>
                            </div>
                            <div className="flex flex-col space-y-2 w-full justify-start">
                                <span className='font-[400] text-24 leading-28 text-linkle-foreground'>소요 시간: <span className="font-[600] text-[#3366CC]">{formatTimeInKor(localFullRecord.time)}</span></span>
                                <span className='font-[400] text-24 leading-28 text-linkle-foreground'>이동 횟수: <span className="font-[600] text-[#3366CC]">{localFullRecord.moveCount}</span></span>
                            </div>
                            <div className="flex flex-col w-full bg-white rounded-xl border border-[2px] border-[#DBE8F9] py-4">
                                <PathResult path={localRecord.path} />
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
                {isDev && (
                    <div className='flex flex-col space-y-2 items-center w-full max-w-sm px-4 mt-4'>
                        <Button
                            onClick={handleAdminAction}
                            className="w-full text-md font-bold bg-transparent text-black h-[40px] rounded-[20px] border border-black hover:bg-black hover:text-white"
                        >
                            관리자 페이지
                        </Button>
                        <Button
                            onClick={handleDev}
                            className="w-full text-md bg-transparent text-black h-[40px] rounded-[20px] border border-black hover:bg-black hover:text-white"
                        >
                            무한 모드
                        </Button>
                    </div>
                )}
                <p className="text-xs text-center text-linkle-foreground cursor-pointer absolute bottom-10" onClick={handleAuthor}>
                    © 2024 <span className='text-[#3366CC] font-[600] underline'>Linkle</span>. All rights reserved.
                </p>
                <Help isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>
        </>
    );
};

export default StartScreen;