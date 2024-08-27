import Layout from '@/components/Layout';
import DEV_SuccessScreen from '@/dev/screens/SuccessScreen';

export default function Success({ params }: { params: { challengeId: string } }) {
    return (
        <Layout>
            <DEV_SuccessScreen challengeId={params.challengeId} />
        </Layout>
    );
}