import StartScreen from '@/components/Start/Screen';
import Layout from '@/components/Layout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '링클 | 매일 위키피디아 탐색하기',
};

export default function Home() {
  return (
    <Layout>
      <StartScreen />
    </Layout>
  );
}