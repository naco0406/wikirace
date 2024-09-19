
import Layout from '@/components/Layout';
import SuccessScreen from '@/components/Success/Screen';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '링클 | 게임 클리어',
};

export default function Success() {
    return (
        <Layout>
            <SuccessScreen />
        </Layout>
    );
}