import OpenAI from 'openai';
import { validateJsonOutput } from './ValidateOutput';
import { ResultShareSystemMessage } from './SystemMessage';

const MAX_RETRIES = 5;

export class OpenAIService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true
        });
    }

    async GET_result_for_share(pageTitles: string[]): Promise<{ result: string; attempts: number; error?: string, fullResponse?: string }> {
        if (pageTitles.length < 2) {
            throw new Error("At least two page titles are required.");
        }

        const userMessage = `Wikipedia page titles: ${pageTitles.join(', ')}`;

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
                const parsedResult = JSON.parse(result);

                // Validate the output format
                if (!validateJsonOutput(parsedResult, pageTitles)) {
                    throw new Error("Invalid output format from OpenAI");
                }

                // Convert JSON to emoji string
                const emojiString = pageTitles.map(title => parsedResult[title]).join('');

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