"use client"

import { calculateLinkleDayNumber } from "@/assets/constants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyStatistics, getDailyStatistics } from '@/lib/firebaseConfig';
import { addMinutes, isAfter, isBefore, setHours, setMinutes } from "date-fns";
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { PathResult } from '../PathRecord';
import { formatTimeInKor } from '../Success/Screen';

const YesterdayStatistics: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [statistics, setStatistics] = useState<DailyStatistics | null>(null);
    const [isDataProcessing, setIsDataProcessing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkTimeAndSetup = () => {
            const now = new Date();
            const midnight = setMinutes(setHours(now, 0), 0);
            const oneMinuteAfterMidnight = addMinutes(midnight, 1);

            if (isAfter(now, midnight) && isBefore(now, oneMinuteAfterMidnight)) {
                setIsDataProcessing(true);
                setIsLoading(false);

                const intervalId = setInterval(() => {
                    const currentTime = new Date();
                    if (isAfter(currentTime, oneMinuteAfterMidnight)) {
                        clearInterval(intervalId);
                        fetchYesterdayStatistics();
                    }
                }, 1000); // 1초마다 체크

                return () => clearInterval(intervalId);
            } else {
                fetchYesterdayStatistics();
            }
        };

        const fetchYesterdayStatistics = async () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const formattedDate = yesterday.toISOString().split('T')[0];

            try {
                setIsLoading(true);
                const data = await getDailyStatistics(formattedDate);
                setStatistics(data);
            } catch (error) {
                console.error('Error fetching yesterday\'s statistics:', error);
            } finally {
                setIsLoading(false);
                setIsDataProcessing(false);
            }
        };

        checkTimeAndSetup();
    }, []);

    const linkleCount = calculateLinkleDayNumber();

    const handleBack = () => {
        router.push('/');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F3F7FF]">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="mt-4">통계를 불러오는 중...</p>
            </div>
        );
    }

    if (isDataProcessing) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F3F7FF]">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex flex-row text-2xl font-semibold text-center justify-center">
                            <div className="flex flex-row text-center mr-2">어제의 기록</div>
                            <p className="font-['Rhodium_Libre'] text-[#3366CC] text-sm">#{linkleCount - 1}</p>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                        <p className="text-center">아직 어제의 데이터를 분석하고 있습니다</p>
                        <Button onClick={handleBack} className="w-full mt-6">
                            <ArrowLeft className="mr-2 h-4 w-4" /> 메인으로 돌아가기
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!statistics) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F3F7FF]">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex flex-row text-2xl font-semibold text-center justify-center">
                            <div className="flex flex-row text-center mr-2">어제의 기록</div>
                            <p className="font-['Rhodium_Libre'] text-[#3366CC] text-sm">#{linkleCount - 1}</p>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert>
                            <Calendar className="h-4 w-4" />
                            <AlertTitle>어제의 통계를 찾을 수 없습니다</AlertTitle>
                            <AlertDescription className="mt-2">
                                아직 어제의 통계 데이터가 생성되지 않았거나, 문제가 발생했을 수 있습니다.
                            </AlertDescription>
                        </Alert>
                        <Button onClick={handleBack} className="w-full mt-6">
                            <ArrowLeft className="mr-2 h-4 w-4" /> 메인으로 돌아가기
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F3F7FF] p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex flex-row text-2xl font-semibold text-center justify-center">
                        <div className="flex flex-row text-center mr-2">어제의 기록</div>
                        <p className="font-['Rhodium_Libre'] text-[#3366CC] text-sm">#{linkleCount - 1}</p>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center">
                                    {/* <Users className="mr-2 h-4 w-4" /> */}
                                    총 참여자
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xl font-bold">{statistics.totalCount}</p>
                            </CardContent>
                        </Card>
                        {/* <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center">
                                    <Flag className="mr-2 h-4 w-4" />
                                    목표
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">{statistics.startPage}</p>
                                    <ArrowRight className="h-4 w-4 mx-2" />
                                    <p className="text-sm font-medium">{statistics.endPage}</p>
                                </div>
                            </CardContent>
                        </Card> */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center">
                                    시작 페이지
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-[600]">{statistics.startPage}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center">
                                    도착 페이지
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-[600]">{statistics.endPage}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-md font-semibold flex items-center">
                                {/* <Move className="mr-2 h-5 w-5" /> */}
                                {/* 최단 경로 ({statistics.shortestPath.moveCount} 단계) */}
                                최단 경로
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PathResult path={[...statistics.shortestPath.path, statistics.endPage]} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-md font-semibold flex items-center">
                                {/* <Clock className="mr-2 h-5 w-5" /> */}
                                최단 시간
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-md font-bold">
                                {formatTimeInKor(statistics.fastestTime.time)}
                            </p>
                        </CardContent>
                    </Card>

                    <Button onClick={handleBack} variant="ghost" className="w-full mt-6">
                        <ArrowLeft className="mr-2 h-4 w-4" /> 메인으로 돌아가기
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default YesterdayStatistics;