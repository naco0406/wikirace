"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Loader2, RefreshCw } from 'lucide-react';
import { DailyChallenge, fetchAllChallenges, createChallenge } from '../utils/gameDataDev';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useRandomWikipediaTitle } from '@/hooks/useRandomWikipedia';
import { ScrollArea } from "@/components/ui/scroll-area";
import AutocompleteWikipediaInput from '@/components/AutocompleteWikipediaInput';

const DEV_ChallengeScreen: React.FC = () => {
    const [challenges, setChallenges] = useState<{ id: string; challenge: DailyChallenge }[]>([]);
    const [startPage, setStartPage] = useState('');
    const [endPage, setEndPage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAddingChallenge, setIsAddingChallenge] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isGeneratingRandom, setIsGeneratingRandom] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { refetch: refetchTitle } = useRandomWikipediaTitle();

    useEffect(() => {
        loadChallenges();
    }, []);

    const loadChallenges = async () => {
        setIsLoading(true);
        const allChallenges = await fetchAllChallenges();
        setChallenges(allChallenges);
        setIsLoading(false);
    };

    const handleBack = () => {
        router.push('/dev');
    };

    const handleChallengeSelect = (challengeId: string) => {
        localStorage.setItem('DEV_lastChallengeId', challengeId);
        router.push(`/dev/game/${challengeId}`);
    };

    const handleAddChallenge = async () => {
        if (startPage && endPage) {
            setIsAddingChallenge(true);
            const newChallenge: DailyChallenge = {
                startPage,
                endPage,
                totalCount: 0
            };
            try {
                await createChallenge(newChallenge);
                resetInputs();
                await loadChallenges();
                setIsDialogOpen(false);
                toast({
                    title: "챌린지 추가 성공",
                    description: "새로운 챌린지가 성공적으로 추가되었습니다.",
                });
            } catch (error) {
                console.error("Failed to add challenge:", error);
                toast({
                    title: "챌린지 추가 실패",
                    description: "챌린지 추가 중 오류가 발생했습니다. 다시 시도해주세요.",
                    variant: "destructive",
                });
            } finally {
                setIsAddingChallenge(false);
            }
        }
    };

    const handleGenerateRandom = async () => {
        setIsGeneratingRandom(true);
        try {
            const newStartPage = await refetchTitle();
            const newEndPage = await refetchTitle();
            setStartPage(newStartPage || '');
            setEndPage(newEndPage || '');
            toast({
                title: "랜덤 챌린지 생성",
                description: "랜덤한 시작 페이지와 도착 페이지가 생성되었습니다.",
            });
        } catch (error) {
            console.error("랜덤 챌린지 생성 중 오류 발생:", error);
            toast({
                title: "랜덤 챌린지 생성 실패",
                description: "랜덤 챌린지 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
                variant: "destructive",
            });
        } finally {
            setIsGeneratingRandom(false);
        }
    };

    const resetInputs = () => {
        setStartPage('');
        setEndPage('');
    };

    const handleDialogOpenChange = (open: boolean) => {
        if (!open) {
            resetInputs();
        }
        setIsDialogOpen(open);
    };

    return (
        <div className="h-screen w-full flex flex-col bg-[#F3F7FF]">
            <header className="flex items-center justify-between p-4">
                <Button variant="ghost" onClick={handleBack} className="p-2">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-2xl font-bold text-center flex-grow">챌린지 목록</h1>
                <div className='flex flex-row space-x-4'>
                    <div className="flex-shrink-0">
                        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    새 챌린지 추가
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>새 챌린지 추가</DialogTitle>
                                </DialogHeader>
                                <div className="flex flex-col space-y-4">
                                    <div>
                                        <Label htmlFor="startPage">시작 페이지</Label>
                                        <AutocompleteWikipediaInput
                                            value={startPage}
                                            onChange={setStartPage}
                                            placeholder="시작 페이지"
                                            disabled={isGeneratingRandom}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="endPage">도착 페이지</Label>
                                        <AutocompleteWikipediaInput
                                            value={endPage}
                                            onChange={setEndPage}
                                            placeholder="도착 페이지"
                                            disabled={isGeneratingRandom}
                                        />
                                    </div>
                                    <Button onClick={handleGenerateRandom} disabled={isGeneratingRandom}>
                                        {isGeneratingRandom ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                                        랜덤 생성
                                    </Button>
                                    <Button onClick={handleAddChallenge} disabled={isAddingChallenge || !startPage || !endPage}>
                                        {isAddingChallenge ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                                        챌린지 추가
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Button variant="ghost" onClick={loadChallenges} className="p-2">
                        <RefreshCw className="w-6 h-6" />
                    </Button>
                </div>
            </header>

            <div className="flex-grow overflow-hidden px-4 pb-4">
                <ScrollArea className="h-full rounded-md">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : challenges.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <p className="text-lg mb-4">아직 등록된 챌린지가 없습니다.</p>
                            <p className="text-sm text-gray-500 mb-4">새로운 챌린지를 추가해 보세요!</p>
                            <Button onClick={() => setIsDialogOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                첫 번째 챌린지 추가하기
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                            {challenges.map(({ id, challenge }) => (
                                <Card key={id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleChallengeSelect(id)}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">챌린지 ID : {id.slice(0, 6)}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm mb-2"><strong>시작</strong>: {challenge.startPage}</p>
                                        <p className="text-sm mb-2"><strong>도착</strong>: {challenge.endPage}</p>
                                        <p className="text-sm"><strong>총 성공 횟수</strong>: {challenge.totalCount}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
};

export default DEV_ChallengeScreen;