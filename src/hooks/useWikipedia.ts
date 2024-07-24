"use client";

import { DailyChallenge, MyRanking, fetchDailyChallenge, submitRanking } from '@/lib/gameData';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalRecord } from './useLocalRecord';
import { useNickname } from './useNickname';
import { useScreenSize } from './useScreenSize';
import { useTimer } from '@/contexts/TimerContext';

interface WikiPageContent {
    title: string;
    html: string;
    fullurl: string;
}

export const useWikipedia = () => {
    const [currentPage, setCurrentPage] = useState<WikiPageContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [path, setPath] = useState<string[]>([]);
    const [targetPage, setTargetPage] = useState('');
    const [isGameOver, setIsGameOver] = useState(false);
    const [moveCount, setMoveCount] = useState(0);
    const [isForcedEnd, setIsForcedEnd] = useState(false);
    const [forcedEndReason, setForcedEndReason] = useState('');
    const initialLoadRef = useRef(true);
    const initialPlatformRef = useRef<'mobile' | 'desktop' | null>(null);
    const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);

    const { isMobile } = useScreenSize();
    const nickname = useNickname();
    const { bestRecord, currentRecord, updateCurrentRecord, finalizeRecord, resetCurrentRecord } = useLocalRecord();
    const { elapsedTime } = useTimer();

    useEffect(() => {
        if (initialPlatformRef.current === null) {
            initialPlatformRef.current = isMobile ? 'mobile' : 'desktop';
        } else if (!initialLoadRef.current) {
            const currentPlatform = isMobile ? 'mobile' : 'desktop';
            if (currentPlatform !== initialPlatformRef.current) {
                setIsForcedEnd(true);
                setForcedEndReason('게임 진행 도중 플랫폼이 변경되었습니다. (모바일 ↔ PC)');
            }
        }
    }, [isMobile]);

    useEffect(() => {
        const loadDailyChallenge = async () => {
            const challenge = await fetchDailyChallenge();
            if (challenge) {
                setDailyChallenge(challenge);
            }
        };
        loadDailyChallenge();
    }, []);

    useEffect(() => {
        // Initialize game state from current record if it exists
        if (currentRecord.path.length > 0) {
            setPath(currentRecord.path);
            setMoveCount(currentRecord.moveCount);
            // You might want to set the current page to the last page in the path
            // This might require fetching the page content
            fetchWikiPage(currentRecord.path[currentRecord.path.length - 1]);
        }
    }, []);

    const formatPageTitle = (title: string) => {
        return title.replace(/_/g, ' ');
    };
    const normalizePageTitle = (title: string) => {
        return title.toLowerCase().replace(/\s+/g, ' ').trim();
    };

    const isEndPage = useCallback((currentTitle: string, endTitle: string) => {
        const normalizedCurrent = normalizePageTitle(currentTitle);
        const normalizedEnd = normalizePageTitle(endTitle);

        // Direct match
        if (normalizedCurrent === normalizedEnd) return true;

        // Check if the current title contains the end title or vice versa
        if (normalizedCurrent.includes(normalizedEnd) || normalizedEnd.includes(normalizedCurrent)) return true;

        // Check for plural/singular forms (very basic)
        if (normalizedCurrent + 's' === normalizedEnd || normalizedCurrent === normalizedEnd + 's') return true;

        // Check for parentheses
        const currentWithoutParentheses = normalizedCurrent.replace(/\s*\(.*?\)\s*/g, '');
        const endWithoutParentheses = normalizedEnd.replace(/\s*\(.*?\)\s*/g, '');
        if (currentWithoutParentheses === endWithoutParentheses) return true;

        return false;
    }, []);


    const fetchWikiPage = useCallback(async (title: string) => {
        setIsLoading(true);
        const formattedTitle = formatPageTitle(title);
        setTargetPage(formattedTitle);
        const apiUrl = 'https://ko.wikipedia.org/w/api.php';
        const params = {
            action: 'parse',
            format: 'json',
            page: title,
            prop: 'text|info|redirects',
            mobileformat: isMobile ? 'true' : 'false',
            redirects: 'true',
            origin: '*'
        };

        try {
            const response = await axios.get(apiUrl, { params });
            const page = response.data.parse;

            let html = page.text['*'];

            if (isMobile) {
                html = html.replace(/<a\s+(?:[^>]*?\s+)?class="external[^>]*>(.*?)<\/a>/g, '$1');
                html = html.replace(/<span class="mw-editsection">.*?<\/span>/g, '');
            }

            const pageTitle = formatPageTitle(page.title);
            setCurrentPage({
                title: pageTitle,
                html: html,
                fullurl: page.fullurl
            });

            // Check for game over conditions
            if (dailyChallenge) {
                const isEnd = isEndPage(pageTitle, dailyChallenge.endPage);

                // Check redirects
                const redirects = page.redirects || [];
                const isRedirectEnd = redirects.some((redirect: any) =>
                    isEndPage(formatPageTitle(redirect.to), dailyChallenge.endPage)
                );

                if (isEnd || isRedirectEnd) {
                    handleGameOver();
                }
            }

        } catch (error) {
            console.error('Error fetching Wikipedia content:', error);
        } finally {
            setIsLoading(false);
            setIsFirstLoad(false);
            if (initialLoadRef.current) {
                initialLoadRef.current = false;
            }
        }
    }, [isMobile, dailyChallenge]);

    const handleLinkClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (isGameOver) return;

        const target = e.target as HTMLElement;
        const link = target.closest('a');
        if (link) {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href && href.startsWith('/wiki/')) {
                const title = decodeURIComponent(href.split('/wiki/')[1]);
                const formattedTitle = formatPageTitle(title);
                const newMoveCount = moveCount + 1;
                const newPath = [...path, formattedTitle];
                setMoveCount(newMoveCount);
                setPath(newPath);
                updateCurrentRecord({ moveCount: newMoveCount, time: elapsedTime, path: newPath });
                fetchWikiPage(title);
            } else if (href && (href.includes('action=edit') || href.includes('action=search'))) {
                setIsForcedEnd(true);
                setForcedEndReason('검색 또는 편집 기능 사용이 감지되었습니다.');
            }
        }
    }, [isGameOver, fetchWikiPage, moveCount, path, elapsedTime, updateCurrentRecord]);

    const goBack = useCallback(() => {
        if (path.length <= 1) return;

        const newPath = [...path];
        newPath.pop();
        const previousPage = newPath[newPath.length - 1];

        const newMoveCount = moveCount + 1;
        setPath(newPath);
        setMoveCount(newMoveCount);
        updateCurrentRecord({ moveCount: newMoveCount, time: elapsedTime, path: newPath });
        fetchWikiPage(previousPage);
    }, [path, fetchWikiPage, moveCount, elapsedTime, updateCurrentRecord]);

    const handleGameOver = useCallback(async () => {
        const finalRecord = { moveCount: moveCount + 1, time: elapsedTime, path };
        updateCurrentRecord(finalRecord);
        finalizeRecord();

        const generateUniqueId = () => {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        };

        const userId = generateUniqueId();

        const myRanking: MyRanking = {
            userId,
            nickname,
            moveCount: finalRecord.moveCount,
            time: finalRecord.time,
            path: finalRecord.path
        };

        console.log("MyRanking:", myRanking);

        await submitRanking(myRanking);
        setIsGameOver(true);
    }, [nickname, moveCount, elapsedTime, path, updateCurrentRecord, finalizeRecord]);

    const resetGame = useCallback(() => {
        setPath([]);
        setMoveCount(0);
        setIsGameOver(false);
        resetCurrentRecord();
        // Additional reset logic if needed
    }, [resetCurrentRecord]);

    return {
        currentPage,
        isLoading,
        isFirstLoad,
        path,
        targetPage,
        isGameOver,
        setIsGameOver,
        moveCount,
        setMoveCount,
        fetchWikiPage,
        handleLinkClick,
        setPath,
        isMobile,
        isForcedEnd,
        forcedEndReason,
        goBack,
        dailyChallenge,
        nickname,
        bestRecord,
        currentRecord,
        handleGameOver,
        resetGame
    };
};