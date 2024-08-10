"use client"

import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BasicInfoCard = () => (
    <Card className="w-full bg-black text-white mb-4 rounded-[20px]">
        <CardHeader>
            <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
                <span>최초 배포일</span>
                <span>2024.08.12</span>
            </div>
            <Separator className="bg-gray-700" />
            <div className="flex justify-between items-center">
                <span>최신 버전</span>
                <span>1.003</span>
            </div>
        </CardContent>
    </Card>
);

const CreditsAndFontsCard = () => (
    <Card className="w-full bg-black text-white mb-4 rounded-[20px]">
        <CardHeader>
            <CardTitle>크레딧 및 폰트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <CardTitle className="text-lg">크레딧</CardTitle>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span>기획 및 디자인</span>
                        <span>임민서</span>
                    </div>
                    <div className="flex justify-between">
                        <span>개발</span>
                        <span>고영</span>
                    </div>
                    {/* <div className="flex justify-between items-center">
                        <span>보완 자문</span>
                        <div className="flex items-center space-x-2">
                            <span>김지훈</span>
                            <Badge variant="outline" className="text-xs text-white">MVP</Badge>
                        </div>
                    </div> */}
                </div>
            </div>
            <Separator className="bg-gray-700" />
            <div className="space-y-2">
                <CardTitle className="text-lg">폰트</CardTitle>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span>한글 베이스</span>
                        <span>본고딕 : 산돌커뮤니케이션_장수영, 강주연</span>
                    </div>
                    <div className="flex justify-between">
                        <span>한자 베이스</span>
                        <span>본고딕 : Adobe_Ryoko Nishizuka</span>
                    </div>
                    <div className="flex justify-between">
                        <span>라틴 베이스</span>
                        <span>Roboto : Christian Robertson</span>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);

const UpdateHistoryCard = () => (
    <Card className="w-full bg-black text-white rounded-[20px]">
        <CardHeader>
            <CardTitle>업데이트 내역</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-3 text-xs">
                {[
                    { date: "2024.03.20_v1.001", content: "폰트명 변경 (너비형 추가_굵기 순으로 나열)\n고딕 로마숫자 글리프 삭제" },
                    { date: "2024.03.29_v1.002", content: "[추가] 반원소자 / 커컴 / 아이콘\n중간점(318D) / Grave accent(0060)\n당구점표시(203B) / 중간두점(2025)\n세로세점(FE19)\n[수정] 말줄임표(2026) 중간정렬" },
                    { date: "2024.04.17_v1.003", content: "조합형 한글 빈글리프 추가\n원문자 및 반원문자 크기 10% 축소\n글리프 수정 (로마숫자 1 , 괄호 1)\n한자 추가 (佛,作)" },
                    { date: "2024.08.06_v1.004", content: "중·고등 필수한자 1,800자\n한글과 뛰어쓰기 미세한 자간 조정\n글머리기호 자간 조정" },
                    { date: "2024.08.06_v2.000", content: "현대한글 11,172자 표현" },
                    { date: "2024.08.07_VF", content: "가변폰트" },
                ].map((update, index) => (
                    <div key={index} className="space-y-1">
                        <Badge variant="outline" className="text-xs font-normal text-white">{update.date}</Badge>
                        <p className="whitespace-pre-line">{update.content}</p>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

const Author = () => {
    const router = useRouter();

    const handleBack = useCallback(() => {
        router.push('/');
    }, [router]);
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-12 py-8 bg-black">
            <header className="absolute top-0 left-0 items-center">
                <div className="flex flex-row px-4 h-[80px] justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className='hover:bg-transparent'
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </Button>
                </div>
            </header>
            <div className="w-full max-w-[768px] space-y-4">
                <p className="text-xl text-center text-white">예시데이터 from Freesentation</p>
                <BasicInfoCard />
                <CreditsAndFontsCard />
                <UpdateHistoryCard />
                <p className="text-md text-center text-white">© 2024 Naco & Minseo Lim. All rights reserved.</p>
            </div>
        </div>
    );
};

export default Author;