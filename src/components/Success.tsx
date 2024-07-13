import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

interface GameSuccessProps {
  time: string;
  moveCount: number;
  path: string[];
  nickname: string;
  bestRecord: { moveCount: number; time: number } | null;
}

const GameSuccess: React.FC<GameSuccessProps> = ({ time, moveCount, path, nickname, bestRecord }) => {
  const router = useRouter();

  React.useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const handleViewRanking = () => {
    router.push('/ranking');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isNewRecord = bestRecord 
    ? (moveCount < bestRecord.moveCount || (moveCount === bestRecord.moveCount && parseInt(time) < bestRecord.time))
    : true;

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 text-white p-4">
      <Card className="w-full max-w-md bg-white text-gray-800">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">축하합니다, {nickname}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl mb-4 text-center">목표 페이지에 도달했습니다!</p>
          <div className="space-y-2">
            <p><strong>소요 시간:</strong> {time}</p>
            <p><strong>이동 횟수:</strong> {moveCount}</p>
            {isNewRecord && (
              <p className="text-green-600 font-bold">새로운 최고 기록을 달성했습니다!</p>
            )}
            {bestRecord && !isNewRecord && (
              <p><strong>최고 기록:</strong> {formatTime(bestRecord.time)} (이동 횟수: {bestRecord.moveCount})</p>
            )}
            <div>
              <strong>경로:</strong>
              <ul className="list-disc list-inside">
                {path.map((page, index) => (
                  <li key={index} className="truncate">{page}</li>
                ))}
              </ul>
            </div>
          </div>
          <Button onClick={handleViewRanking} className="w-full mt-6">
            랭킹 보기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameSuccess;