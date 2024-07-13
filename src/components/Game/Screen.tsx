"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loading, GameLoading } from '@/components/Loading';
import GameSuccess from '../Success';
import { useWikipedia } from '@/hooks/useWikipedia';
import GameForcedEnd from '../ForcedEnd';
import { ArrowLeft } from 'lucide-react';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';

const GameScreen: React.FC = () => {
    const {
        currentPage,
        isLoading,
        isFirstLoad,
        path,
        isGameOver,
        moveCount,
        fetchWikiPage,
        handleLinkClick,
        setPath,
        isMobile,
        isForcedEnd,
        forcedEndReason,
        goBack,
        dailyChallenge,
        timer,
        formatTime,
        nickname,
        bestRecord,
        handleGameOver
    } = useWikipedia();

    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        if (dailyChallenge) {
            setPath([dailyChallenge.startPage]);
            fetchWikiPage(dailyChallenge.startPage);
        }
    }, [fetchWikiPage, setPath, dailyChallenge]);

    if (isForcedEnd) {
        return <GameForcedEnd reason={forcedEndReason} />;
    }

    if (isGameOver) {
        return (
            <GameSuccess
                time={formatTime(timer)}
                moveCount={moveCount}
                path={path}
                nickname={nickname}
                bestRecord={bestRecord}
            />
        );
    }

    if (isFirstLoad) return <Loading />;

    if (isLoading && !isFirstLoad) return (
        <GameLoading
            fromPage={path[path.length - 2] || ''}
            toPage={path[path.length - 1] || ''}
            elapsedTime={formatTime(timer)}
            moveCount={moveCount}
            path={path}
        />
    );

    if (!currentPage) return <div>Error loading page</div>;

    return (
        <div className={`h-screen flex flex-col ${isMobile ? 'mobile-layout' : 'desktop-layout'}`}>
            <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        onClick={goBack}
                        disabled={path.length <= 1}
                        className="mr-4 flex items-center text-white"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </Button>
                </div>
                {/* <h1 className="text-xl font-bold text-center flex-grow">위키 레이스</h1> */}
                <div className="flex items-center">
                    <span className="mr-4">목표: {dailyChallenge?.endPage || '-'}</span>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="secondary">게임 그만두기</Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-lg p-6">
                            <DialogHeader>
                                <DialogTitle>게임을 그만두시겠습니까?</DialogTitle>
                                <DialogDescription>
                                    진행 상황이 저장되지 않습니다.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex flex-row justify-end space-x-2">
                                <DialogClose asChild>
                                    <Button variant="outline" className="flex-grow-0" onClick={() => setDialogOpen(false)}>취소</Button>
                                </DialogClose>
                                <Link href="/" passHref>
                                    <Button variant="destructive" className="flex-grow-0">확인</Button>
                                </Link>
                            </DialogFooter>
                        </DialogContent>

                    </Dialog>
                </div>
            </header>

            <div className="flex-grow overflow-auto p-4" onClick={handleLinkClick}>
                <div className="wiki-content" dangerouslySetInnerHTML={{ __html: currentPage.html }} />
            </div>

            <footer className="bg-secondary">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                            <span>소요 시간: {formatTime(timer)}</span>
                            <span>이동 횟수: {moveCount}</span>
                        </div>
                        <div className="text-sm text-muted-foreground truncate mt-2">
                            현재 페이지: {currentPage.title}
                        </div>
                    </CardContent>
                </Card>
            </footer>
        </div>
    );
};

export default GameScreen;
