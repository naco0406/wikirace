"use client"

import Layout from '@/components/Layout';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import DEV_InvalidScreen from '@/dev/screens/InvalidScreen';
import DEV_StartScreen from '@/dev/screens/StartScreen';

export default function DEV_Home() {
  const { isDev } = useEnvironment();
  if(!isDev) return <DEV_InvalidScreen />;
  return (
    <Layout>
      {isDev && <DEV_StartScreen />}
    </Layout>
  );
}