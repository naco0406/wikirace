import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { DailyStatistics } from "@/lib/firebaseConfig";
import { similarityToCircleEmoji } from "@/service/OpenAI/utils";
import React from 'react';
import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { calculateLinkleDayNumber } from "@/assets/constants";
import { Info } from "lucide-react";

interface Props {
    isDialogOpen: boolean;
    setIsDialogOpen: (value: boolean) => void;
    statistics: DailyStatistics;
}

export const EmojiReason: React.FC<Props> = ({ isDialogOpen, setIsDialogOpen, statistics }) => {
    const linkleCount = calculateLinkleDayNumber();
    const reason = statistics.shortestPath.reason;
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="rounded-lg p-6 pt-8 max-w-sm max-h-[calc(100vh-4rem)] flex flex-col">
                <DialogHeader className="flex-shrink-0 flex flex-col items-center">
                    <DialogTitle className="flex flex-row text-2xl font-semibold text-center justify-center">
                        <p className="font-['Rhodium_Libre'] text-[#3366CC] text-4xl font-[400] mr-1">Linkle</p>
                        <p className="font-['Rhodium_Libre'] text-[#3366CC] text-sm">#{linkleCount - 1}</p>
                    </DialogTitle>
                    <DialogDescription>
                        <span className="text-black font-[600] mr-2">{statistics.startPage}</span>→<span className="text-black font-[600] ml-2">{statistics.endPage}</span>
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[70dvh] w-full pr-4">
                    <div className="space-y-4 relative">
                        <div className="absolute left-3 top-2 bottom-2 w-px bg-muted" />
                        {reason.slice(0, -1).map((item, index) => (
                            <div key={index} className="relative pl-10">
                                <div className="absolute left-0 top-4 flex h-6 w-6 items-center justify-center border-muted">
                                    <span className="text-md">{similarityToCircleEmoji(item.similarity)}</span>
                                </div>
                                <Card className="relative">
                                    <CardContent className="pt-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-md font-semibold">{item.word}</h3>
                                            <span className="text-sm text-muted-foreground">
                                                유사도: {item.similarity >= 1 ? 0.99 : item.similarity.toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{item.reason}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                        <div key={reason.length} className="relative pl-10">
                            <div className="absolute left-0 top-4 flex h-6 w-6 items-center justify-center border-muted">
                                <span className="text-md">🏁</span>
                            </div>
                            <Card className="relative">
                                <CardContent className="pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-md font-semibold">{statistics.endPage}</h3>
                                        <span className="text-sm text-muted-foreground">
                                            유사도: 1.00
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </ScrollArea>
                <div className="flex items-center text-linkle-foreground text-xs">
                    <Info className="mr-2 h-3 w-3" /> GPT-4o-mini를 이용해 생성된 결과입니다.
                </div>
            </DialogContent>
        </Dialog>
    );
};