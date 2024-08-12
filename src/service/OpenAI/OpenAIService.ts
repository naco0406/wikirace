import OpenAI from 'openai';
import { validateJsonOutput } from './ValidateOutput';
import { ResultShareSystemMessage } from './SystemMessage';

const MAX_RETRIES = 5;

export class OpenAIService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
            dangerouslyAllowBrowser: true
        });
    }

    async GET_result_for_share(pageTitles: string[]): Promise<{ result: string; attempts: number; error?: string; fullResponse?: string }> {
        if (pageTitles.length < 2) {
            throw new Error("At least two page titles are required.");
        }

        const referenceWord = pageTitles[pageTitles.length - 1];
        const wordsToCompare = pageTitles.slice(0, -1);

        // 뒤로가기 항목의 인덱스를 저장하고 wordsToCompare에서 제거
        const backIndices: number[] = [];
        const filteredWordsToCompare = wordsToCompare.filter((word, index) => {
            if (word === '뒤로가기') {
                backIndices.push(index);
                return false;
            }
            return true;
        });

        // referenceWord를 filteredWordsToCompare에 포함
        filteredWordsToCompare.push(referenceWord);

        const userMessage = `Reference word: "${referenceWord}"
    Words to compare: ${filteredWordsToCompare.join(', ')}`;

        let retries = 0;

        while (retries < MAX_RETRIES) {
            try {
                const completion = await this.openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: ResultShareSystemMessage },
                        { role: "user", content: userMessage }
                    ],
                });

                const result = completion.choices[0].message.content?.trim();

                if (!result) {
                    throw new Error("No result returned from OpenAI");
                }

                // Parse the JSON result
                const parsedResult = JSON.parse(result) as Array<{ index: number; word: string; similarity: number }>;

                // Validate the output format
                if (!this.validateJsonOutput(parsedResult, filteredWordsToCompare)) {
                    throw new Error("Invalid output format from OpenAI");
                }

                // Convert JSON to emoji string
                const emojiString = this.createEmojiString(parsedResult, pageTitles, backIndices);

                return { result: emojiString, attempts: retries + 1 };
            } catch (error) {
                console.error('OpenAI API error:', error);
                retries++;
                if (retries >= MAX_RETRIES) {
                    return {
                        result: '',
                        attempts: retries,
                        error: `Failed after ${retries} attempts. Last error: ${(error as Error).message}`,
                        fullResponse: JSON.stringify(error, null, 2),
                    };
                }
            }
        }

        throw new Error("This should never happen due to the return in the catch block");
    }

    private validateJsonOutput(output: Array<{ index: number; word: string; similarity: number }>, filteredWordsToCompare: string[]): boolean {
        if (output.length !== filteredWordsToCompare.length) {
            return false;
        }

        for (let i = 0; i < output.length; i++) {
            const item = output[i];
            if (item.index !== i || item.word !== filteredWordsToCompare[i] || item.similarity < 0 || item.similarity > 1) {
                return false;
            }
        }

        return true;
    }

    private createEmojiString(
        output: Array<{ index: number; word: string; similarity: number }>,
        originalWords: string[],
        backIndices: number[]
    ): string {
        const emojiMap = new Map<number, string>();

        // 유사도 기반 이모지 매핑
        output.forEach(item => {
            if (item.index < originalWords.length - 1) {  // referenceWord 제외
                emojiMap.set(item.index, this.similarityToEmoji(item.similarity));
            }
        });

        // 전체 이모지 문자열 생성
        return originalWords.map((_, index) => {
            if (backIndices.includes(index)) {
                return "⏪";
            }
            if (index === originalWords.length - 1) {
                return "🏁";
            }
            return emojiMap.get(index) || "🟥"; // 매핑된 이모지 또는 기본값
        }).join('');
    }

    private similarityToEmoji(similarity: number): string {
        if (similarity >= 0.8) return '🟦';
        if (similarity >= 0.6) return '🟩';
        if (similarity >= 0.4) return '🟨';
        if (similarity >= 0.2) return '🟧';
        return '🟥';
    }
}