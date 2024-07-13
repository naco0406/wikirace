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
    const { bestRecord, updateRecord } = useLocalRecord();
    const { elapsedTime } = useTimer();

    const moveCountRef = useRef(moveCount);
    const timerRef = useRef(elapsedTime);
    const pathRef = useRef(path);

    useEffect(() => {
        moveCountRef.current = moveCount;
        timerRef.current = elapsedTime;
        pathRef.current = path;
    }, [moveCount, elapsedTime, path]);

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

    const formatPageTitle = (title: string) => {
        return title.replace(/_/g, ' ');
    };

    const fetchWikiPage = useCallback(async (title: string) => {
        setIsLoading(true);
        if (dailyChallenge && title === dailyChallenge.endPage) {
            handleGameOver();
        }
        setTargetPage(formatPageTitle(title));
        const apiUrl = 'https://ko.wikipedia.org/w/api.php';
        const params = {
            action: 'parse',
            format: 'json',
            page: title,
            prop: 'text|info',
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

            const formattedTitle = formatPageTitle(page.title);
            setCurrentPage({
                title: formattedTitle,
                html: html,
                fullurl: page.fullurl
            });

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
                setMoveCount((prevCount) => prevCount + 1);
                setPath(prevPath => [...prevPath, formattedTitle]);
                fetchWikiPage(title);
            } else if (href && (href.includes('action=edit') || href.includes('action=search'))) {
                setIsForcedEnd(true);
                setForcedEndReason('검색 또는 편집 기능 사용이 감지되었습니다.');
            }
        }
    }, [isGameOver, fetchWikiPage]);

    const goBack = useCallback(() => {
        if (path.length <= 1) return;

        const newPath = [...path];
        newPath.pop();
        const previousPage = newPath[newPath.length - 1];

        setPath(newPath);
        setMoveCount(prevCount => prevCount + 1);
        fetchWikiPage(previousPage);
    }, [path, fetchWikiPage]);

    const handleGameOver = useCallback(async () => {
        const newRecord = { moveCount: moveCountRef.current + 1, time: timerRef.current };
        updateRecord(newRecord);

        const generateUniqueId = () => {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        };

        const userId = generateUniqueId();

        const myRanking: MyRanking = {
            userId,
            nickname,
            moveCount: moveCountRef.current,
            time: timerRef.current,
            path: pathRef.current
        };

        console.log("MyRanking:", myRanking);

        await submitRanking(myRanking);
        setIsGameOver(true);
    }, [nickname, updateRecord]);

    return {
        currentPage,
        isLoading,
        isFirstLoad,
        path,
        targetPage,
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
        nickname,
        bestRecord,
        handleGameOver
    };
};