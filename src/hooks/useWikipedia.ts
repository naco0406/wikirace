"use client";

import { useTimer } from '@/contexts/TimerContext';
import { DailyChallenge, MyRanking, fetchDailyChallenge, fetchRank, submitRanking } from '@/lib/gameData';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalRecord } from './useLocalRecord';
import { useNickname } from './useNickname';
import { useScreenSize } from './useScreenSize';

interface WikiPageContent {
    title: string;
    html: string;
    fullurl: string;
}

interface Section {
    index: string;
    level: string;
    line: string;
    number: string;
    anchor: string;
    toclevel: number;
}

export const useWikipedia = () => {
    const [currentPage, setCurrentPage] = useState<WikiPageContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [isGameEnding, setIsGameEnding] = useState(false);
    const [path, setPath] = useState<string[]>([]);
    const [fullPath, setFullPath] = useState<string[]>([]);
    const [singlePath, setSinglePath] = useState<string[]>([]);
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
    const { localRecord, localFullRecord, localSingleRecord, updateLocalRecord, updateLocalSingleRecord, updateLocalFullRecord, finalizeRecord, setHasClearedToday } = useLocalRecord();
    const { elapsedTime } = useTimer();

    const updateGameState = async (formattedTitle: string, newMoveCount: number) => {
        // 새로운 경로 생성
        const newPath = [...path, formattedTitle];
        const newFullPath = [...fullPath, formattedTitle];
        const newSinglePath = [...singlePath, formattedTitle];

        // 상태 업데이트
        setMoveCount(newMoveCount);
        setPath(newPath);
        setFullPath(newFullPath);
        setSinglePath(newSinglePath);

        // 로컬 레코드 업데이트
        await updateLocalRecord({
            moveCount: newMoveCount,
            time: elapsedTime,
            path: newPath
        });
        await updateLocalFullRecord({
            moveCount: newMoveCount,
            time: elapsedTime,
            path: newFullPath
        });
        await updateLocalSingleRecord({
            moveCount: newMoveCount,
            time: elapsedTime,
            path: newSinglePath
        });
    };

    useEffect(() => {
        if (initialPlatformRef.current === null) {
            initialPlatformRef.current = isMobile ? 'mobile' : 'desktop';
        } else if (!initialLoadRef.current) {
            const currentPlatform = isMobile ? 'mobile' : 'desktop';
            // if (currentPlatform !== initialPlatformRef.current) {
            //     setIsForcedEnd(true);
            //     setForcedEndReason('게임 진행 도중 플랫폼이 변경되었습니다. (모바일 ↔ PC)');
            // }
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
        const timeoutId = setTimeout(() => {
            if (localRecord.path.length > 0) {
                setPath(localRecord.path);
                setMoveCount(localRecord.moveCount);
                fetchWikiPage(localRecord.path[localRecord.path.length - 1]);
            }
            if (localFullRecord.path.length > 0) {
                setFullPath(localFullRecord.path);
            }
            if (localSingleRecord.path.length > 0) {
                setSinglePath(localSingleRecord.path);
            }
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [localRecord, localFullRecord, localSingleRecord]);

    const fetchWikiPage = useCallback(async (title: string) => {
        setIsLoading(true);
        const formattedTitle = formatPageTitle(title);
        setTargetPage(formattedTitle);
        const apiUrl = 'https://ko.wikipedia.org/w/api.php';
        const params = {
            action: 'parse',
            format: 'json',
            page: title,
            prop: 'text|displaytitle|sections|categories|links|templates|parsetree',
            disableeditsection: true,
            disabletoc: true,
            mobileformat: true,
            sectionpreview: false,
            redirects: 'true',
            useskin: 'minerva',
            origin: '*'
        };

        try {
            const response = await axios.get(apiUrl, { params });

            if (!response.data || !response.data.parse) {
                throw new Error('Invalid API response');
            }

            const page = response.data.parse;

            let html = page.text['*'];

            const sections: Section[] = page.sections || [];

            const sectionsToRemove = ['같이 보기', '각주', '외부 링크'];

            let sectionIndexesToRemove = sections
                .filter((section: Section) => sectionsToRemove.some(title => section.line.toLowerCase().includes(title.toLowerCase())))
                .map((section: Section) => parseInt(section.index));

            // Sort indexes in ascending order to remove from top to bottom
            sectionIndexesToRemove.sort((a: number, b: number) => a - b);

            for (let index of sectionIndexesToRemove) {
                const currentSection = sections.find(s => parseInt(s.index) === index);
                if (!currentSection) {
                    // console.log(`Section not found for index ${index}`);
                    continue;
                }

                const nextSection = sections.find(s => parseInt(s.index) > index);

                const startPattern = `<h${currentSection.level}[^>]*id="[^"]*${currentSection.anchor}[^"]*"[^>]*>`;
                const endPattern = nextSection
                    ? `<h${nextSection.level}[^>]*id="[^"]*${nextSection.anchor}[^"]*"`
                    : '<div id="mw-navigation">';

                const sectionRegex = new RegExp(`${startPattern}[\\s\\S]*?(?=${endPattern})`, 's');
                const sectionMatch = html.match(sectionRegex);

                if (sectionMatch) {
                    html = html.replace(sectionMatch[0], '');
                    // console.log(`Removed section: ${currentSection.line}`);
                } else {
                    // console.log(`Could not find matches for section: ${currentSection.line}`);
                }
            }

            // Remove navigation menu
            html = html.replace(/<div id="mw-navigation">.*?<\/div>\s*<div id="footer" role="contentinfo">/gs, '<div id="footer" role="contentinfo">');

            // html = html.replace(/<table class="infobox.*?<\/table>/gs, '');
            html = html.replace(/<div class="mw-references-wrap.*?<\/div>/gs, '');
            html = html.replace(/<span class="mw-editsection.*?<\/span>/g, '');
            html = html.replace(/<div class="dablink.*?<\/div>/g, '');
            html = html.replace(/<audio.*?<\/audio>/g, '');

            html = html.replace(/<div\s+(?:[^>]*\s+)?class="(?:[^"]*\s+)?hatnote(?:\s+[^"]*)?"\s*.*?<\/div>/gs, '');

            // Remove navbox completely
            html = html.replace(/<div\s+(?:[^>]*\s+)?class="(?:[^"]*\s+)?navbox(?:\s+[^"]*)?"[^>]*>[\s\S]*?<\/div>\s*(?:<\/?div[^>]*>\s*)*(?=<div|$)/g, '');

            const pageTitle = formatPageTitle(page.title);
            setCurrentPage({
                title: pageTitle,
                html: html,
                fullurl: page.fullurl
            });

            if (dailyChallenge && !setHasClearedToday) {
                const isEnd = isEndPage(pageTitle, dailyChallenge.endPage);

                const redirects = page.redirects || [];
                const isRedirectEnd = redirects.some((redirect: any) =>
                    isEndPage(formatPageTitle(redirect.to), dailyChallenge.endPage)
                );

                if (isEnd || isRedirectEnd) {
                    console.log('isEnd || isRedirectEnd');
                    await submitRankingAsync();
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
    }, [dailyChallenge]);

    const handleLinkClick = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
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

                if (dailyChallenge && isEndPage(formattedTitle, dailyChallenge.endPage)) {
                    setIsGameEnding(true);
                    console.log('setIsGameEnding(true)');
                    await updateGameState(formattedTitle, newMoveCount);
                    await submitRankingAsync();
                    setIsGameEnding(false);
                    return;
                }
                await updateGameState(formattedTitle, newMoveCount);
                fetchWikiPage(title);
            }
        }
    }, [isGameOver, fetchWikiPage, moveCount, path, fullPath, singlePath, elapsedTime, updateLocalRecord, updateLocalFullRecord, updateLocalSingleRecord]);

    const goBack = useCallback(() => {
        if (!singlePath[singlePath.length - 2]) return;

        const previousPage = singlePath[singlePath.length - 2]; // 이전 페이지
        const goBackText = '뒤로가기';

        const newPath = [...path, previousPage];
        const newFullPath = [...fullPath, goBackText];

        const newSinglePath = [...singlePath];
        newSinglePath.pop();

        const newMoveCount = moveCount + 1;

        setPath(newPath);
        setFullPath(newFullPath);
        setSinglePath(newSinglePath);
        setMoveCount(newMoveCount);

        updateLocalRecord({
            moveCount: newMoveCount,
            time: elapsedTime,
            path: newPath
        });
        updateLocalFullRecord({
            moveCount: newMoveCount,
            time: elapsedTime,
            path: newFullPath
        });
        updateLocalSingleRecord({
            moveCount: newMoveCount,
            time: elapsedTime,
            path: newSinglePath
        });

        fetchWikiPage(previousPage);
    }, [path, fullPath, singlePath, fetchWikiPage, moveCount, elapsedTime, updateLocalRecord, updateLocalFullRecord, updateLocalSingleRecord]);

    const submitRankingAsync = async () => {
        const finalRecord = { moveCount: moveCount, time: elapsedTime, path };

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

        await submitRanking(myRanking);
        const myRank = await fetchRank()
        finalizeRecord(myRank);

        setIsGameOver(true);
    };

    return {
        currentPage,
        isLoading,
        isFirstLoad,
        path,
        singlePath,
        targetPage,
        isGameOver,
        setIsGameOver,
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
        isGameEnding,
    };
};

export const formatPageTitle = (title: string) => {
    return title.replace(/_/g, ' ');
};

export const normalizePageTitle = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, ' ').trim();
};

export const isEndPage = (currentTitle: string, endTitle: string) => {
    if (currentTitle.trim() === endTitle.trim()) return true;

    const normalizedCurrent = normalizePageTitle(currentTitle);
    const normalizedEnd = normalizePageTitle(endTitle);
    if (normalizedCurrent.trim() === normalizedEnd.trim()) return true;

    const currentWithoutParentheses = normalizedCurrent.replace(/\s*\(.*?\)\s*/g, '');
    const endWithoutParentheses = normalizedEnd.replace(/\s*\(.*?\)\s*/g, '');
    if (currentWithoutParentheses.trim() === endWithoutParentheses.trim()) return true;

    return false;
};