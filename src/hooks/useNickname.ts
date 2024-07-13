"use client"

import { useState, useEffect } from 'react';

const adjectives = ['즐거운', '행복한', '신나는', '재미있는', '멋진', '귀여운', '용감한', '똑똑한', '친절한', '열정적인'];
const nouns = ['고양이', '강아지', '토끼', '사자', '호랑이', '코끼리', '기린', '팬더', '곰', '여우'];

export function useNickname() {
  const [nickname, setNickname] = useState<string>('');

  useEffect(() => {
    const storedNickname = localStorage.getItem('wikiRaceNickname');
    const today = new Date().toDateString();
    
    if (storedNickname) {
      const { name, date } = JSON.parse(storedNickname);
      if (date === today) {
        setNickname(name);
        return;
      }
    }

    const newNickname = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
    setNickname(newNickname);
    localStorage.setItem('wikiRaceNickname', JSON.stringify({ name: newNickname, date: today }));
  }, []);

  return nickname;
}