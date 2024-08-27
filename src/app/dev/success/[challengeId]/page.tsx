"use client"

import Layout from '@/components/Layout';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import DEV_InvalidScreen from '@/dev/screens/InvalidScreen';
import DEV_SuccessScreen from '@/dev/screens/SuccessScreen';

export default function Success({ params }: { params: { challengeId: string } }) {
    const { isDev } = useEnvironment();
    if(!isDev) return <DEV_InvalidScreen />;
    return (
        <Layout>
            <DEV_SuccessScreen challengeId={params.challengeId} />
        </Layout>
    );
}