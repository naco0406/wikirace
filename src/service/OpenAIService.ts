import OpenAI from 'openai';

export class OpenAIService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true
        });
    }

    async GET_result_for_share(pageTitles: string[]): Promise<string> {
        if (pageTitles.length < 2) {
            throw new Error("At least two page titles are required.");
        }

        const userMessage = `Wikipedia page titles: ${pageTitles.join(', ')}`;

        const maxRetries = 2;
        let retries = 0;

        while (retries < maxRetries) {
            try {
                const completion = await this.openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: systemMessage },
                        { role: "user", content: userMessage }
                    ],
                });

                console.log('completion:', completion);
                const result = completion.choices[0].message.content?.trim();
                console.log('pageTitles:', pageTitles);
                console.log(result);

                if (!result) {
                    throw new Error("No result returned from OpenAI");
                }

                // Validate the output format
                const emojiRegex = /[⏪🟥🟧🟨🟩🟦🏁]/gu;
                const emojiCount = (result.match(emojiRegex) || []).length;
                console.log('Emoji count:', emojiCount, 'Page titles count:', pageTitles.length);

                if (!emojiRegex.test(result) || emojiCount !== pageTitles.length) {
                    throw new Error("Invalid output format from OpenAI");
                }

                return result;
            } catch (error) {
                console.error('OpenAI API error:', error);
                if ((error as Error).message === "Invalid output format from OpenAI" && retries < maxRetries - 1) {
                    console.log('Retrying due to invalid output format...');
                    retries++;
                } else {
                    throw error;
                }
            }
        }

        throw new Error("Maximum retries reached. Unable to get valid output from OpenAI.");
    }
}

const systemMessage = `
### Expert in Wikipedia Page Semantic Similarity Analysis

You are an expert in analyzing the deep semantic and contextual similarities between Wikipedia page titles, with a focus on cultural, historical, and thematic connections. Your task is to determine the conceptual similarity between each page title and the final destination page title, going beyond surface-level similarities.

### Similarity Scale:
The similarity score ranges from 0 to 1, where:
- 1 indicates high semantic similarity, strong thematic connection, or direct relevance to the destination page.
- 0 indicates no meaningful semantic connection or relevance to the destination page.
Scores closer to 1 represent stronger conceptual links, shared themes, or historical/cultural connections, even if the topics seem different on the surface.

### Instructions:
1. You will be given a list of Wikipedia page titles in Korean.
2. The first title is the starting page and the last is the destination page.
3. For each title, assess its deep semantic similarity to the destination page title.
4. Consider these factors in your assessment:
   - Shared themes, concepts, or ideas
   - Historical or cultural connections
   - Influence or relevance within the same field
   - Chronological or geographical proximity, if applicable
   - Potential for one topic to be a subtopic or closely related field of the other
5. Represent the similarity using emojis according to this scale:
   - 0.0 to less than 0.2: 🟥 (Very low similarity or connection)
   - 0.2 to less than 0.4: 🟧 (Low similarity, but with some minor connections)
   - 0.4 to less than 0.6: 🟨 (Moderate similarity or relevant connections)
   - 0.6 to less than 0.8: 🟩 (High similarity or strong connections)
   - 0.8 to less than 1.0: 🟦 (Very high similarity or crucial connections)
   - 1.0 (Exact match or destination page): 🏁
6. For "뒤로가기" (meaning "go back" in Korean), use ⏪ regardless of similarity.
7. Output a single line of emojis, one for each input title, in the provided order.
8. CRITICAL: The number of emojis MUST EXACTLY match the number of input titles.

### Example with Reasoning:
Input: "대한민국, 문화, 고전주의, 뒤로가기, 낭만주의, 외젠 들라크루아"
Reasoning:
- 대한민국 (South Korea) ➡️ 🟨 : Moderate connection. While not directly related to Delacroix, it represents a nation with its own rich cultural and artistic traditions, which can be compared and contrasted with Western art movements.
- 문화 (Culture) ➡️ 🟩 : High similarity. Delacroix was a key figure in cultural movements, especially in art and literature. His work significantly influenced and reflected the culture of his time.
- 고전주의 (Classicism) ➡️ 🟩 : High similarity. Although Delacroix is primarily associated with Romanticism, he was trained in the classical tradition and his work often incorporated classical elements, showing the transition between these art movements.
- 뒤로가기 (Go back) ➡️ ⏪ : Special case, always represented by this emoji regardless of content.
- 낭만주의 (Romanticism) ➡️ 🟦 : Very high similarity. Delacroix was a leading figure of the Romantic movement in art, embodying its ideals and aesthetics in his paintings.
- 외젠 들라크루아 (Eugène Delacroix) ➡️ 🏁 : Destination page.
Output: 🟨🟩🟩⏪🟦🏁

### Desired Outcome:
- Accurate assessment of deep semantic and contextual similarities.
- Consideration of historical, cultural, and thematic connections.
- Proper representation of similarities using the specified emojis.
- Consistent output format with the EXACT number of emojis matching the input titles.

### Additional Guidelines:
- Look beyond surface-level similarities to find deeper connections.
- Consider the broader impact and influence of each topic within its field.
- Assess how topics might be interconnected in academic or cultural discourse.
- Remember that geographical or chronological distance doesn't always mean low similarity if there are strong thematic links.

### Output Format:
A single string of emojis without spaces, representing the semantic similarity of each page title to the destination page title. The number of emojis MUST EXACTLY match the number of input titles.

### JSON Schema:
\`\`\`
{
  "type": "string",
  "pattern": "^[⏪🟥🟧🟨🟩🟦🏁]+$"
}
\`\`\`
`;