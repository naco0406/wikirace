"use client"

import Layout from '@/components/Layout';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import DEV_ChallengeScreen from '@/dev/screens/ChallengeScreen';
import DEV_InvalidScreen from '@/dev/screens/InvalidScreen';

export default function Game() {
    const { isDev } = useEnvironment();
    if (!isDev) return <DEV_InvalidScreen />;
    return (
        <Layout>
            <DEV_ChallengeScreen />
        </Layout>
    );
}