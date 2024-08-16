import { OpenAIResponse, similarityToEmoji } from "@/service/OpenAI/utils";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";

export const ResultItem: React.FC<{ item: OpenAIResponse }> = ({ item }) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="inline-block">
                        {similarityToEmoji(item.similarity)}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="p-4 bg-white rounded-xl border text-sm">
                        <p className="font-bold">{item.word}</p>
                        <p>유사도 : {item.similarity}</p>
                        <p>근거 : {item.reason}</p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};