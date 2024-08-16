export interface OpenAIResponse {
    index: number;
    word: string;
    similarity: number;
    reason: string;
}

export const validateJsonOutput = (output: Array<OpenAIResponse>, filteredWordsToCompare: string[]): boolean => {
    if (output.length !== filteredWordsToCompare.length) {
        return false;
    }

    for (let i = 0; i < output.length; i++) {
        const item = output[i];
        if (
            item.index !== i ||
            item.word !== filteredWordsToCompare[i] ||
            item.similarity < 0 ||
            item.similarity > 1 ||
            typeof item.reason !== 'string' ||
            item.reason.length === 0
        ) {
            return false;
        }
    }

    return true;
};

export const createEmojiString = (
    output: Array<OpenAIResponse>,
    originalWords: string[],
    backIndices: number[]
): string => {
    console.log(output, originalWords, backIndices);
    // 먼저 output을 이모지로 변환
    const emojiArray = output.map(item => similarityToEmoji(item.similarity));

    // backIndices에 해당하는 위치에 ⏪ 삽입
    backIndices.forEach(index => {
        emojiArray.splice(index, 0, "⏪");
    });

    // 마지막에 🏁 추가
    emojiArray.push("🏁");

    // 최종 이모지 문자열 생성
    const emojiString = emojiArray.join('');

    // 검증: 이모지 문자열의 길이와 originalWords의 길이 비교
    if (getEmojiLength(emojiString) !== originalWords.length) {
        console.error("Emoji string length mismatch:", getEmojiLength(emojiString), originalWords.length);
        throw new Error("Generated emoji string length does not match the original words length.");
    }

    return emojiString;
};

export const similarityToEmoji = (similarity: number): string => {
    if (similarity >= 0.8) return '🟦';
    if (similarity >= 0.6) return '🟩';
    if (similarity >= 0.4) return '🟨';
    if (similarity >= 0.2) return '🟧';
    return '🟥';
};

export const getEmojiLength = (str: string): number => {
    return [...str].length;
};