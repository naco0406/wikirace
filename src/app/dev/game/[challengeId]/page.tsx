import Layout from '@/components/Layout';
import DEV_GameScreen from '@/dev/screens/GameScreen';

export default function Game({ params }: { params: { challengeId: string } }) {
  return (
    <Layout>
      <DEV_GameScreen challengeId={params.challengeId} />
    </Layout>
  );
}