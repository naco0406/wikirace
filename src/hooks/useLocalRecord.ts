"use client"

import { useState, useEffect } from 'react';

interface Record {
  moveCount: number;
  time: number;
}

export function useLocalRecord() {
  const [bestRecord, setBestRecord] = useState<Record | null>(null);

  useEffect(() => {
    const storedRecord = localStorage.getItem('wikiRaceBestRecord');
    const today = new Date().toDateString();
    
    if (storedRecord) {
      const { record, date } = JSON.parse(storedRecord);
      if (date === today) {
        setBestRecord(record);
      }
    }
  }, []);

  const updateRecord = (newRecord: Record) => {
    const today = new Date().toDateString();
    if (!bestRecord || newRecord.moveCount < bestRecord.moveCount || 
        (newRecord.moveCount === bestRecord.moveCount && newRecord.time < bestRecord.time)) {
      setBestRecord(newRecord);
      localStorage.setItem('wikiRaceBestRecord', JSON.stringify({ record: newRecord, date: today }));
    }
  };

  return { bestRecord, updateRecord };
}