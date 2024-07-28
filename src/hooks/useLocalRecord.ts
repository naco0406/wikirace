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
  hasGiveUpToday: boolean;
}

export function useLocalRecord() {
  // const [bestRecord, setBestRecord] = useState<Record | null>(null);
  const [currentRecord, setCurrentRecord] = useState<Record>({ moveCount: 0, time: 0, path: [] });
  const [dailyStatus, setDailyStatus] = useState<DailyStatus>({ hasStartedToday: false, hasClearedToday: false, hasGiveUpToday: false });

  useEffect(() => {
    // const storedBestRecord = localStorage.getItem('wikiRaceBestRecord');
    const storedCurrentRecord = localStorage.getItem('wikiRaceCurrentRecord');
    const storedStatus = localStorage.getItem('wikiRaceDailyStatus');
    const today = getKSTDateString();

    if (storedCurrentRecord) {
      const { record, date } = JSON.parse(storedCurrentRecord);
      if (date === today) {
        setCurrentRecord(record);
      } else {
        localStorage.removeItem('wikiRaceCurrentRecord');
        setCurrentRecord({ moveCount: 0, time: 0, path: [] });
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

  const updateCurrentRecord = (newRecord: Record) => {
    const today = getKSTDateString();
    setCurrentRecord(newRecord);
    localStorage.setItem('wikiRaceCurrentRecord', JSON.stringify({ record: newRecord, date: today }));
  };

  const finalizeRecord = () => {
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
    currentRecord,
    updateCurrentRecord,
    finalizeRecord,
    hasStartedToday: dailyStatus.hasStartedToday,
    hasClearedToday: dailyStatus.hasClearedToday,
    hasGiveUpToday: dailyStatus.hasGiveUpToday,
    setHasStartedToday,
    setHasClearedToday,
    setHasGiveUpToday,
  };
}