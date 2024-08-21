"use client"

import { useState, useEffect } from 'react';

const adjectives = [
  '즐거운', '행복한', '신나는', '재미있는', '멋진', '귀여운', '용감한', '똑똑한', '친절한', '열정적인',
  '활발한', '창의적인', '유쾌한', '상냥한', '씩씩한', '다정한', '엉뚱한', '재치있는', '낙천적인', '온화한'
];

const nouns = [
  '고양이', '강아지', '토끼', '사자', '호랑이', '코끼리', '기린', '팬더', '곰', '여우',
  '다람쥐', '펭귄', '캥거루', '코알라', '늑대', '원숭이', '하마', '악어', '거북이', '앵무새'
];

export function useNickname() {
  const [nickname, setNickname] = useState<string>('');

  useEffect(() => {
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const newNickname = `${randomAdjective} ${randomNoun}`;
    setNickname(newNickname);
  }, []);

  return nickname;
}