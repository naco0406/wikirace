'use client';

import { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AdminScreen from '@/components/Admin/Screen';
import { getAdminPassword } from '@/lib/firebaseConfig';

const Admin = () => {
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

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleAuthentication} className="p-6 bg-white rounded shadow-md">
                <h2 className="mb-4 text-xl font-bold">관리자 로그인</h2>
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="mb-4"
                />
                <Button type="submit" className="w-full">로그인</Button>
            </form>
        </div>
    );
};

export default Admin;
