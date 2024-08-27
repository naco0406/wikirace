import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const DEV_InvalidScreen= () => {
  return (
    <div className="h-screen flex items-center justify-center bg-red-100">
      <Card className="w-full max-w-md bg-white text-red-800 border-2 border-red-500">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <AlertTriangle className="mr-2 text-red-500" />
            부적절한 접근
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-sm">개발자 모드에 진입할 수 없습니다.</p>
          <Link href="https://linkle-beta.vercel.app">
            <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
              메인으로 돌아가기
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default DEV_InvalidScreen;