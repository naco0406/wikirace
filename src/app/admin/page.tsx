'use client';

import { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAdminPassword } from '@/lib/firebaseConfig';
import { useRouter } from 'next/navigation';
import ChallengeInputScreen from '@/components/Admin/ChallengeInputScreen';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WikiAPITestScreen from '@/components/Admin/WikiAPITestScreen';
import OpenAiAPITestScreen from '@/components/Admin/OpenAiAPITestScreen';
import Layout from '@/components/Layout';

const Admin = () => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [adminPassword, setAdminPassword] = useState<string | null>(null);

    useEffect(() => {
        const fetchAdminPassword = async () => {
            const fetchedPassword = await getAdminPassword();
            setAdminPassword(fetchedPassword);
        };
        fetchAdminPassword();
    }, []);

    const handleAuthentication = () => {
        if (password === adminPassword) {
            setIsAuthenticated(true);
        } else {
            alert('잘못된 비밀번호입니다.');
        }
    };

    const handleBackToHome = () => {
        router.push('/');
    };

    if (isAuthenticated) {
        return (
            <Layout>
                <div className="p-6 bg-white w-full min-h-screen mx-auto">
                    <div className="w-full mx-auto">
                        <Tabs defaultValue="challenge">
                            <TabsList className="grid w-full max-w-[768px] grid-cols-3 mx-auto">
                                <TabsTrigger value="challenge">챌린지 입력</TabsTrigger>
                                <TabsTrigger value="openai">OpenAI API</TabsTrigger>
                                <TabsTrigger value="wiki">위키 API</TabsTrigger>
                            </TabsList>
                            <TabsContent value="challenge">
                                <ChallengeInputScreen />
                            </TabsContent>
                            <TabsContent value="openai">
                                <OpenAiAPITestScreen />
                            </TabsContent>
                            <TabsContent value="wiki">
                                <WikiAPITestScreen />
                            </TabsContent>
                        </Tabs>
                        {/* <Button variant="ghost" className="grid w-full mt-4 max-w-[768px] mx-auto" onClick={handleBackToHome}>메인으로 돌아가기</Button> */}
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-12">
                <form onSubmit={handleAuthentication} className="p-6 bg-white rounded-lg shadow-md w-full h-full max-w-[768px]">
                    <h2 className="mb-1 text-xl font-bold">관리자 로그인</h2>
                    {/* <p className="mb-6 text-xs text-gray-300">초기 비밀번호 : 1234</p> */}
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호를 입력하세요"
                        className="mb-6"
                    />
                    <Button type="submit" className="w-full mb-2">로그인</Button>
                </form>
                <Button variant="ghost" className="w-full mt-4" onClick={handleBackToHome}>메인으로 돌아가기</Button>
            </div>
        </Layout>
    );
};

export default Admin;
