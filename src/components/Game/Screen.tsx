"use client";

import { Loading } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { useTimer } from '@/contexts/TimerContext';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useLocalRecord } from '@/hooks/useLocalRecord';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useWikipedia } from '@/hooks/useWikipedia';
import { ArrowLeft, CircleHelp, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect } from 'react';
import GameForcedEnd from '../ForcedEnd';
import PathRecord from '../PathRecord';

const GameScreen: React.FC = () => {
    const {
        currentPage,
        isLoading,
        isFirstLoad,
        isGameOver,
        path,
        singlePath,
        moveCount,
        setMoveCount,
        fetchWikiPage,
        handleLinkClick,
        setPath,
        setFullPath,
        setSinglePath,
        isForcedEnd,
        forcedEndReason,
        setIsForcedEnd,
        setForcedEndReason,
        goBack,
        dailyChallenge,
    } = useWikipedia();

    const { isMobile } = useScreenSize();
    const { formattedTime, startTimer } = useTimer();
    const { localRecord, hasStartedToday, hasClearedToday } = useLocalRecord();
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
            } else if (hasStartedToday && localRecord.path.length > 0) {
                setPath(localRecord.path);
                setMoveCount(localRecord.moveCount);
                fetchWikiPage(localRecord.path[localRecord.path.length - 1]);
            } else if (dailyChallenge) {
                setPath([dailyChallenge.startPage]);
                setFullPath([dailyChallenge.startPage]);
                setSinglePath([dailyChallenge.startPage]);
                fetchWikiPage(dailyChallenge.startPage);
            }
        }
    }, [isFirstLoad, hasClearedToday, hasStartedToday, localRecord, dailyChallenge, fetchWikiPage, setPath, setFullPath, setSinglePath, setMoveCount, router]);

    useEffect(() => {
        if (isGameOver) {
            router.push('/success');
        }
    }, [isGameOver, router]);

    if (isForcedEnd) {
        return <GameForcedEnd reason={forcedEndReason} />;
    }

    if (isFirstLoad) return <Loading />;

    if (isLoading && !isFirstLoad) {
        return (
            <div className={`h-screen flex flex-col ${isMobile ? 'mobile-layout' : 'desktop-layout'}`}>
                <header className="flex flex-row max-h-[80px] justify-between items-center bg-[#F3F7FF] border border-b border-[#E5E5E5] px-4 py-6">
                    <div className="flex flex-row items-center">
                        <Button
                            variant="ghost"
                            onClick={goBack}
                            disabled={true}
                        >
                            <div className='flex flex-row items-center space-x-[10px]'>
                                <ArrowLeft className="w-6 h-6 text-linkle-foreground" />
                                {!isMobile ? <span className="font-[400] text-24 leading-28 text-linkle-foreground">{singlePath[singlePath.length - 2] || ''}</span> : null}
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

                <div className="flex-grow overflow-auto w-full flex flex-col items-center justify-center bg-white overflow-hidden">
                    <Loader2 className="w-[48px] h-[48px] animate-spin mb-[40px] text-[#3366CC]" />
                    <p className="font-[400] text-24 leading-28 mb-[80px]">로딩 중</p>
                    <div className="flex flex-col items-center">
                        <PathRecord path={path} />
                    </div>
                </div>

                <footer className="flex flex-row max-h-[80px] justify-between items-center bg-[#F3F7FF] border border-t border-[#E5E5E5] px-6 py-8">
                    <div className="font-[400] text-24 leading-28 text-linkle-foreground truncate">
                        현재 문서: <span className="font-[600] text-[#3366CC]">{path[path.length - 1] || ''}</span>
                    </div>
                    <div className="flex flex-row items-center space-x-4">
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
            <header className="flex flex-row max-h-[80px] justify-between items-center bg-[#F3F7FF] border border-b border-[#E5E5E5] px-4 py-6">
                <div className="flex flex-row items-center">
                    <Button
                        variant="ghost"
                        onClick={goBack}
                        disabled={!singlePath[singlePath.length - 2]}
                    >
                        <div className='flex flex-row items-center space-x-[10px]'>
                            <ArrowLeft className="w-6 h-6 text-linkle-foreground" />
                            {!isMobile ? <span className="font-[400] text-24 leading-28 text-linkle-foreground">{singlePath[singlePath.length - 2] || ''}</span> : null}
                        </div>
                    </Button>
                </div>
                <div className="flex items-center">
                    {isMobile ?
                        <span className="font-[400] text-24 leading-28 text-linkle-foreground">목표: <span className="font-[600] text-[#3366CC]">{dailyChallenge?.endPage || '-'}</span></span>
                        :
                        <span className="font-[400] text-24 leading-28 text-linkle-foreground">목표: <span className="font-[600] text-[#3366CC]">{dailyChallenge?.startPage || '-'}</span> → <span className="font-[600] text-[#3366CC]">{dailyChallenge?.endPage || '-'}</span></span>
                    }
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

            {isMobile ?
                <footer className="flex flex-col items-center bg-[#F3F7FF] border border-t border-[#E5E5E5] px-6 py-4 space-y-2">
                    <div className="flex flex-row justify-start w-full font-[400] text-24 leading-28 text-linkle-foreground truncate">
                        <div>현재 문서: <span className="font-[600] text-[#3366CC]">{currentPage.title}</span></div>
                    </div>
                    <div className="flex flex-row w-full justify-between items-center">
                        <div className='font-[400] text-24 leading-28 text-linkle-foreground'>소요 시간: <span className="font-[600] text-[#3366CC]">{formattedTime}</span></div>
                        <div className='font-[400] text-24 leading-28 text-linkle-foreground'>이동 횟수: <span className="font-[600] text-[#3366CC]">{moveCount}</span></div>
                    </div>
                </footer>
                :
                <footer className="flex flex-row max-h-[80px] justify-between items-center bg-[#F3F7FF] border border-t border-[#E5E5E5] px-6 py-8">
                    <div className="font-[400] text-24 leading-28 text-linkle-foreground truncate">
                        현재 문서: <span className="font-[600] text-[#3366CC]">{currentPage.title}</span>
                    </div>
                    <div className="flex flex-row items-center space-x-4">
                        <span className='font-[400] text-24 leading-28 text-linkle-foreground'>소요 시간: <span className="font-[600] text-[#3366CC]">{formattedTime}</span></span>
                        <span className='font-[400] text-24 leading-28 text-linkle-foreground'>이동 횟수: <span className="font-[600] text-[#3366CC]">{moveCount}</span></span>
                    </div>
                </footer>
            }
        </div>
    );
};

export default GameScreen;