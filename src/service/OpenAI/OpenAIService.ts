import OpenAI from 'openai';
import { ResultShareSystemMessage } from './SystemMessage';
import { OpenAIResponse, validateJsonOutput, createEmojiString } from './utils';

const MAX_RETRIES = 3;

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
                const parsedResult = JSON.parse(result) as Array<OpenAIResponse>;

                // Validate the output format
                if (!validateJsonOutput(parsedResult, filteredWordsToCompare)) {
                    throw new Error("Invalid output format from OpenAI");
                }

                // Convert JSON to emoji string
                const emojiString = createEmojiString(parsedResult.slice(0, -1), pageTitles, backIndices);

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
}
