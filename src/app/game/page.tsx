import Layout from '@/components/Layout';
import GameScreen from '@/components/Game/Screen';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '링클 | 게임 플레이',
};

export default function Game() {
  return (
    <Layout>
      <GameScreen />
    </Layout>
  );
}