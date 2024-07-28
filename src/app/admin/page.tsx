'use client';

import { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AdminScreen from '@/components/Admin/Screen';
import { getAdminPassword } from '@/lib/firebaseConfig';
import { useRouter } from 'next/navigation';

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

    if (isAuthenticated) {
        return <AdminScreen />;
    }

    const handleBackToHome = () => {
        router.push('/');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[100vh] bg-gray-100 p-12">
            <form onSubmit={handleAuthentication} className="p-6 bg-white rounded-lg shadow-md w-full h-full max-w-[768px]">
                <h2 className="mb-6 text-xl font-bold">관리자 로그인</h2>
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
    );
};

export default Admin;
