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

export function useLocalRecord() {
  const [localRecord, setLocalRecord] = useState<Record>({ moveCount: 0, time: 0, path: [] });
  const [localFullRecord, setLocalFullRecord] = useState<Record>({ moveCount: 0, time: 0, path: [] });
  const [localSingleRecord, setLocalSingleRecord] = useState<Record>({ moveCount: 0, time: 0, path: [] });
  const [dailyStatus, setDailyStatus] = useState<DailyStatus>({
    hasStartedToday: false,
    hasClearedToday: false,
    resultOfToday: null
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (typeof window === 'undefined') return;

      const storedlocalRecord = localStorage.getItem('wikiRacelocalRecord');
      const storedlocalFullRecord = localStorage.getItem('wikiRacelocalFullRecord');
      const storedlocaSingleRecord = localStorage.getItem('wikiRacelocalSingleRecord');
      const storedStatus = localStorage.getItem('wikiRaceDailyStatus');
      const today = getKSTDateString();

      if (storedlocalRecord) {
        const { record, date } = JSON.parse(storedlocalRecord);
        if (date === today) {
          setLocalRecord(record);
        } else {
          localStorage.removeItem('wikiRacelocalRecord');
          setLocalRecord({ moveCount: 0, time: 0, path: [] });
        }
      }

      if (storedlocalFullRecord) {
        const { record, date } = JSON.parse(storedlocalFullRecord);
        if (date === today) {
          setLocalFullRecord(record);
        } else {
          localStorage.removeItem('wikiRacelocalFullRecord');
          setLocalFullRecord({ moveCount: 0, time: 0, path: [] });
        }
      }

      if (storedlocaSingleRecord) {
        const { record, date } = JSON.parse(storedlocaSingleRecord);
        if (date === today) {
          setLocalSingleRecord(record);
        } else {
          localStorage.removeItem('wikiRacelocalSingleRecord');
          setLocalSingleRecord({ moveCount: 0, time: 0, path: [] });
        }
      }

      if (storedStatus) {
        const { status, date } = JSON.parse(storedStatus);
        if (date === today) {
          setDailyStatus(status);
        } else {
          localStorage.removeItem('wikiRaceDailyStatus');
          setDailyStatus({ hasStartedToday: false, hasClearedToday: false, resultOfToday: null });
        }
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  const updateLocalRecord = (newRecord: Record) => {
    const today = getKSTDateString();
    setLocalRecord(newRecord);
    console.log('localRecord: ', newRecord.path);
    localStorage.setItem('wikiRacelocalRecord', JSON.stringify({ record: newRecord, date: today }));
  };

  const updateLocalFullRecord = (newRecord: Record) => {
    const today = getKSTDateString();
    setLocalFullRecord(newRecord);
    console.log('localFullRecord: ', newRecord.path);
    localStorage.setItem('wikiRacelocalFullRecord', JSON.stringify({ record: newRecord, date: today }));
  };

  const updateLocalSingleRecord = (newRecord: Record) => {
    const today = getKSTDateString();
    setLocalSingleRecord(newRecord);
    console.log('localSingleRecord: ', newRecord.path);
    localStorage.setItem('wikiRacelocalSingleRecord', JSON.stringify({ record: newRecord, date: today }));
  };

  const finalizeRecord = () => {
    setDailyStatus(prev => ({ ...prev, hasClearedToday: true }));
    updateDailyStatus({ ...dailyStatus, hasStartedToday: true, hasClearedToday: true });
  };

  const setHasStartedToday = (value: boolean) => {
    setDailyStatus(prev => ({ ...prev, hasStartedToday: value }));
    updateDailyStatus({ ...dailyStatus, hasStartedToday: value });
  };

  const setHasClearedToday = (value: boolean) => {
    setDailyStatus(prev => ({ ...prev, hasClearedToday: value }));
    updateDailyStatus({ ...dailyStatus, hasClearedToday: value });
  };

  const setResultOfToday = (value: string) => {
    setDailyStatus(prev => ({ ...prev, resultOfToday: value }));
    updateDailyStatus({ ...dailyStatus, resultOfToday: value });
  };

  const updateDailyStatus = (status: DailyStatus) => {
    const today = getKSTDateString();
    localStorage.setItem('wikiRaceDailyStatus', JSON.stringify({ status, date: today }));
  };

  return {
    localRecord,
    localFullRecord,
    localSingleRecord,
    updateLocalRecord,
    updateLocalFullRecord,
    updateLocalSingleRecord,
    finalizeRecord,
    hasStartedToday: dailyStatus.hasStartedToday,
    hasClearedToday: dailyStatus.hasClearedToday,
    resultOfToday: dailyStatus.resultOfToday,
    dailyStatus,
    setHasStartedToday,
    setHasClearedToday,
    setResultOfToday,
  };
}