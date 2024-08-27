"use client"

import { useState, useEffect } from 'react';
import { getKSTDateString } from '@/lib/firebaseConfig';

interface Record {
  moveCount: number;
  time: number;
  path: string[];
}

interface DailyStatus {
  hasStartedToday: boolean;
  hasClearedToday: boolean;
  resultOfToday: string | null;
}

interface LinkleLocalData {
  localRecord: Record;
  localFullRecord: Record;
  localSingleRecord: Record;
  dailyStatus: DailyStatus;
  date: string;
}

export function useLocalRecordDev() {
  const [localData, setLocalData] = useState<LinkleLocalData>({
    localRecord: { moveCount: 0, time: 0, path: [] },
    localFullRecord: { moveCount: 0, time: 0, path: [] },
    localSingleRecord: { moveCount: 0, time: 0, path: [] },
    dailyStatus: {
      hasStartedToday: false,
      hasClearedToday: false,
      resultOfToday: null
    },
    date: getKSTDateString()
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (typeof window === 'undefined') return;

      const storedData = localStorage.getItem('linkleLocalData');
      const today = getKSTDateString();

      if (storedData) {
        const parsedData: LinkleLocalData = JSON.parse(storedData);
        if (parsedData.date === today) {
          setLocalData(parsedData);
        } else {
          // Reset data for a new day
          const newData: LinkleLocalData = {
            localRecord: { moveCount: 0, time: 0, path: [] },
            localFullRecord: { moveCount: 0, time: 0, path: [] },
            localSingleRecord: { moveCount: 0, time: 0, path: [] },
            dailyStatus: {
              hasStartedToday: false,
              hasClearedToday: false,
              resultOfToday: null
            },
            date: today
          };
          setLocalData(newData);
          localStorage.setItem('linkleLocalData', JSON.stringify(newData));
        }
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  const updateLocalStorage = (newData: LinkleLocalData) => {
    localStorage.setItem('linkleLocalData', JSON.stringify(newData));
  };

  const updateLocalRecord = (newRecord: Record) => {
    setLocalData(prev => {
      const updatedData = { ...prev, localRecord: newRecord, date: getKSTDateString() };
      updateLocalStorage(updatedData);
      return updatedData;
    });
  };

  const updateLocalFullRecord = (newRecord: Record) => {
    setLocalData(prev => {
      const updatedData = { ...prev, localFullRecord: newRecord, date: getKSTDateString() };
      updateLocalStorage(updatedData);
      return updatedData;
    });
  };

  const updateLocalSingleRecord = (newRecord: Record) => {
    setLocalData(prev => {
      const updatedData = { ...prev, localSingleRecord: newRecord, date: getKSTDateString() };
      updateLocalStorage(updatedData);
      return updatedData;
    });
  };

  const finalizeRecord = () => {
    setLocalData(prev => {
      const updatedData = {
        ...prev,
        dailyStatus: { ...prev.dailyStatus, hasStartedToday: true, hasClearedToday: true },
        date: getKSTDateString()
      };
      updateLocalStorage(updatedData);
      return updatedData;
    });
  };

  const setHasStartedToday = (value: boolean) => {
    setLocalData(prev => {
      const updatedData = {
        ...prev,
        dailyStatus: { ...prev.dailyStatus, hasStartedToday: value },
        date: getKSTDateString()
      };
      updateLocalStorage(updatedData);
      return updatedData;
    });
  };

  const setHasClearedToday = (value: boolean) => {
    setLocalData(prev => {
      const updatedData = {
        ...prev,
        dailyStatus: { ...prev.dailyStatus, hasClearedToday: value },
        date: getKSTDateString()
      };
      updateLocalStorage(updatedData);
      return updatedData;
    });
  };

  const setResultOfToday = (value: string) => {
    setLocalData(prev => {
      const updatedData = {
        ...prev,
        dailyStatus: { ...prev.dailyStatus, resultOfToday: value },
        date: getKSTDateString()
      };
      updateLocalStorage(updatedData);
      return updatedData;
    });
  };

  return {
    localRecord: localData.localRecord,
    localFullRecord: localData.localFullRecord,
    localSingleRecord: localData.localSingleRecord,
    updateLocalRecord,
    updateLocalFullRecord,
    updateLocalSingleRecord,
    finalizeRecord,
    hasStartedToday: localData.dailyStatus.hasStartedToday,
    hasClearedToday: localData.dailyStatus.hasClearedToday,
    resultOfToday: localData.dailyStatus.resultOfToday,
    dailyStatus: localData.dailyStatus,
    setHasStartedToday,
    setHasClearedToday,
    setResultOfToday,
  };
}