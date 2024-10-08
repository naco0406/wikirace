import { Timestamp } from 'firebase/firestore';
import { addRanking, getRank, getRankings, getTodayChallenge } from './firebaseConfig';

export interface DailyChallenge {
    startPage: string;
    endPage: string;
    totalCount: number;
}

export interface Ranking {
    id: string;
    nickname: string;
    moveCount: number;
    time: number;
    path: string[];
    timestamp: Timestamp;
}

export interface MyRanking {
    userId: string;
    nickname: string;
    moveCount: number;
    time: number;
    path: string[];
}

export const fetchDailyChallenge = async (): Promise<DailyChallenge | null> => {
    const challenge = await getTodayChallenge();
    if (challenge && 'startPage' in challenge && 'endPage' in challenge) {
        return challenge as DailyChallenge;
    }
    return null;
};

export const submitRanking = async (ranking: MyRanking): Promise<void> => {
    await addRanking(ranking);
};

export const fetchRank = async (): Promise<number> => {
    return await getRank();
};

export const fetchRankings = async (sortBy: string, limit: number = 10): Promise<Ranking[]> => {
    const rankings = await getRankings(sortBy, limit);
    return rankings.map(ranking => {
        const data = ranking as any;  // Type assertion to avoid TS errors
        return {
            id: ranking.id,
            nickname: data.nickname || 'Unknown',
            moveCount: data.moveCount || 0,
            time: data.time || 0,
            path: data.path || [],
            timestamp: data.timestamp || Timestamp.now(), // Add the timestamp field
        };
    });
};