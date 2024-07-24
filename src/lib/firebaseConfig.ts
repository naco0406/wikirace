import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, query, orderBy, limit as firestoreLimit, getDocs, Timestamp, runTransaction, Query, DocumentData } from 'firebase/firestore';
import { DailyChallenge, MyRanking, Ranking } from './gameData';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

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

export const getKSTDateString = () => {
    const now = new Date();
    const kstDate = toZonedTime(now, 'Asia/Seoul');
    return format(kstDate, 'yyyy-MM-dd');
};

export const getTodayChallenge = async () => {
    const today = getKSTDateString();
    const challengeRef = doc(db, 'dailyChallenges', today);
    const challengeSnap = await getDoc(challengeRef);

    if (challengeSnap.exists()) {
        return challengeSnap.data();
    } else {
        console.error('No challenge found for today');
        return null;
    }
};

export const addDailyChallenge = async (date: string, challenge: DailyChallenge) => {
    try {
        const challengeRef = doc(db, 'dailyChallenges', date);
        await setDoc(challengeRef, {
            ...challenge,
            timestamp: Timestamp.now() // 추가된 시간 기록
        });
        console.log(`Challenge for ${date} added successfully`);
    } catch (error) {
        console.error('Error adding challenge: ', error);
        throw error;
    }
};

export const addRanking = async (ranking: MyRanking) => {
    const today = getKSTDateString();
    const rankingRef = doc(db, 'dailyRankings', today, 'users', ranking.userId);
    const challengeRef = doc(db, 'dailyChallenges', today);

    const rankingData = {
        nickname: ranking.nickname,
        moveCount: ranking.moveCount + 1,
        time: ranking.time,
        path: ranking.path,
        timestamp: Timestamp.now()
    };

    try {
        // await setDoc(rankingRef, rankingData);
        await runTransaction(db, async (transaction) => {
            const challengeDoc = await transaction.get(challengeRef);

            if (!challengeDoc.exists()) {
                throw new Error('Daily challenge document does not exist!');
            }

            const newTotalCount = (challengeDoc.data().totalCount || 0) + 1;

            transaction.set(rankingRef, rankingData);
            console.log('Ranking data added successfully');
            transaction.update(challengeRef, { totalCount: newTotalCount });
            console.log('TotalCount data added successfully');
        });
    } catch (error) {
        console.error('Error adding ranking data:', error);
    }
};

export const getRankings = async (sortBy: string, limitCount: number = 10): Promise<Ranking[]> => {
    const today = getKSTDateString();
    const rankingsRef = collection(db, 'dailyRankings', today, 'users');

    let q: Query<DocumentData>;
    if (sortBy === 'fastest') {
        q = query(
            rankingsRef,
            orderBy('time', 'asc'),
            orderBy('moveCount', 'asc'),
            firestoreLimit(limitCount)
        );
    } else if (sortBy === 'leastClicks') {
        q = query(
            rankingsRef,
            orderBy('moveCount', 'asc'),
            orderBy('time', 'asc'),
            firestoreLimit(limitCount)
        );
    } else if (sortBy === 'firstToFinish') {
        q = query(
            rankingsRef,
            orderBy('timestamp', 'asc'),
            firestoreLimit(limitCount)
        );
    } else {
        // 기본 정렬 기준을 fastest로 설정합니다.
        q = query(
            rankingsRef,
            orderBy('time', 'asc'),
            orderBy('moveCount', 'asc'),
            firestoreLimit(limitCount)
        );
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
            timestamp: data.timestamp || Timestamp.now(), // Add the timestamp field
        } as Ranking;
    });
};

export const getAdminPassword = async (): Promise<string | null> => {
    try {
        const passwordRef = doc(db, 'adminSettings', 'constants');
        const passwordDoc = await getDoc(passwordRef);
        if (passwordDoc.exists()) {
            return passwordDoc.data().password;
        } else {
            console.error('Admin password document does not exist');
            return null;
        }
    } catch (error) {
        console.error('Error fetching admin password: ', error);
        throw error;
    }
};

export const getAdminConsoleURL = async (): Promise<string | null> => {
    try {
        const consoleRef = doc(db, 'adminSettings', 'constants');
        const consoleDoc = await getDoc(consoleRef);
        if (consoleDoc.exists()) {
            return consoleDoc.data().console;
        } else {
            console.error('Admin console document does not exist');
            return null;
        }
    } catch (error) {
        console.error('Error fetching admin console URL: ', error);
        throw error;
    }
};