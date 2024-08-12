"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { openInNewTab } from '@/lib/utils';
import { OpenAIService } from "@/service/OpenAI/OpenAIService";
import { ArrowLeft, ExternalLink, Loader2, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const OpenAiAPITestScreen: React.FC = () => {
    const router = useRouter();
    const openAIService = new OpenAIService();

    const [result, setResult] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [fullResponse, setFullResponse] = useState<string>('');
    const [attempts, setAttempts] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [pageTitles, setPageTitles] = useState<string[]>([""]);

    const handleInputChange = (value: string) => {
        setPageTitles(value.split(',').map(title => title.trim()));
    };

    const handleApiCall = async () => {
        setIsLoading(true);
        setError('');
        setResult('');
        setFullResponse('');
        setAttempts(0);
        try {
            const response = await openAIService.GET_result_for_share(pageTitles);
            setResult(response.result);
            setAttempts(response.attempts);
            if (response.error) {
                setError(response.error);
                if (response.fullResponse) {
                    setFullResponse(response.fullResponse);
                }
            }
        } catch (error) {
            console.error('API call failed:', error);
            setError(`Error: ${(error as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToHome = () => {
        router.push('/');
    };

    return (
        <div className="container mx-auto p-4 max-w-7xl">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-3xl font-bold">OpenAI API 테스트</CardTitle>
                        <div className="flex space-x-4">
                            <Button variant="outline" onClick={handleBackToHome}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> 메인
                            </Button>
                            <Button onClick={() => openInNewTab('https://platform.openai.com/usage')}>
                                OpenAI 사용량 <ExternalLink className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <CardDescription>
                        OpenAI API를 테스트하고 결과를 확인하세요.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div>
                        <h2 className="text-xl font-semibold mb-4">API 모델 설정</h2>
                        {/* <Select onValueChange={(value: string) => setSelectedModel(value)} defaultValue="gpt-4o-mini">
                            <SelectTrigger className="w-full mb-4">
                                <SelectValue placeholder="API 모델 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
                                <SelectItem value="gpt-3.5-turbo">GPT-3.5-turbo</SelectItem>
                            </SelectContent>
                        </Select> */}
                        <Input
                            placeholder="페이지 제목들 (쉼표로 구분)"
                            onChange={(e) => handleInputChange(e.target.value)}
                            className="mb-4"
                        />
                        <div className="bg-gray-100 p-4 rounded-md mb-4">
                            <p className="text-sm font-medium text-gray-500 mb-2">OpenAI API 모델 : <span className="text-black">GPT-4o-mini</span></p>
                            <Separator className="my-2" />
                            <p className="text-sm font-medium text-gray-500 mb-2">페이지 제목 배열:</p>
                            <p className="text-sm">{JSON.stringify(pageTitles)}</p>
                        </div>
                        <Button onClick={handleApiCall} className="w-full mt-4" disabled={isLoading || pageTitles.length < 2}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    로딩 중
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" /> API 호출
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
                <CardHeader>
                    <CardTitle>API 응답</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardContent>
                        <ScrollArea className="h-[200px] w-full rounded-md border">
                            {result && (
                                <div>
                                    <p className="font-semibold">결과:</p>
                                    <pre>{result}</pre>
                                </div>
                            )}
                            {error && (
                                <div className="text-red-500">
                                    <p className="font-semibold">에러:</p>
                                    <pre>{error}</pre>
                                </div>
                            )}
                            {fullResponse && (
                                <div className="mb-4">
                                    <p className="font-semibold">전체 응답:</p>
                                    <pre className="whitespace-pre-wrap">{fullResponse}</pre>
                                </div>
                            )}
                            {attempts > 0 && (
                                <div className="mt-2">
                                    <p className="font-semibold">시도 횟수: {attempts}</p>
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </CardContent>
            </Card>
        </div>
    );
};

export default OpenAiAPITestScreen;