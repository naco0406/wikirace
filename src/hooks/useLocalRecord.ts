"use client"

import { useState, useEffect } from 'react';
import { getKSTDateString } from '@/lib/firebaseConfig';

interface Record {
  moveCount: number;
  time: number;
}

interface DailyStatus {
  hasStartedToday: boolean;
  hasClearedToday: boolean;
  hasGiveUpToday: boolean;
}

export function useLocalRecord() {
  const [bestRecord, setBestRecord] = useState<Record | null>(null);
  const [dailyStatus, setDailyStatus] = useState<DailyStatus>({ hasStartedToday: false, hasClearedToday: false, hasGiveUpToday: false });

  useEffect(() => {
    const storedRecord = localStorage.getItem('wikiRaceBestRecord');
    const storedStatus = localStorage.getItem('wikiRaceDailyStatus');
    const today = getKSTDateString();

    if (storedRecord) {
      const { record, date } = JSON.parse(storedRecord);
      if (date === today) {
        setBestRecord(record);
      } else {
        localStorage.removeItem('wikiRaceBestRecord');
        setBestRecord(null);
      }
    }

    if (storedStatus) {
      const { status, date } = JSON.parse(storedStatus);
      if (date === today) {
        setDailyStatus(status);
      } else {
        localStorage.removeItem('wikiRaceDailyStatus');
        setDailyStatus({ hasStartedToday: false, hasClearedToday: false, hasGiveUpToday: false });
      }
    }
  }, []);

  const updateRecord = (newRecord: Record) => {
    const today = getKSTDateString();
    if (!bestRecord || newRecord.moveCount < bestRecord.moveCount ||
      (newRecord.moveCount === bestRecord.moveCount && newRecord.time < bestRecord.time)) {
      setBestRecord(newRecord);
      localStorage.setItem('wikiRaceBestRecord', JSON.stringify({ record: newRecord, date: today }));
    }
    setDailyStatus(prev => ({ ...prev, hasClearedToday: true }));
    updateDailyStatus({ hasStartedToday: true, hasClearedToday: true, hasGiveUpToday: false });
  };

  const setHasStartedToday = (value: boolean) => {
    setDailyStatus(prev => ({ ...prev, hasStartedToday: value }));
    updateDailyStatus({ ...dailyStatus, hasStartedToday: value });
  };

  const setHasClearedToday = (value: boolean) => {
    setDailyStatus(prev => ({ ...prev, hasClearedToday: value }));
    updateDailyStatus({ ...dailyStatus, hasClearedToday: value });
  };

  const setHasGiveUpToday = (value: boolean) => {
    setDailyStatus(prev => ({ ...prev, hasGiveUpToday: value }));
    updateDailyStatus({ ...dailyStatus, hasGiveUpToday: value });
  };

  const updateDailyStatus = (status: DailyStatus) => {
    const today = getKSTDateString();
    localStorage.setItem('wikiRaceDailyStatus', JSON.stringify({ status, date: today }));
  };

  return {
    bestRecord,
    updateRecord,
    hasStartedToday: dailyStatus.hasStartedToday, 
    hasClearedToday: dailyStatus.hasClearedToday,
    hasGiveUpToday: dailyStatus.hasGiveUpToday,
    setHasStartedToday,
    setHasClearedToday,
    setHasGiveUpToday
  };
}