"use client";

import { useNickname } from '@/hooks/useNickname';
import { useScreenSize } from '@/hooks/useScreenSize';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalRecordDev } from './useLocalRecordDev';
import { DailyChallenge, MyRanking, fetchChallenge, submitRanking } from '../utils/gameDataDev';
import { useChallengeTimer } from './useChallengeTimer';

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

export const useWikipediaDev = (challengeId: string, elapsedTime: number) => {
    const [currentPage, setCurrentPage] = useState<WikiPageContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
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
    const [challenge, setChallenge] = useState<DailyChallenge | null>(null);

    const { isMobile } = useScreenSize();
    const nickname = useNickname();
    const { localRecord, localFullRecord, localSingleRecord, updateLocalRecord, updateLocalSingleRecord, updateLocalFullRecord, finalizeRecord, resetLocalData } = useLocalRecordDev(challengeId);

    useEffect(() => {
        if (initialPlatformRef.current === null) {
            initialPlatformRef.current = isMobile ? 'mobile' : 'desktop';
        } else if (!initialLoadRef.current) {
            const currentPlatform = isMobile ? 'mobile' : 'desktop';
            // Platform change detection logic here if needed
        }
    }, [isMobile]);

    useEffect(() => {
        const loadChallenge = async () => {
            const loadedChallenge = await fetchChallenge(challengeId);
            if (loadedChallenge) {
                setChallenge(loadedChallenge);
                resetLocalData(challengeId);
            }
        };
        loadChallenge();
    }, [challengeId]);

    useEffect(() => {
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
    }, [localRecord, localFullRecord, localSingleRecord]);

    const isEndPage = useCallback((currentTitle: string, endTitle: string) => {
        if (currentTitle === endTitle) return true;

        const normalizedCurrent = normalizePageTitle(currentTitle);
        const normalizedEnd = normalizePageTitle(endTitle);
        if (normalizedCurrent === normalizedEnd) return true;

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

            sectionIndexesToRemove.sort((a: number, b: number) => a - b);

            for (let index of sectionIndexesToRemove) {
                const currentSection = sections.find(s => parseInt(s.index) === index);
                if (!currentSection) {
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
                }
            }

            html = html.replace(/<div id="mw-navigation">.*?<\/div>\s*<div id="footer" role="contentinfo">/gs, '<div id="footer" role="contentinfo">');
            html = html.replace(/<div class="mw-references-wrap.*?<\/div>/gs, '');
            html = html.replace(/<span class="mw-editsection.*?<\/span>/g, '');
            html = html.replace(/<div class="dablink.*?<\/div>/g, '');
            html = html.replace(/<audio.*?<\/audio>/g, '');
            html = html.replace(/<div\s+(?:[^>]*\s+)?class="(?:[^"]*\s+)?hatnote(?:\s+[^"]*)?"\s*.*?<\/div>/gs, '');
            html = html.replace(/<div\s+(?:[^>]*\s+)?class="(?:[^"]*\s+)?navbox(?:\s+[^"]*)?"[^>]*>[\s\S]*?<\/div>\s*(?:<\/?div[^>]*>\s*)*(?=<div|$)/g, '');

            const pageTitle = formatPageTitle(page.title);
            setCurrentPage({
                title: pageTitle,
                html: html,
                fullurl: page.fullurl
            });

            if (challenge) {
                const isEnd = isEndPage(pageTitle, challenge.endPage);

                const redirects = page.redirects || [];
                const isRedirectEnd = redirects.some((redirect: any) =>
                    isEndPage(formatPageTitle(redirect.to), challenge.endPage)
                );

                if (isEnd || isRedirectEnd) {
                    setIsGameOver(true)
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
    }, [challenge, isEndPage]);

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

                // 링크 클릭 즉시 게임 클리어 조건 확인 및 마지막 경로 마스킹
                if (challenge && isEndPage(formattedTitle, challenge.endPage)) {
                    // 새로운 경로 생성
                    const newPath = [...path, challenge.endPage];
                    const newFullPath = [...fullPath, challenge.endPage];
                    const newSinglePath = [...singlePath, challenge.endPage];

                    // 상태 업데이트
                    setMoveCount(newMoveCount);
                    setPath(newPath);
                    setFullPath(newFullPath);
                    setSinglePath(newSinglePath);

                    // 로컬 레코드 업데이트
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
                    
                    setIsGameOver(true)
                    return;
                }

                const newPath = [...path, formattedTitle];
                const newFullPath = [...fullPath, formattedTitle];
                const newSinglePath = [...singlePath, formattedTitle];

                setMoveCount(newMoveCount);
                setPath(newPath);
                setFullPath(newFullPath);
                setSinglePath(newSinglePath);

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

                fetchWikiPage(title);
            }
        }
    }, [isGameOver, fetchWikiPage, moveCount, path, fullPath, singlePath, elapsedTime, updateLocalRecord, updateLocalFullRecord, updateLocalSingleRecord]);

    const goBack = useCallback(() => {
        if (!singlePath[singlePath.length - 2]) return;

        const previousPage = singlePath[singlePath.length - 2];
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

    useEffect(() => {
        if (isGameOver) {
            const submitRankingAsync = async () => {
                const finalRecord = { moveCount: moveCount, time: elapsedTime, path };
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

                await submitRanking(challengeId, myRanking);
                setIsGameOver(true);
            };
            submitRankingAsync();
        }
    }, [isGameOver, moveCount, path, nickname, challengeId]);

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
        challenge,
    };
};

export const formatPageTitle = (title: string) => {
    return title.replace(/_/g, ' ');
};

export const normalizePageTitle = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, ' ').trim();
};