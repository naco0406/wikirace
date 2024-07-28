"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock, Move, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

interface HistoryRecord {
    fastestTime: { minutes: number; seconds: number };
    leastMoves: number;
    leastMovesPath: string[];
}

const YesterdayScreen: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    // 이 부분은 실제 데이터를 가져오는 로직으로 대체해야 합니다.
    const yesterdayRecord: HistoryRecord = {
        fastestTime: { minutes: 5, seconds: 30 },
        leastMoves: 12,
        leastMovesPath: ['시작 페이지', '중간 페이지 1', '중간 페이지 2', '목표 페이지']
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white text-gray-800 shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100 p-6">
                    <CardTitle className="text-2xl font-bold text-center text-gray-800">
                        <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                        어제의 기록
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                        <RecordItem
                            icon={<Clock className="w-8 h-8 text-blue-500" />}
                            title="가장 빠른 클리어 시간"
                            value={`${yesterdayRecord.fastestTime.minutes}분 ${yesterdayRecord.fastestTime.seconds}초`}
                        />
                        <div className="bg-gray-50 px-4 pt-4 rounded-lg cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <Move className="w-8 h-8 text-green-500" />
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">최소 이동 횟수</h3>
                                        <p className="text-lg font-bold text-gray-800">{`${yesterdayRecord.leastMoves}번`}</p>
                                    </div>
                                </div>
                                {isExpanded ? <ChevronUp className="w-6 h-6 text-gray-500" /> : <ChevronDown className="w-6 h-6 text-gray-500" />}
                            </div>
                            <div className={`mt-4 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 pb-4 ' : 'max-h-0'}`}>
                                <h4 className="font-semibold mb-2">이동 경로:</h4>
                                <ol className="list-decimal list-inside space-y-1">
                                    {yesterdayRecord.leastMovesPath.map((page, index) => (
                                        <li key={index} className="text-gray-700">{page}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                        <span className='text-sm'>베타 기능입니다</span>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-6 text-center flex-shrink-0">
                <Link href="/">
                    <Button variant="ghost" className='text-white text-md'>메인으로 돌아가기</Button>
                </Link>
            </div>
        </div>
    );
};

interface RecordItemProps {
    icon: React.ReactNode;
    title: string;
    value: string;
}

const RecordItem: React.FC<RecordItemProps> = ({ icon, title, value }) => (
    <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex-shrink-0">{icon}</div>
        <div>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-lg font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

export default YesterdayScreen;