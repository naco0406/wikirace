"use client"

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
import html2canvas from 'html2canvas';
import { ArrowLeft, Download, Share } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const SuccessScreen: React.FC = () => {
    const router = useRouter();
    const { elapsedTime } = useTimer();
    const nickname = useNickname();
    const { localRecord } = useLocalRecord();

    const [finalLocalTime, setFinalLocalTime] = useState(0);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    React.useEffect(() => {
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

    const handleShare = () => {
        setIsDialogOpen(true);
    };

    const handleDownload = async () => {
        if (containerRef.current) {
            const canvas = await html2canvas(containerRef.current, {
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
                windowWidth: containerRef.current.scrollWidth,
                windowHeight: containerRef.current.scrollHeight,
                backgroundColor: null,
            });
            // 캔버스 크기를 약간 줄여 테두리 픽셀을 제거
            const croppedCanvas = document.createElement('canvas');
            const ctx = croppedCanvas.getContext('2d');
            croppedCanvas.width = canvas.width - 2;
            croppedCanvas.height = canvas.height - 2;
            ctx?.drawImage(canvas, -1, -1);

            const dataUrl = croppedCanvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `Linkle-${today}.png`;
            link.click();
        }
    };

    const ContentToShare = () => (
        <Card className="w-full max-w-md bg-white text-gray-800">
            <CardHeader>
                <CardTitle className="text-2xl md:text-3xl font-bold text-center">축하합니다, {nickname}!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-lg md:text-xl text-center">목표 페이지에 도달했습니다!</p>
                <div className="space-y-2">
                    <p><strong>소요 시간:</strong> {formatTime(finalLocalTime)}</p>
                    <p><strong>이동 횟수:</strong> {localRecord.moveCount}</p>
                    <div>
                        <strong>경로:</strong>
                        <ul className="list-disc list-inside">
                            {localRecord.path.map((page, index) => (
                                <li key={index} className="truncate text-sm py-1">{page}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 p-4">
            <ContentToShare />
            <div className="mt-6 w-full max-w-md flex justify-between">
                <Button onClick={handleBackToHome} className="w-[48%] py-2 px-4 flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    <span className="text-sm">메인으로 돌아가기</span>
                </Button>
                <Button onClick={handleShare} className="w-[48%] py-2 px-4 bg-purple-600 hover:bg-purple-700 flex items-center justify-center">
                    <Share className="w-4 h-4 mr-1" />
                    <span className="text-sm">결과 공유</span>
                </Button>
            </div>
            {/* <Link href="/ranking" className="mt-4 w-full max-w-md">
        <Button variant="outline" className="text-sm text-center w-full bg-transparent border border-[2px] text-white">
          <Trophy className="w-4 h-4 mr-2" />
          랭킹 보기
        </Button>
      </Link> */}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className='rounded-lg'>
                    <DialogHeader>
                        <DialogTitle>게임 결과</DialogTitle>
                    </DialogHeader>
                    <div ref={containerRef} className='bg-transparent'>
                        <div className="flex flex-col items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 p-4">
                            <ContentToShare />
                        </div>
                    </div>
                    <Button onClick={handleDownload} className="mt-4 w-full">
                        <Download className="w-4 h-4 mr-2" />
                        이미지 다운로드
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SuccessScreen;