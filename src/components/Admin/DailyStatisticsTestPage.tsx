import React, { useState, Fragment } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, Send, Calendar } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { DailyStatistics, getDailyStatistics } from '@/lib/firebaseConfig';
import { PathAdmin } from '../PathRecord';

const DailyStatisticsTestPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<DailyStatistics | null>(null);
    const [error, setError] = useState<string>('');
    const [date, setDate] = useState<string>('');

    const handleApiCall = async () => {
        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            const statistics = await getDailyStatistics(date);
            if (statistics) {
                setResult(statistics);
            } else {
                await fetchAndProcessData();
            }
        } catch (error) {
            console.error('데이터 처리 중 오류 발생:', error);
            setError('통계 데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAndProcessData = async () => {
        try {
            const response = await fetch('https://dev.naco.kr/api/scheduler/analyze-date', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date }),
            });

            if (!response.ok) {
                throw new Error('API 호출 실패');
            }

            // Wait for 1 second to allow time for data processing
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Try to get the data from Firebase again
            const updatedStatistics = await getDailyStatistics(date);
            if (updatedStatistics) {
                setResult(updatedStatistics);
            } else {
                setError('해당 날짜의 통계 데이터를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('API 호출 중 오류 발생:', error);
            setError('통계 데이터를 불러오는 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-7xl">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">일일 통계 분석</CardTitle>
                    <CardDescription>
                        특정 날짜의 통계를 분석하고 결과를 확인하세요.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-2 mb-4">
                        <div className="relative flex-grow">
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => { setDate(e.target.value); setResult(null); setError(''); }}
                                className="pl-10"
                            />
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                        <Button onClick={handleApiCall} disabled={isLoading || !date}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    분석 중...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" /> 분석 실행
                                </>
                            )}
                        </Button>
                    </div>

                    {isLoading && (
                        <Alert className="mb-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <AlertTitle>처리 중</AlertTitle>
                            <AlertDescription>
                                데이터를 분석하고 있습니다. 잠시만 기다려주세요...
                            </AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>오류</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {result && (
                        <div className="mt-6">
                            <Alert className="mb-4 border-[#10b981]">
                                <CheckCircle2 className="h-4 w-4" color="#10b981" />
                                <AlertTitle>분석 완료</AlertTitle>
                                <AlertDescription>
                                    {date} 날짜의 통계 분석이 완료되었습니다.
                                </AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm font-medium">총 사용자 수</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xl font-[600]">{result.totalCount}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm font-medium">시작 페이지</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="font-[600] text-[#3366CC]">{result.startPage}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm font-medium">도착 페이지</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="font-[600] text-[#3366CC]">{result.endPage}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="mb-4">
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">최단 경로</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm mb-1"><strong>사용자 ID:</strong> {result.shortestPath.userId}</p>
                                    <p className="text-sm mb-2"><strong>이동 횟수:</strong> {result.shortestPath.moveCount}</p>
                                    {result.shortestPath.path[result.shortestPath.path.length - 1] === result.endPage ? (
                                        <PathAdmin path={result.shortestPath.path} />
                                    ) : (
                                        <PathAdmin path={[...result.shortestPath.path, result.endPage]} />
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">최단 시간</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm mb-1"><strong>사용자 ID:</strong> {result.fastestTime.userId}</p>
                                    <p className="text-sm"><strong>소요 시간:</strong> {result.fastestTime.time} 초</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DailyStatisticsTestPage;