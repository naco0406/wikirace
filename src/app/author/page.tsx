"use client"

import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from '@/components/ui/button';
import { ArrowLeft, Instagram, Figma, Flame, FileCode2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BasicInfoCard = () => (
    <Card className="w-full bg-black text-white mb-4 rounded-[20px] border-black">
        <CardHeader>
            <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
                <span>서비스 이름</span>
                <span>링클 | Linkle</span>
            </div>
            <Separator className="bg-gray-700" />
            <div className="flex justify-between items-center">
                <span>최초 배포일</span>
                <span>2024.09.15</span>
            </div>
            <Separator className="bg-gray-700" />
            <div className="flex justify-between items-center">
                <span>최신 버전</span>
                <span>{ReleaseHistory[0].version}</span>
            </div>
        </CardContent>
    </Card>
);

const CreditsAndFontsCard = () => (
    <Card className="w-full bg-black text-white mb-4 rounded-[20px] border-black">
        <CardHeader>
            <CardTitle>크레딧 및 스택</CardTitle>
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
                    <div className="flex justify-between">
                        <span>기술 고문</span>
                        <span>서동휘</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>아이디어 제공</span>
                        <div className="flex items-center space-x-2">
                            <Instagram className="w-4 h-4" />
                            <span>릴스</span>
                            <Badge variant="outline" className="text-xs text-white">MVP</Badge>
                        </div>
                    </div>
                </div>
            </div>
            <Separator className="bg-gray-700" />
            <div className="space-y-2">
                <CardTitle className="text-lg">스택</CardTitle>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span>기획 및 디자인</span>
                        <div className="flex items-center space-x-2">
                            <Figma className="w-4 h-4" />
                            <span>Figma</span>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <span>프론트엔드</span>
                        <div className="flex items-center space-x-2">
                            <FileCode2 className="w-4 h-4" />
                            <span>Next.js</span>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <span>백엔드</span>
                        <div className="flex items-center space-x-2">
                            <Flame className="w-4 h-4" />
                            <span>Firebase</span>
                        </div>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);

const UpdateHistoryCard = () => (
    <Card className="w-full bg-black text-white rounded-[20px] border-black">
        <CardHeader>
            <CardTitle>업데이트 내역</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-5 text-xs">
                {ReleaseHistory.map((update, index) => (
                    <div key={index} className="space-y-2">
                        <Badge variant="outline" className="text-sm font-normal text-white ">{update.date}<span className='text-[#3366CC] text-xs ml-2'>v{update.version}</span></Badge>
                        <p className="text-xs whitespace-pre-line">{update.content}</p>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

interface ReleaseProps {
    date: string;
    version: string;
    content: string;
}
const ReleaseHistory: ReleaseProps[] = [
    { date: "2024.09.19", version: "1.0.1", content: "정답 처리 로직 개선\n일일 순위 추가\n자잘한 버그 수정" },
    { date: "2024.09.15", version: "1.0.0", content: "Linkle 1.0 배포" },
    { date: "2024.08.24", version: "0.2.0", content: "ios 사파리 지원\n관리자 페이지 개편" },
    { date: "2024.08.15", version: "0.1.3", content: "전체 컨셉 및 디자인 개편\nVercel Analytics 적용" },
    { date: "2024.08.10", version: "0.1.2", content: "새로운 경로 정책 반영\nGPT를 이용한 결과 공유" },
    { date: "2024.08.05", version: "0.1.1", content: "위키피디아 API 개선\n링클 디자인 적용\n관리자 챌린지 자동 생성\n위키피디아 API 테스트 페이지 생성" },
    { date: "2024.07.29", version: "0.1.0", content: "링클 이름 도입\n어제의 기록 시범 도입\n랭킹 제거\n대량 리팩토링, 버그 수정" },
    { date: "2024.07.25", version: "0.0.2", content: "관리자 페이지 추가\n시간, 랭킹 정책 변경\n이미지로 결과 공유" },
    { date: "2024.07.13", version: "0.0.1", content: "플레이 가능한 최초 배포\nNext.js, Firebase 사용" },
];

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
                <div className='flex flex-row w-full justify-center'>
                    <h1 className="py-4 font-['Rhodium_Libre'] text-[#3366CC] text-6xl font-[400]">Linkle</h1>
                </div>
                <BasicInfoCard />
                <CreditsAndFontsCard />
                <UpdateHistoryCard />
                <p className="text-sm text-center text-white">
                    © 2024 <a href='https://github.com/naco0406' className="text-[#3366CC] cursor-pointer underline" target="_blank" rel="noopener noreferrer">Young Ko</a> & <a href='https://dribbble.com/lms00' className="text-[#3366CC] cursor-pointer underline" target="_blank" rel="noopener noreferrer">Minseo Lim</a>. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Author;