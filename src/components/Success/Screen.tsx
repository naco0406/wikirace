"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { useTimer } from '@/contexts/TimerContext';
import { useLocalRecord } from '@/hooks/useLocalRecord';
import { useNickname } from '@/hooks/useNickname';
import { getKSTDateString } from '@/lib/firebaseConfig';
import confetti from 'canvas-confetti';
import { ArrowLeft, Copy, Share } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TypeAnimation } from 'react-type-animation';
import { PathResult } from '../PathRecord';
import { OpenAIService } from '@/service/OpenAIService';
import { Loader2 } from 'lucide-react';

const SuccessScreen: React.FC = () => {
    const router = useRouter();
    const { elapsedTime } = useTimer();
    const nickname = useNickname();
    const { localRecord, localFullRecord } = useLocalRecord();

    const [finalLocalTime, setFinalLocalTime] = useState(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [shareResult, setShareResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        setFinalLocalTime(elapsedTime);
    }, []);

    const handleBackToHome = () => {
        router.push('/');
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const today = getKSTDateString();

    const openShareModal = async () => {
        setIsDialogOpen(true);
        setIsLoading(true);
        setShowCursor(true);
        try {
            const openAIService = new OpenAIService();
            const result = await openAIService.GET_result_for_share(localFullRecord.path);
            setShareResult(result);
        } catch (error) {
            console.error('Error getting share result:', error);
            setShareResult('오류가 발생했습니다. 다시 시도해 주세요.');
        }
        setIsLoading(false);
        setShowCursor(false);
    };

    const handleShare = async () => {
        const shareText = `${today} 위키피디아 탐험\n소요 시간: ${formatTime(finalLocalTime)}\n이동 횟수: ${localRecord.moveCount}\n경로: ${shareResult}\n#위키피디아_탐험 #WikipediaExplorer`;
        await navigator.clipboard.writeText(shareText);
        alert('결과가 클립보드에 복사되었습니다.');
    };

    return (
        <div className="relative h-screen w-screen flex flex-col items-center justify-center p-4 overflow-hidden">
            <AnimatedBackground />
            <Card className="relative z-10 w-full max-w-xl bg-white text-gray-800">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl font-bold text-center">목표 페이지에 도달했습니다!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-8">
                        <div className="flex flex-col space-y-2">
                            <span className='font-[400] text-24 leading-28 text-linkle-foreground'>소요 시간: <span className="font-[600] text-[#3366CC]">{formatTime(finalLocalTime)}</span></span>
                            <span className='font-[400] text-24 leading-28 text-linkle-foreground'>이동 횟수: <span className="font-[600] text-[#3366CC]">{localRecord.moveCount}</span></span>
                        </div>
                        <PathResult path={localRecord.path} />
                    </div>
                </CardContent>
            </Card>
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
                    </DialogHeader>
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
                    <Button onClick={handleShare} className="mt-4 w-full" disabled={isLoading}>
                        <Copy className="w-4 h-4 mr-2" />
                        결과 복사하기
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SuccessScreen;

const AnimatedBackground = () => (
    <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-blue-500/30 animate-gradient-x" />
);
