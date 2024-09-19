"use client"

import { PathResult } from '@/components/PathRecord';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { OpenAIService } from '@/service/OpenAI/OpenAIService';
import confetti from 'canvas-confetti';
import { ArrowLeft, Copy, Info, Loader2, Share } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { useLocalRecordDev } from '../hooks/useLocalRecordDev';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/CustomAccordion';

interface DEV_SuccessScreenProps {
    challengeId: string;
}

const DEV_SuccessScreen: React.FC<DEV_SuccessScreenProps> = ({ challengeId }) => {
    const router = useRouter();
    const { localRecord, localFullRecord, result, setResult, hasCleared } = useLocalRecordDev(challengeId);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [shareResult, setShareResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        if (!hasCleared) return;
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        const interval = setInterval(() => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: {
                    x: Math.random(),
                    y: Math.random()
                }
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [hasCleared]);

    const handleBackToHome = () => {
        router.push('/dev');
    };

    const openShareModal = async () => {
        setIsDialogOpen(true);
        setIsLoading(true);
        setShowCursor(true);
        if (result === null) {
            try {
                const openAIService = new OpenAIService();
                const newResult = await openAIService.GET_result_for_share(localFullRecord.path);
                setShareResult(newResult.result);
                setResult(newResult.result);
            } catch (error) {
                console.error('Error getting share result:', error);
                setShareResult('OpenAI API 오류가 발생했습니다. 다시 시도해 주세요.');
            }
        } else {
            setShareResult(result);
        }
        setIsLoading(false);
        setShowCursor(false);
    };

    const handleShare = async () => {
        const shareText = `링클을 클리어했습니다!\n이동 횟수: ${localRecord.moveCount}\n소요 시간: ${formatTimeInKor(localFullRecord.time)}\n\n${shareResult}\n\nhttps://linkle-game.vercel.app/`;
        await navigator.clipboard.writeText(shareText);
        alert('결과가 클립보드에 복사되었습니다.');
    };

    if (!hasCleared) {
        return (
            <div className="relative h-screen w-screen flex flex-col items-center justify-center p-4 overflow-hidden bg-red-100">
                <Card className="relative z-10 w-full max-w-xl bg-white text-gray-800">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-center break-all">링클을 아직 시도중입니다</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-8">
                            <div className="flex flex-col space-y-2">
                                <span className='font-[400] text-24 leading-28 text-linkle-foreground'>소요 시간: <span className="font-[600] text-[#3366CC]">{formatTimeInKor(localFullRecord.time)}</span></span>
                                <span className='font-[400] text-24 leading-28 text-linkle-foreground'>이동 횟수: <span className="font-[600] text-[#3366CC]">{localRecord.moveCount}</span></span>
                            </div>
                            <PathResult path={localRecord.path} />
                        </div>
                    </CardContent>
                </Card>
                <div className="relative z-10 mt-6 w-full max-w-xl flex justify-between">
                    <Button onClick={handleBackToHome} className="w-full py-2 px-4 flex items-center justify-center">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        <span className="text-sm">메인으로 돌아가기</span>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-screen w-screen flex flex-col items-center justify-center p-4 overflow-hidden bg-red">
            <AnimatedBackground />
            <Card className="relative z-10 w-full max-w-xl bg-white text-gray-800">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-2xl font-bold text-center">링클을 클리어했습니다!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-8">
                        <div className="flex flex-col space-y-2">
                            <span className='font-[400] text-24 leading-28 text-linkle-foreground'>링클 챌린지 ID: <span className="font-[600] text-[#3366CC]">{challengeId}</span></span>
                            <span className='font-[400] text-24 leading-28 text-linkle-foreground'>소요 시간: <span className="font-[600] text-[#3366CC]">{formatTimeInKor(localFullRecord.time)}</span></span>
                            <span className='font-[400] text-24 leading-28 text-linkle-foreground'>이동 횟수: <span className="font-[600] text-[#3366CC]">{localRecord.moveCount}</span></span>
                            {/* <PathResult path={localRecord.path} /> */}
                            <Accordion type="single" collapsible defaultValue="path-result">
                                <AccordionItem value="path-result">
                                    <AccordionTrigger>이동 경로</AccordionTrigger>
                                    <AccordionContent>
                                        <PathResult path={localRecord.path} />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className='flex flex-row justify-center items-center space-x-2 mt-4'>
                <Info className='w-4 h-4 text-red-500' />
                <p className="text-sm font-bold">무한모드 특수 사항</p>
            </div>
            <div className='flex flex-col justify-center items-center space-y-1 mt-2 w-full'>
                <p className="text-sm"><strong>성공 화면에서만</strong> 결과를 공유할 수 있습니다</p>
                <p className="text-sm">메인으로 돌아가면 클리어 기록이 로컬에서 사라집니다</p>
            </div>
            <div className="relative z-10 mt-6 w-full max-w-xl flex justify-between">
                <Button onClick={handleBackToHome} className="w-[48%] py-2 px-4 flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    <span className="text-sm">메인으로 돌아가기</span>
                </Button>
                <Button onClick={openShareModal} className="w-[48%] py-2 px-4 bg-[#3366CC] hover:bg-[#2957B3] flex items-center justify-center">
                    <Share className="w-4 h-4 mr-1" />
                    <span className="text-sm">결과 공유</span>
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className='rounded-lg'>
                    <DialogHeader>
                        <DialogTitle>링클 결과 공유하기</DialogTitle>
                        <DialogDescription>
                            링클 챌린지 (ID: {challengeId})를 클리어했습니다!
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col space-y-2">
                        <span className='font-[400] text-24 leading-28 text-linkle-foreground'>소요 시간: {formatTimeInKor(localFullRecord.time)}</span>
                        <span className='font-[400] text-24 leading-28 text-linkle-foreground'>이동 횟수: {localRecord.moveCount}</span>
                        <div className="mt-4 min-h-[2em]">
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <TypeAnimation
                                    sequence={[shareResult]}
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
        </div>
    );
};

export default DEV_SuccessScreen;

const AnimatedBackground = () => (
    <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-blue-500/30 animate-gradient-x" />
);

export const formatTimeInKor = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}시간 ${mins.toString().padStart(2, '0')}분 ${secs.toString().padStart(2, '0')}초`;
    } else if (mins > 0) {
        return `${mins.toString().padStart(2, '0')}분 ${secs.toString().padStart(2, '0')}초`;
    } else {
        return `${secs.toString().padStart(2, '0')}초`;
    }
};