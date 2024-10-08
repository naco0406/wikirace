import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface GameForcedEndProps {
  reason: string;
}

const GameForcedEnd: React.FC<GameForcedEndProps> = ({ reason }) => {
  return (
    <div className="h-screen flex items-center justify-center bg-red-100">
      <Card className="w-full max-w-md bg-white text-red-800 border-2 border-red-500">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <AlertTriangle className="mr-2 text-red-500" />
            게임 강제 종료
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{reason}</p>
          <p className="mb-6 text-sm">게임 규칙을 위반하였습니다.</p>
          <Link href="/">
            <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
              게임으로 돌아가기
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameForcedEnd;