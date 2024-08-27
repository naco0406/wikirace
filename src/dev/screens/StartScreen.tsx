"use client";

import { Help } from '@/components/Help';
import { Button } from '@/components/ui/button';
import { useKeyboard } from '@/hooks/useKeyboard';
import { OpenAIService } from '@/service/OpenAI/OpenAIService';
import { CircleHelp, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocalRecordDev } from '../hooks/useLocalRecordDev';
import { DailyChallenge, fetchChallenge } from '../utils/gameDataDev';
import { formatTimeInKor } from './SuccessScreen';

const DEV_StartScreen: React.FC = () => {
    const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
    const [challengeId, setChallengeId] = useState<string | null>(null);
    const { hasStarted } = useLocalRecordDev(challengeId || '');
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
        const loadLastChallenge = async () => {
            const lastChallengeId = localStorage.getItem('DEV_lastChallengeId');
            if (lastChallengeId) {
                setChallengeId(lastChallengeId);
                const loadedChallenge = await fetchChallenge(lastChallengeId);
                setChallenge(loadedChallenge);
            }
        };
        loadLastChallenge();
    }, []);

    const handleNormal = useCallback(() => {
        router.push('/');
    }, [router]);

    const handleChallenge = useCallback(() => {
        router.push('/dev/challenge');
    }, [router]);

    const handleContinueGame = useCallback(() => {
        if (challengeId) {
            router.push(`/dev/game/${challengeId}`);
        }
    }, [router, challengeId]);

    const handleAuthor = useCallback(() => {
        router.push('/author');
    }, [router]);

    const handleOpenHelpModal = () => {
        setIsDialogOpen(true);
    };

    const { localFullRecord, setResult } = useLocalRecordDev(challengeId || '');
    const [shareResult, setShareResult] = useState<string | null>(null);
    const [shareText, setShareText] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleShareResult = async () => {
        if (!challengeId) return;

        setIsLoading(true);
        if (shareResult === null) {
            try {
                const openAIService = new OpenAIService();
                const result = await openAIService.GET_result_for_share(localFullRecord.path);
                setShareResult(result.result);
                setResult(result.result);
                const shareText = `링클 챌린지 (ID: ${challengeId})를 클리어했습니다!\n이동 횟수: ${localFullRecord.moveCount}\n소요 시간: ${formatTimeInKor(localFullRecord.time)}\n\n${result.result}\n\nhttps://linkle-beta.vercel.app/`;
                setShareText(shareText);
                await navigator.clipboard.writeText(shareText);
            } catch (error) {
                console.error('Error getting share result:', error);
                setShareResult('오류가 발생했습니다. 다시 시도해 주세요.');
            }
        } else {
            const shareText = `링클 챌린지 (ID: ${challengeId})를 클리어했습니다!\n이동 횟수: ${localFullRecord.moveCount}\n소요 시간: ${formatTimeInKor(localFullRecord.time)}\n\n${shareResult}\n\nhttps://linkle-beta.vercel.app/`;
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
                    <p className="font-['Rhodium_Libre'] text-[#3366CC] text-md">Dev</p>
                </div>
                <p className="font-[400] text-24 leading-28 mb-[30px] text-red-500">Dev Database</p>

                <div className="flex flex-col space-y-4 mb-[40px]">
                    <Button className="w-full text-lg bg-linkle px-20 py-6 text-white h-[56px] rounded-[28px]" onClick={handleChallenge}>
                        무한모드 시작
                    </Button>
                    {hasStarted && challengeId && (
                        <Button className="w-full text-lg bg-linkle px-20 py-6 text-white h-[56px] rounded-[28px]" onClick={handleContinueGame}>
                            이어서 도전하기
                        </Button>
                    )}
                </div>
                <div className='flex flex-row justify-center items-center space-x-2 mb-2'>
                    <Info className='w-4 h-4 text-red-500' />
                    <p className="text-sm font-bold">무한모드 특수 사항</p>
                </div>
                <div className='flex flex-col justify-center items-center space-y-1 mb-6 w-full'>
                    <p className="text-sm">1. <strong>이어서 도전하기</strong> 기능이 제한됩니다</p>
                    <p className="text-sm">2. <strong>성공 화면에서만</strong> 결과를 공유할 수 있습니다</p>
                </div>
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