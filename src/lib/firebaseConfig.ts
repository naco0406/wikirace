import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, query, orderBy, limit as firestoreLimit, getDocs, Timestamp, runTransaction, Query, DocumentData, limit, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { DailyChallenge, MyRanking, Ranking } from './gameData';
import { format, isWithinInterval, parseISO } from 'date-fns';
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
        });
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
        await runTransaction(db, async (transaction) => {
            const challengeDoc = await transaction.get(challengeRef);

            if (!challengeDoc.exists()) {
                throw new Error('Daily challenge document does not exist!');
            }

            const newTotalCount = (challengeDoc.data().totalCount || 0) + 1;

            transaction.set(rankingRef, rankingData);
            // console.log('Ranking data added successfully');
            transaction.update(challengeRef, { totalCount: newTotalCount });
            // console.log('TotalCount data added successfully');
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

export const getRank = async (): Promise<number> => {
    try {
        const today = getKSTDateString();
        const challengeRef = doc(db, 'dailyChallenges', today);
        const challengeDoc = await getDoc(challengeRef);

        if (challengeDoc.exists()) {
            return challengeDoc.data().totalCount || 1;
        } else {
            console.error('No challenge found for today');
            return 0;
        }
    } catch (error) {
        console.error('Error fetching rank: ', error);
        throw error;
    }
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

// DailyChallenge에 id를 추가한 새로운 타입 정의
export interface DailyChallengeWithId extends DailyChallenge {
    id: string;
}

// 특정 챌린지 읽기
export const getChallenge = async (date: string): Promise<DailyChallengeWithId | null> => {
    const challengeRef = doc(db, 'dailyChallenges', date);
    const challengeSnap = await getDoc(challengeRef);

    if (challengeSnap.exists()) {
        return { id: challengeSnap.id, ...challengeSnap.data() as DailyChallenge };
    } else {
        return null;
    }
};

// 챌린지 업데이트
export const updateChallenge = async (date: string, challenge: Partial<DailyChallenge>): Promise<void> => {
    const challengeRef = doc(db, 'dailyChallenges', date);
    await updateDoc(challengeRef, challenge);
};

// 챌린지 삭제
export const deleteChallenge = async (date: string): Promise<void> => {
    const challengeRef = doc(db, 'dailyChallenges', date);
    await deleteDoc(challengeRef);
};

// 날짜 범위로 챌린지 가져오기
export const getChallengesByDateRange = async (startDate: Date, endDate: Date): Promise<{ [date: string]: DailyChallengeWithId }> => {
    const challengesRef = collection(db, 'dailyChallenges');
    const startDateString = format(startDate, 'yyyy-MM-dd');
    const endDateString = format(endDate, 'yyyy-MM-dd');

    console.log(`Fetching challenges from ${startDateString} to ${endDateString}`);

    try {
        const querySnapshot = await getDocs(challengesRef);
        console.log(`Fetched ${querySnapshot.size} documents`);

        const challenges: { [date: string]: DailyChallengeWithId } = {};
        querySnapshot.forEach((doc) => {
            const docDate = parseISO(doc.id);
            if (isWithinInterval(docDate, { start: startDate, end: endDate })) {
                const data = doc.data() as DailyChallenge;
                challenges[doc.id] = {
                    id: doc.id,
                    startPage: data.startPage,
                    endPage: data.endPage,
                    totalCount: data.totalCount
                };
                console.log(`Document ${doc.id}:`, data);
            } else {
                console.log(`Skipping document ${doc.id} as it's outside the date range`);
            }
        });

        console.log(`Filtered ${Object.keys(challenges).length} challenges within the date range`);
        return challenges;
    } catch (error) {
        console.error("Error fetching challenges:", error);
        throw error;
    }
};

export interface DailyStatistics {
    startPage: string;
    endPage: string;
    totalCount: number;
    shortestPath: {
        userId: string;
        moveCount: number;
        path: string[];
    };
    fastestTime: {
        userId: string;
        time: number;
    };
}

export const getDailyStatistics = async (date: string): Promise<DailyStatistics | null> => {
    try {
        const statisticsRef = doc(db, 'dailyStatistics', date);
        const statisticsSnap = await getDoc(statisticsRef);

        if (statisticsSnap.exists()) {
            return statisticsSnap.data() as DailyStatistics;
        } else {
            console.log(`No statistics found for date: ${date}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching statistics for date ${date}:`, error);
        throw error;
    }
};