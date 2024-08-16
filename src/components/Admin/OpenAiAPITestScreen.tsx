"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { openInNewTab } from '@/lib/utils';
import { OpenAIService, OpenAIServiceResult } from "@/service/OpenAI/OpenAIService";
import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, Loader2, Send, Terminal, XCircle, RefreshCw, PanelRightOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useCallback, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { useRandomWikipediaTitle } from '@/hooks/useRandomWikipedia';
import { cn } from "@/lib/utils";
import { PathAdmin } from "../PathRecord";
import { ResultItem } from "./ResponseItem";
import { OpenAIResponse } from "@/service/OpenAI/utils";

interface RandomTitle {
    title: string;
    isLoading: boolean;
    isLoaded: boolean;
}

const OpenAiAPITestScreen: React.FC = () => {
    const router = useRouter();
    const openAIService = new OpenAIService();
    const { refetch: fetchRandomTitle } = useRandomWikipediaTitle();

    const [result, setResult] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [fullResponse, setFullResponse] = useState<string>('');
    const [detailedResults, setDetailedResults] = useState<OpenAIResponse[]>([]);
    const [attempts, setAttempts] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [pageTitles, setPageTitles] = useState<string>("");
    const [randomTitleCount, setRandomTitleCount] = useState<number>(1);
    const [randomTitles, setRandomTitles] = useState<RandomTitle[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleInputChange = (value: string) => {
        setPageTitles(value);
    };

    const handleApiCall = async () => {
        setIsLoading(true);
        setError('');
        setResult('');
        setFullResponse('');
        setAttempts(0);
        setDetailedResults([]);
        try {
            const response: OpenAIServiceResult = await openAIService.GET_result_for_share(pageTitles.split(',').map(title => title.trim()));
            setResult(response.result);
            setAttempts(response.attempts);
            if (response.error) {
                setError(response.error);
                if (response.fullResponse) {
                    setFullResponse(response.fullResponse);
                }
            }
            setDetailedResults(response.detailedResults);
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

    const generateRandomTitles = useCallback(() => {
        setRandomTitles(Array(randomTitleCount).fill({ title: '', isLoading: true, isLoaded: false }));
    }, [randomTitleCount]);

    useEffect(() => {
        const fetchTitles = async () => {
            const promises = randomTitles.map(async (title, index) => {
                if (!title.isLoaded && title.isLoading) {
                    try {
                        const newTitle = await fetchRandomTitle();
                        return { title: newTitle || '', isLoading: false, isLoaded: true };
                    } catch (error) {
                        console.error('Failed to fetch random title:', error);
                        return { ...title, isLoading: false, isLoaded: true };
                    }
                }
                return title;
            });

            const updatedTitles = await Promise.all(promises);
            setRandomTitles(updatedTitles);
        };

        fetchTitles();
    }, [randomTitles.length, fetchRandomTitle]);

    const handleRandomTitle = async (index: number) => {
        setRandomTitles(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], isLoading: true, isLoaded: false };
            return updated;
        });

        try {
            const newTitle = await fetchRandomTitle();
            setRandomTitles(prev => {
                const updated = [...prev];
                updated[index] = { title: newTitle || '', isLoading: false, isLoaded: true };
                return updated;
            });
        } catch (error) {
            console.error('Failed to fetch random title:', error);
            setRandomTitles(prev => {
                const updated = [...prev];
                updated[index] = { ...prev[index], isLoading: false, isLoaded: true };
                return updated;
            });
        }
    };

    const applyRandomTitles = () => {
        setPageTitles(randomTitles.map(item => item.title).join(', '));
        setIsDrawerOpen(false);
    };

    const handleTitleChange = (index: number, newTitle: string) => {
        setRandomTitles(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], title: newTitle };
            return updated;
        });
    };

    return (
        <div className="container mx-auto p-4 max-w-7xl relative">
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
                        <div className="flex space-x-2 mb-4">
                            <Input
                                placeholder="페이지 제목들 (쉼표로 구분)"
                                value={pageTitles}
                                onChange={(e) => handleInputChange(e.target.value)}
                                className="flex-grow"
                            />
                            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                                <DrawerTrigger asChild>
                                    <Button variant="outline">
                                        <PanelRightOpen className="mr-2 h-4 w-4" />
                                        랜덤 제목
                                    </Button>
                                </DrawerTrigger>
                                <DrawerContent className="w-[488px] right-0 left-auto rounded-xl">
                                    <DrawerHeader>
                                        <DrawerTitle>위키피디아 제목 생성</DrawerTitle>
                                    </DrawerHeader>
                                    <div className="pb-4 px-4">
                                        <div className="flex items-center space-x-2 mb-4">
                                            <Input
                                                type="number"
                                                placeholder="생성 제목 개수"
                                                value={randomTitleCount}
                                                onChange={(e) => setRandomTitleCount(Number(e.target.value))}
                                                min={1}
                                            />
                                            <Button onClick={generateRandomTitles}>생성</Button>
                                        </div>
                                        <Separator className="my-4" />
                                        <ScrollArea className="h-[300px]">
                                            {randomTitles.map((item, index) => (
                                                <div key={index} className="flex items-center space-x-2 mb-2">
                                                    <Input
                                                        value={item.title}
                                                        onChange={(e) => handleTitleChange(index, e.target.value)}
                                                        className={cn(item.isLoading && "opacity-50")}
                                                        disabled={item.isLoading}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRandomTitle(index)}
                                                        disabled={item.isLoading}
                                                    >
                                                        <RefreshCw className={cn("h-4 w-4", item.isLoading && "animate-spin")} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </ScrollArea>
                                    </div>
                                    <DrawerFooter>
                                        <DrawerClose asChild>
                                            <Button onClick={applyRandomTitles}>적용</Button>
                                        </DrawerClose>
                                    </DrawerFooter>
                                </DrawerContent>
                            </Drawer>
                        </div>
                        <Alert>
                            <Terminal className="h-4 w-4" />
                            <AlertDescription>
                                <p className="text-sm font-medium mb-2">OpenAI API 모델 : <span className="text-black font-bold">GPT-4o-mini</span></p>
                                <Separator className="my-2" />
                                <p className="text-sm font-medium mb-2">경로 :</p>
                                <PathAdmin path={pageTitles.split(',').map(title => title.trim())} />
                                {/* <p className="text-sm font-mono bg-gray-100 p-2 rounded">{JSON.stringify(pageTitles.split(',').map(title => title.trim()))}</p> */}
                            </AlertDescription>
                        </Alert>
                        <Button onClick={handleApiCall} className="w-full mt-4" disabled={isLoading || pageTitles.split(',').length < 2}>
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
                    <ScrollArea className={`w-full rounded-md  ${!result && !error && !fullResponse && !attempts ? 'border h-8' : 'border-transparent'}`}>
                        {result && (
                            <Alert className="mb-4 border-[#10b981]">
                                <CheckCircle2 className="h-4 w-4" color="#10b981" />
                                <AlertTitle>성공</AlertTitle>
                                <AlertDescription>
                                    <div className="text-lg pt-2">
                                        {detailedResults.slice(0, -1).map((item, index) => (
                                            <ResultItem key={index} item={item} />
                                        ))}
                                        🏁
                                    </div>
                                    {/* <Separator className="my-2" />
                                    <p className="text-sm mt-2">전체 결과: {result}</p> */}
                                </AlertDescription>
                            </Alert>
                        )}
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <XCircle className="h-4 w-4" />
                                <AlertTitle>에러 발생</AlertTitle>
                                <AlertDescription>
                                    <pre className="whitespace-pre-wrap text-sm">{error}</pre>
                                </AlertDescription>
                            </Alert>
                        )}
                        {fullResponse && (
                            <Alert className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>전체 응답</AlertTitle>
                                <AlertDescription>
                                    <pre className="whitespace-pre-wrap text-sm">{fullResponse}</pre>
                                </AlertDescription>
                            </Alert>
                        )}
                        {attempts > 0 && (
                            <div className="bg-blue-100 text-blue-800 p-3 rounded-md flex items-center">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                <p className="text-sm font-semibold">시도 횟수: {attempts}</p>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default OpenAiAPITestScreen;