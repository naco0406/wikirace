import { DailyChallenge, MyRanking } from '@/lib/gameData';
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pocket.naco.kr');

export const PocketService = {
    async GET_today_challenges(): Promise<DailyChallenge | null> {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        try {
            const records = await pb.collection('dailyChallenges').getFullList<DailyChallenge & { date: string }>({
                filter: `date='${today}'`,
            });
            return records[0] || null;
        } catch (error) {
            console.error('Error fetching today\'s challenge:', error);
            return null;
        }
    },

    async POST_add_Ranking(ranking: MyRanking): Promise<void> {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        try {
            // Add ranking
            await pb.collection('dailyRankings').create({
                date: today,
                ...ranking,
                path: JSON.stringify(ranking.path),
                timestamp: new Date().toISOString(),
            });

            // Update totalCount
            const challenges = await pb.collection('dailyChallenges').getFullList<DailyChallenge & { id: string, date: string }>({
                filter: `date='${today}'`,
            });

            if (challenges.length > 0) {
                const challenge = challenges[0];
                await pb.collection('dailyChallenges').update(challenge.id, {
                    totalCount: challenge.totalCount + 1
                });
            }
        } catch (error) {
            console.error('Error adding ranking:', error);
            throw error;
        }
    },

    async POST_add_daily_challenge(date: string, challenge: DailyChallenge): Promise<void> {
        try {
            const data = {
                date,
                challenge: JSON.stringify(challenge),
                totalCount: challenge.totalCount
            };
            await pb.collection('dailyChallenges').create(data);
        } catch (error) {
            console.error('Error adding challenge: ', error);
            throw error;
        }
    }
};