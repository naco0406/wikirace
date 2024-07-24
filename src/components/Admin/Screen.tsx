'use client';

import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { addDailyChallenge, getAdminConsoleURL } from '@/lib/firebaseConfig';
import { DailyChallenge } from '@/lib/gameData';
import { useRouter } from 'next/navigation';
import { openInNewTab } from '@/lib/utils';

interface ChallengeInput {
    date: string;
    startPage: string;
    endPage: string;
}

const AdminScreen: React.FC = () => {
    const router = useRouter();
    const [inputs, setInputs] = useState<ChallengeInput[]>([{ date: '', startPage: '', endPage: '' }]);
    const [isLoading, setIsLoading] = useState(false);
    const [adminConsoleUrl, setAdminConsoleUrl] = useState<string | null>(null);
    const DEFAULT_CONSOLE_URL = 'https://console.firebase.google.com/';

    useEffect(() => {
        const fetchAdminConsoleURL = async () => {
            const fetchedPassword = await getAdminConsoleURL();
            setAdminConsoleUrl(fetchedPassword);
        };
        fetchAdminConsoleURL();
    }, []);

    const handleInputChange = (index: number, field: keyof ChallengeInput, value: string) => {
        const newInputs = [...inputs];
        newInputs[index][field] = value;
        setInputs(newInputs);
    };

    const addNewInput = () => {
        setInputs([...inputs, { date: '', startPage: '', endPage: '' }]);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const batch = inputs.map(async (input) => {
                if (input.date && input.startPage && input.endPage) {
                    const challengeData: DailyChallenge = {
                        startPage: input.startPage,
                        endPage: input.endPage,
                        totalCount: 0
                    };
                    await addDailyChallenge(input.date, challengeData);
                }
            });

            await Promise.all(batch);
            alert('데이터가 성공적으로 추가되었습니다.');
            setInputs([{ date: '', startPage: '', endPage: '' }]);
        } catch (error) {
            console.error('Error adding documents: ', error);
            alert('데이터 추가 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToHome = () => {
        router.push('/');
    };

    return (
        <div className="p-6 max-w-4xl w-full mx-auto">
            <div className="flex flex-row mb-8 space-x-4">
                <span className="text-2xl font-bold my-auto mr-auto">관리자 페이지</span>
                <Button variant="outline" onClick={handleBackToHome}>메인</Button>
                <Button variant="outline" onClick={() => openInNewTab(adminConsoleUrl ?? DEFAULT_CONSOLE_URL)}>Firebase Console</Button>
            </div>
            <h1 className="text-xl font-bold mb-4">챌린지 추가</h1>
            {inputs.map((input, index) => (
                <Card key={index} className="mb-4">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-3 gap-4">
                            <Input
                                placeholder="날짜 (YYYY-MM-DD)"
                                value={input.date}
                                onChange={(e) => handleInputChange(index, 'date', e.target.value)}
                            />
                            <Input
                                placeholder="시작 페이지"
                                value={input.startPage}
                                onChange={(e) => handleInputChange(index, 'startPage', e.target.value)}
                            />
                            <Input
                                placeholder="종료 페이지"
                                value={input.endPage}
                                onChange={(e) => handleInputChange(index, 'endPage', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}
            <div className="mb-4 space-x-4">
                <Button onClick={addNewInput}>새 챌린지 추가</Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? '...' : '적용'}
                </Button>
            </div>
        </div>
    );
};

export default AdminScreen;