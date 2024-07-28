
import Layout from '@/components/Layout';
import SuccessScreen from '@/components/Success/Screen';
import { useNickname } from '@/hooks/useNickname';
import { useWikipedia } from '@/hooks/useWikipedia';

export default function Success() {
    return (
        <Layout>
            <SuccessScreen />
        </Layout>
    );
}