"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchRankings } from '@/lib/gameData';
import { Loader2 } from 'lucide-react';

const RankingPage: React.FC = () => {
    const [rankingData, setRankingData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('firstToFinish');

    const loadRankings = useCallback(async (sortBy: string) => {
        setLoading(true);
        try {
            const rankings = await fetchRankings(sortBy);
            setRankingData(rankings);
        } catch (error) {
            console.error("Failed to fetch rankings:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRankings(tab);
    }, [tab, loadRankings]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (timestamp: any) => {
        const date = timestamp.toDate();
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        // return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-[100vh] bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-center">
            <Card className="w-full max-w-4xl h-full p-4 mx-auto bg-white text-gray-800 flex flex-col">
                <CardHeader className="flex-shrink-0">
                    <CardTitle className="text-3xl font-bold text-center">랭킹</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col w-full px-0">
                    <Tabs defaultValue={tab} onValueChange={setTab} className="flex-grow flex flex-col w-full">
                        <TabsList className="grid w-full grid-cols-3 flex-shrink-0 border-b border-gray-200">
                            <TabsTrigger value="firstToFinish" className="flex-1 text-center">최초 완료</TabsTrigger>
                            <TabsTrigger value="fastest" className="flex-1 text-center border-r border-gray-200">가장 빠름</TabsTrigger>
                            <TabsTrigger value="leastClicks" className="flex-1 text-center border-r border-gray-200">최소 클릭</TabsTrigger>
                        </TabsList>
                        <TabsContent value={tab} className="flex-grow flex flex-col">
                            {loading ? (
                                <div className="flex-grow flex justify-center items-center">
                                    <Loader2 className="animate-spin w-8 h-8" />
                                </div>
                            ) : rankingData.length === 0 ? (
                                <div className="flex-grow flex justify-center items-center">
                                    <p className="text-center py-12">아직 아무도 플레이를 완료하지 않았습니다!</p>
                                </div>
                            ) : (
                                <Table className="flex-grow">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>순위</TableHead>
                                            <TableHead>플레이어</TableHead>
                                            <TableHead>시간</TableHead>
                                            <TableHead>이동 횟수</TableHead>
                                            <TableHead>기록된 시간</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rankingData.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell>{item.nickname}</TableCell>
                                                <TableCell>{formatTime(item.time)}</TableCell>
                                                <TableCell>{item.moveCount}</TableCell>
                                                <TableCell>{formatDate(item.timestamp)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </TabsContent>
                    </Tabs>
                    <div className="mt-6 text-center flex-shrink-0">
                        <Link href="/">
                            <Button>메인으로 돌아가기</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default RankingPage;
