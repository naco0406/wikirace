"use client"

import { useState, useEffect } from 'react';

interface Record {
  moveCount: number;
  time: number;
  path: string[];
}

interface ChallengeStatus {
  hasStarted: boolean;
  hasCleared: boolean;
  result: string | null;
}

interface LinkleLocalData {
  challengeId: string;
  localRecord: Record;
  localFullRecord: Record;
  localSingleRecord: Record;
  challengeStatus: ChallengeStatus;
}

export function useLocalRecordDev(initialChallengeId: string) {
  const [localData, setLocalData] = useState<LinkleLocalData>({
    challengeId: initialChallengeId,
    localRecord: { moveCount: 0, time: 0, path: [] },
    localFullRecord: { moveCount: 0, time: 0, path: [] },
    localSingleRecord: { moveCount: 0, time: 0, path: [] },
    challengeStatus: {
      hasStarted: false,
      hasCleared: false,
      result: null
    }
  });

  useEffect(() => {
    const storedData = localStorage.getItem('DEV_linkleLocalData');
    if (storedData) {
      const parsedData: LinkleLocalData = JSON.parse(storedData);
      if (parsedData.challengeId === initialChallengeId) {
        setLocalData(parsedData);
      } else {
        // Reset data for a new challenge
        resetLocalData(initialChallengeId);
      }
    } else {
      resetLocalData(initialChallengeId);
    }
  }, [initialChallengeId]);

  const resetLocalData = (challengeId: string) => {
    const newData: LinkleLocalData = {
      challengeId: challengeId,
      localRecord: { moveCount: 0, time: 0, path: [] },
      localFullRecord: { moveCount: 0, time: 0, path: [] },
      localSingleRecord: { moveCount: 0, time: 0, path: [] },
      challengeStatus: {
        hasStarted: false,
        hasCleared: false,
        result: null
      }
    };
    setLocalData(newData);
    localStorage.setItem('DEV_linkleLocalData', JSON.stringify(newData));
  };

  const updateLocalStorage = (newData: LinkleLocalData) => {
    localStorage.setItem('DEV_linkleLocalData', JSON.stringify(newData));
  };

  const updateLocalRecord = (newRecord: Record) => {
    setLocalData(prev => {
      const updatedData = { ...prev, localRecord: newRecord };
      updateLocalStorage(updatedData);
      return updatedData;
    });
  };

  const updateLocalFullRecord = (newRecord: Record) => {
    setLocalData(prev => {
      const updatedData = { ...prev, localFullRecord: newRecord };
      updateLocalStorage(updatedData);
      return updatedData;
    });
  };

  const updateLocalSingleRecord = (newRecord: Record) => {
    setLocalData(prev => {
      const updatedData = { ...prev, localSingleRecord: newRecord };
      updateLocalStorage(updatedData);
      return updatedData;
    });
  };

  const finalizeRecord = () => {
    setLocalData(prev => {
      const updatedData = {
        ...prev,
        challengeStatus: { ...prev.challengeStatus, hasStarted: true, hasCleared: true }
      };
      updateLocalStorage(updatedData);
      return updatedData;
    });
  };

  const setHasStarted = (value: boolean) => {
    setLocalData(prev => {
      const updatedData = {
        ...prev,
        challengeStatus: { ...prev.challengeStatus, hasStarted: value }
      };
      updateLocalStorage(updatedData);
      return updatedData;
    });
  };

  const setHasCleared = (value: boolean) => {
    setLocalData(prev => {
      const updatedData = {
        ...prev,
        challengeStatus: { ...prev.challengeStatus, hasCleared: value }
      };
      updateLocalStorage(updatedData);
      return updatedData;
    });
  };

  const setResult = (value: string) => {
    setLocalData(prev => {
      const updatedData = {
        ...prev,
        challengeStatus: { ...prev.challengeStatus, result: value }
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
    hasStarted: localData.challengeStatus.hasStarted,
    hasCleared: localData.challengeStatus.hasCleared,
    result: localData.challengeStatus.result,
    challengeStatus: localData.challengeStatus,
    setHasStarted,
    setHasCleared,
    setResult,
    resetLocalData,
  };
}