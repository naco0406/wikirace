"use client";

import { Loader2, MoveDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocalRecordDev } from '../hooks/useLocalRecordDev';
import { DailyChallenge, fetchChallenge } from '../utils/gameDataDev';
import { useChallengeTimer } from '../hooks/useChallengeTimer';

interface DEV_LoadingProps {
    challengeId: string;
}

export const DEV_Loading: React.FC<DEV_LoadingProps> = ({ challengeId }) => {
    const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
    const { formattedTime, startTimer } = useChallengeTimer(challengeId);

    useEffect(() => {
        startTimer();
    }, [startTimer]);
    const { setHasStarted } = useLocalRecordDev(challengeId);

    useEffect(() => {
        const loadChallenge = async () => {
            const loadedChallenge = await fetchChallenge(challengeId);
            setChallenge(loadedChallenge);
        };
        loadChallenge();
        setHasStarted(true);
    }, [challengeId, setHasStarted]);

    return (
        <div className="min-h-screen w-full flex flex-row items-center justify-center bg-[#F3F7FF] overflow-hidden bg-red">
            <div className='w-full h-full flex flex-col items-center justify-center box-border'>
                <h1 className="pt-[24px] font-['Rhodium_Libre'] text-[#3366CC] text-8xl font-[400]">Linkle</h1>
                <Loader2 className="w-[48px] h-[48px] animate-spin mt-[40px] mb-[40px] text-[#3366CC]" />
                <div className="flex flex-col min-h-[120px] items-center justify-center">
                    {challenge ? (
                        <>
                            <p className="mb-[15px]">출발 문서 : <span className="font-[600] text-[#3366CC]">{challenge.startPage}</span></p>
                            <MoveDown />
                            <p className="mt-[15px]">도착 문서 : <span className="font-[600] text-[#3366CC]">{challenge.endPage}</span></p>
                        </>
                    ) : (
                        <p className="font-[400] text-24 leading-28 mb-[80px]">게임을 로딩 중입니다</p>
                    )}
                </div>
            </div>
        </div>
    );
};