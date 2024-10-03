"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle2, XCircle, Send } from 'lucide-react';

const DailyStatisticsTestPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleApiCall = async () => {
        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch('https://dev.naco.kr/api/scheduler/run-daily-statistics', {
                method: 'POST',
            });
            const data = await response.json();
            if (response.ok) {
                setResult(data);
            } else {
                throw new Error(data.error || 'API 호출 실패');
            }
        } catch (error) {
            console.error('API 호출 실패:', error);
            setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-2 max-w-7xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">일일 통계 API 테스트</CardTitle>
                    <CardDescription>
                        일일 통계 분석을 실행하고 결과를 확인하세요.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleApiCall} className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                분석 실행 중...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" /> 일일 통계 실행
                            </>
                        )}
                    </Button>

                    <ScrollArea className="w-full mt-4 rounded-md border h-[300px]">
                        {result && (
                            <Alert className="mb-4 border-[#10b981]">
                                <CheckCircle2 className="h-4 w-4" color="#10b981" />
                                <AlertTitle>성공</AlertTitle>
                                <AlertDescription>
                                    <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
                                </AlertDescription>
                            </Alert>
                        )}
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <XCircle className="h-4 w-4" />
                                <AlertTitle>오류</AlertTitle>
                                <AlertDescription>
                                    <pre className="whitespace-pre-wrap text-sm">{error}</pre>
                                </AlertDescription>
                            </Alert>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default DailyStatisticsTestPage;