import { Timestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { addRanking, getRankings, getChallenge, addChallenge, getAllChallenges, db } from './firebaseConfigDev';

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

export const fetchChallenge = async (challengeId: string): Promise<DailyChallenge | null> => {
    const challenge = await getChallenge(challengeId);
    if (challenge && 'startPage' in challenge && 'endPage' in challenge) {
        return challenge as DailyChallenge;
    }
    return null;
};

export const createChallenge = async (challenge: DailyChallenge): Promise<string> => {
    return await addChallenge(challenge);
};

export const submitRanking = async (challengeId: string, ranking: MyRanking): Promise<void> => {
    await addRanking(challengeId, ranking);
};

export const fetchRankings = async (challengeId: string, sortBy: string, limit: number = 10): Promise<Ranking[]> => {
    return await getRankings(challengeId, sortBy, limit);
};

export const fetchAllChallenges = async (): Promise<{ id: string; challenge: DailyChallenge }[]> => {
    return await getAllChallenges();
};

export const incrementTotalCount = async (challengeId: string): Promise<void> => {
    const challengeRef = doc(db, 'dev_linkle', challengeId);
    await updateDoc(challengeRef, {
        totalCount: increment(1)
    });
};