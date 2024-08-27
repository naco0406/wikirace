import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, orderBy, limit as firestoreLimit, Timestamp } from 'firebase/firestore';
import { DailyChallenge, MyRanking, Ranking } from './gameDataDev';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db };

export const getChallenge = async (challengeId: string): Promise<DailyChallenge | null> => {
    const challengeRef = doc(db, 'dev_linkle', challengeId);
    const challengeSnap = await getDoc(challengeRef);

    if (challengeSnap.exists()) {
        return challengeSnap.data() as DailyChallenge;
    } else {
        console.error('No challenge found for the given ID');
        return null;
    }
};

export const addChallenge = async (challenge: DailyChallenge): Promise<string> => {
    try {
        const challengesRef = collection(db, 'dev_linkle');
        const newChallengeRef = doc(challengesRef);
        await setDoc(newChallengeRef, challenge);
        return newChallengeRef.id;
    } catch (error) {
        console.error('Error adding challenge: ', error);
        throw error;
    }
};

export const addRanking = async (challengeId: string, ranking: MyRanking) => {
    const rankingRef = doc(db, 'dev_linkle', challengeId, 'rankings', ranking.userId);

    const rankingData = {
        nickname: ranking.nickname,
        moveCount: ranking.moveCount,
        time: ranking.time,
        path: ranking.path,
        timestamp: Timestamp.now()
    };

    try {
        await setDoc(rankingRef, rankingData);
    } catch (error) {
        console.error('Error adding ranking data:', error);
    }
};

export const getRankings = async (challengeId: string, sortBy: string, limitCount: number = 10): Promise<Ranking[]> => {
    const rankingsRef = collection(db, 'dev_linkle', challengeId, 'rankings');

    let q = query(rankingsRef);

    if (sortBy === 'fastest') {
        q = query(q, orderBy('time', 'asc'), orderBy('moveCount', 'asc'), firestoreLimit(limitCount));
    } else if (sortBy === 'leastClicks') {
        q = query(q, orderBy('moveCount', 'asc'), orderBy('time', 'asc'), firestoreLimit(limitCount));
    } else if (sortBy === 'firstToFinish') {
        q = query(q, orderBy('timestamp', 'asc'), firestoreLimit(limitCount));
    } else {
        q = query(q, orderBy('time', 'asc'), orderBy('moveCount', 'asc'), firestoreLimit(limitCount));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            nickname: data.nickname || 'Unknown',
            moveCount: data.moveCount || 0,
            time: data.time || 0,
            path: data.path || [],
            timestamp: data.timestamp || Timestamp.now(),
        } as Ranking;
    });
};

export const getAllChallenges = async (): Promise<{ id: string; challenge: DailyChallenge }[]> => {
    const challengesRef = collection(db, 'dev_linkle');
    const querySnapshot = await getDocs(challengesRef);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        challenge: doc.data() as DailyChallenge
    }));
};
