"use client";

import { GameLoading, Loading } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useTimer } from '@/contexts/TimerContext';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useLocalRecord } from '@/hooks/useLocalRecord';
import { useNickname } from '@/hooks/useNickname';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useWikipedia } from '@/hooks/useWikipedia';
import { ArrowLeft, CircleHelp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import GameForcedEnd from '../ForcedEnd';
import PathRecord from '../PathRecord';

const GameScreen: React.FC = () => {
    const {
        currentPage,
        isLoading,
        isFirstLoad,
        isGameOver,
        path,
        moveCount,
        setMoveCount,
        fetchWikiPage,
        handleLinkClick,
        setPath,
        isForcedEnd,
        forcedEndReason,
        setIsForcedEnd,
        setForcedEndReason,
        goBack,
        dailyChallenge,
    } = useWikipedia();

    const { isMobile } = useScreenSize();
    const { formattedTime, startTimer, resetTimer } = useTimer();
    const [dialogOpen, setDialogOpen] = useState(false);
    const { localRecord, hasStartedToday, hasClearedToday, hasGiveUpToday, setHasGiveUpToday } = useLocalRecord();
    const router = useRouter();

    const handleForceEndAction = useCallback(() => {
        setIsForcedEnd(true);
        setForcedEndReason('검색 기능 사용이 감지되었습니다.');
    }, [setIsForcedEnd, setForcedEndReason]);

    const keyMap = {
        'meta+f': handleForceEndAction,
        'ctrl+f': handleForceEndAction,
    };

    const { isPressed } = useKeyboard(keyMap);

    useEffect(() => {
        if (isPressed('meta+f') || isPressed('ctrl+f')) {
            handleForceEndAction();
        }
    }, [isPressed, handleForceEndAction]);

    useEffect(() => {
        startTimer();
    }, [startTimer]);

    useEffect(() => {
        if (isFirstLoad) {
            if (hasClearedToday) {
                router.push('/success');
            } else if (hasGiveUpToday) {
                router.push('/');
            } else if (hasStartedToday && localRecord.path.length > 0) {
                setPath(localRecord.path);
                setMoveCount(localRecord.moveCount);
                fetchWikiPage(localRecord.path[localRecord.path.length - 1]);
            } else if (dailyChallenge) {
                setPath([dailyChallenge.startPage]);
                fetchWikiPage(dailyChallenge.startPage);
            }
        }
    }, [isFirstLoad, hasClearedToday, hasGiveUpToday, hasStartedToday, localRecord, dailyChallenge, fetchWikiPage, setPath, setMoveCount, router]);

    if (isGameOver) {
        router.push('/success');
    }

    if (isForcedEnd) {
        return <GameForcedEnd reason={forcedEndReason} />;
    }

    if (isFirstLoad) return <Loading />;

    if (isLoading && !isFirstLoad) {
        return (
            <div className={`h-screen flex flex-col ${isMobile ? 'mobile-layout' : 'desktop-layout'}`}>
                <header className="flex flex-row max-h-[80px] justify-between items-center bg-white border border-b border-[#E5E5E5] px-4 py-6">
                    <div className="flex flex-row items-center">
                        <Button
                            variant="ghost"
                            onClick={goBack}
                            disabled={path.length <= 1}
                        >
                            <div className='flex flex-row items-center space-x-[10px]'>
                                <ArrowLeft className="w-6 h-6 text-linkle-foreground" />
                                <span className="font-[400] text-24 leading-28 text-linkle-foreground">{path[path.length - 2] || ''}</span>
                            </div>
                        </Button>
                    </div>
                    <div className="flex items-center">
                        <span className="font-[400] text-24 leading-28 text-linkle-foreground">목표: <span className="font-[600] text-[#3366CC]">{dailyChallenge?.startPage || '-'}</span> → <span className="font-[600] text-[#3366CC]">{dailyChallenge?.endPage || '-'}</span></span>
                    </div>
                    <div className="flex flex-row items-center">
                        <Button
                            variant="ghost"
                            disabled={true}
                        >
                            <CircleHelp className="w-6 h-6 text-linkle-foreground" />
                        </Button>
                    </div>
                </header>

                <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white overflow-hidden">
                    <p className="mt-[28px] mb-[100px]" />
                    <Loader2 className="w-[48px] h-[48px] animate-spin mt-[50px] mb-[40px] text-[#3366CC]" />
                    <p className="font-[400] text-24 leading-28 mb-[80px]">로딩 중</p>
                    <div className="flex flex-col min-h-[280px] items-center">
                        <PathRecord path={path} />
                    </div>
                </div>

                <footer className="flex flex-row max-h-[80px] justify-between items-center bg-white border border-t border-[#E5E5E5] px-6 py-8">
                    <div className="font-[400] text-24 leading-28 text-linkle-foreground truncate">
                        현재 문서: <span className="font-[600] text-[#3366CC]">{path[path.length - 1] || ''}</span>
                    </div>
                    <div className="flex flex-row items-center space-x-[50px]">
                        <span className='font-[400] text-24 leading-28 text-linkle-foreground'>소요 시간: <span className="font-[600] text-[#3366CC]">{formattedTime}</span></span>
                        <span className='font-[400] text-24 leading-28 text-linkle-foreground'>이동 횟수: <span className="font-[600] text-[#3366CC]">{moveCount}</span></span>
                    </div>
                </footer>
            </div>
        );
    }

    if (!currentPage) return <div>Error loading page</div>;

    return (
        <div className={`h-screen flex flex-col ${isMobile ? 'mobile-layout' : 'desktop-layout'}`}>
            <header className="flex flex-row max-h-[80px] justify-between items-center bg-white border border-b border-[#E5E5E5] px-4 py-6">
                <div className="flex flex-row items-center">
                    <Button
                        variant="ghost"
                        onClick={goBack}
                        disabled={path.length <= 1}
                    >
                        <div className='flex flex-row items-center space-x-[10px]'>
                            <ArrowLeft className="w-6 h-6 text-linkle-foreground" />
                            <span className="font-[400] text-24 leading-28 text-linkle-foreground">{path[path.length - 2] || ''}</span>
                        </div>
                    </Button>
                </div>
                <div className="flex items-center">
                    <span className="font-[400] text-24 leading-28 text-linkle-foreground">목표: <span className="font-[600] text-[#3366CC]">{dailyChallenge?.startPage || '-'}</span> → <span className="font-[600] text-[#3366CC]">{dailyChallenge?.endPage || '-'}</span></span>
                </div>
                <div className="flex flex-row items-center">
                    <Button
                        variant="ghost"
                        disabled={true}
                    >
                        <CircleHelp className="w-6 h-6 text-linkle-foreground" />
                    </Button>
                </div>
            </header>

            <div className="flex-grow overflow-auto p-4" onClick={handleLinkClick}>
                <div className="wiki-content wiki-content max-w-full overflow-x-hidden break-words" dangerouslySetInnerHTML={{ __html: currentPage.html }} />
            </div>

            <footer className="flex flex-row max-h-[80px] justify-between items-center bg-white border border-t border-[#E5E5E5] px-6 py-8">
                <div className="font-[400] text-24 leading-28 text-linkle-foreground truncate">
                    현재 문서: <span className="font-[600] text-[#3366CC]">{currentPage.title}</span>
                </div>
                <div className="flex flex-row items-center space-x-[50px]">
                    <span className='font-[400] text-24 leading-28 text-linkle-foreground'>소요 시간: <span className="font-[600] text-[#3366CC]">{formattedTime}</span></span>
                    <span className='font-[400] text-24 leading-28 text-linkle-foreground'>이동 횟수: <span className="font-[600] text-[#3366CC]">{moveCount}</span></span>
                </div>
            </footer>
        </div>
    );
};

export default GameScreen;