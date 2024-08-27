"use client"

import Layout from '@/components/Layout';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import DEV_GameScreen from '@/dev/screens/GameScreen';
import DEV_InvalidScreen from '@/dev/screens/InvalidScreen';

export default function Game({ params }: { params: { challengeId: string } }) {
  const { isDev } = useEnvironment();
  if(!isDev) return <DEV_InvalidScreen />;
  return (
    <Layout>
      <DEV_GameScreen challengeId={params.challengeId} />
    </Layout>
  );
}