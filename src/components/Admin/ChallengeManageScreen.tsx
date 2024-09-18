import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { useRandomWikipediaTitle } from "@/hooks/useRandomWikipedia";
import { useScreenSize } from "@/hooks/useScreenSize";
import { DailyChallengeWithId, addDailyChallenge, deleteChallenge, getChallengesByDateRange, updateChallenge } from "@/lib/firebaseConfig";
import { addWeeks, eachDayOfInterval, endOfWeek, format, isBefore, isToday, startOfWeek } from 'date-fns';
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import AutocompleteWikipediaInput from "../AutocompleteWikipediaInput";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DatePickerWithRange } from "../ui/date-range-picker";
import { Button } from "../ui/button";

const ChallengeManageScreen: React.FC = () => {
    const [challenges, setChallenges] = useState<{ [date: string]: DailyChallengeWithId | null }>({});
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [editChallenge, setEditChallenge] = useState<DailyChallengeWithId | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRandomStartLoading, setIsRandomStartLoading] = useState(false);
    const [isRandomEndLoading, setIsRandomEndLoading] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        const today = new Date();
        const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 });
        const endOfNextWeek = endOfWeek(addWeeks(startOfCurrentWeek, 1), { weekStartsOn: 0 });
        return {
            from: startOfCurrentWeek,
            to: endOfNextWeek
        };
    });
    const [showAlertDialog, setShowAlertDialog] = useState(false);
    const { isMobile } = useScreenSize();

    const { refetch: refetchTitle } = useRandomWikipediaTitle();

    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            loadChallenges(dateRange.from, dateRange.to);
        }
    }, [dateRange]);

    const loadChallenges = async (startDate: Date, endDate: Date) => {
        setIsLoading(true);
        try {
            const allChallenges = await getChallengesByDateRange(startDate, endDate);
            const allDates = eachDayOfInterval({ start: startDate, end: endDate });
            const challengesWithEmptyDates = allDates.reduce((acc, date) => {
                const dateString = format(date, 'yyyy-MM-dd');
                acc[dateString] = allChallenges[dateString] || null;
                return acc;
            }, {} as { [date: string]: DailyChallengeWithId | null });
            setChallenges(challengesWithEmptyDates);
            // 데이터 새로고침 시 선택된 챌린지 업데이트
            if (selectedDate) {
                setEditChallenge(challengesWithEmptyDates[selectedDate] || { id: selectedDate, startPage: '', endPage: '', totalCount: 0 });
            }
        } catch (error) {
            console.error("챌린지 로드 중 오류 발생:", error);
            alert("챌린지를 로드하는 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        if (dateRange?.from && dateRange?.to) {
            loadChallenges(dateRange.from, dateRange.to);
        }
    };

    const handleSelectChallenge = async (date: string) => {
        setSelectedDate(date);
        const challenge = challenges[date];
        setEditChallenge(challenge || { id: date, startPage: '', endPage: '', totalCount: 0 });
    };

    const handleUpdateChallenge = async () => {
        if (selectedDate && editChallenge) {
            const challengeDate = new Date(selectedDate);
            const today = new Date();

            if (challenges[selectedDate] && (isToday(challengeDate) || isBefore(challengeDate, today))) {
                setShowAlertDialog(true);
            } else {
                await updateOrAddChallenge();
            }
        }
    };

    const updateOrAddChallenge = async () => {
        if (selectedDate && editChallenge) {
            try {
                const { id, ...challengeData } = editChallenge;
                if (challenges[selectedDate]) {
                    await updateChallenge(selectedDate, challengeData);
                } else {
                    await addDailyChallenge(selectedDate, challengeData);
                }
                await loadChallenges(dateRange!.from!, dateRange!.to!);
                alert('챌린지가 성공적으로 업데이트되었습니다!');
            } catch (error) {
                console.error("챌린지 업데이트 중 오류 발생:", error);
                alert("챌린지 업데이트 중 오류가 발생했습니다.");
            }
        }
    };

    const handleDeleteChallenge = async () => {
        if (selectedDate) {
            if (window.confirm('정말로 이 챌린지를 삭제하시겠습니까?')) {
                try {
                    await deleteChallenge(selectedDate);
                    await loadChallenges(dateRange!.from!, dateRange!.to!);
                    setSelectedDate(null);
                    setEditChallenge(null);
                    alert('챌린지가 성공적으로 삭제되었습니다!');
                } catch (error) {
                    console.error("챌린지 삭제 중 오류 발생:", error);
                    alert("챌린지 삭제 중 오류가 발생했습니다.");
                }
            }
        }
    };

    const handleRandomTitle = async (field: 'startPage' | 'endPage') => {
        if (field === 'startPage') {
            setIsRandomStartLoading(true);
        } else {
            setIsRandomEndLoading(true);
        }

        try {
            const newTitle = await refetchTitle();
            if (newTitle && editChallenge) {
                setEditChallenge({ ...editChallenge, [field]: newTitle });
                if (field === 'startPage') {
                    setIsRandomStartLoading(false);
                } else {
                    setIsRandomEndLoading(false);
                }
            }
        } catch (error) {
            console.error("랜덤 제목 생성 중 오류 발생:", error);
        }
    };

    const renderChallengeEdit = (date?: string) => (
        <div className="flex flex-col mt-2 w-full">
            {date && <div className="my-2">{date}</div>}
            <div className="mb-2 flex flex-row items-center w-full">
                <div className="flex-grow">
                    <AutocompleteWikipediaInput
                        value={editChallenge?.startPage || ''}
                        onChange={(value) => setEditChallenge(prev => prev ? { ...prev, startPage: value } : null)}
                        placeholder="시작 페이지"
                        disabled={isRandomStartLoading}
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="ml-2 flex-shrink-0"
                    onClick={() => handleRandomTitle('startPage')}
                    disabled={isRandomStartLoading}
                >
                    <RefreshCw className={`h-4 w-4 ${isRandomStartLoading ? 'animate-spin' : ''}`} />
                </Button>
            </div>
            <div className="mb-2 flex items-center w-full">
                <div className="flex-grow">
                    <AutocompleteWikipediaInput
                        value={editChallenge?.endPage || ''}
                        onChange={(value) => setEditChallenge(prev => prev ? { ...prev, endPage: value } : null)}
                        placeholder="종료 페이지"
                        disabled={isRandomEndLoading}
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="ml-2 flex-shrink-0"
                    onClick={() => handleRandomTitle('endPage')}
                    disabled={isRandomEndLoading}
                >
                    <RefreshCw className={`h-4 w-4 ${isRandomEndLoading ? 'animate-spin' : ''}`} />
                </Button>
            </div>
            <div className="flex flex-row w-full space-x-2">
                <Button className="flex-1" onClick={handleUpdateChallenge}>
                    {challenges[editChallenge?.id || ''] ? '업데이트' : '추가'}
                </Button>
                {challenges[editChallenge?.id || ''] && (
                    <Button variant="destructive" className="flex-1" onClick={handleDeleteChallenge}>삭제</Button>
                )}
            </div>
        </div>
    );

    return (
        <div className="container p-2 relative w-full max-w-7xl">
            <Card>
                <CardHeader>
                    {isMobile ? (
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                            <div className="flex flex-row items-center space-x-2">
                                <CardTitle className="text-2xl sm:text-3xl font-bold">챌린지 관리</CardTitle>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleRefresh}
                                    disabled={isLoading}
                                >
                                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                            <DatePickerWithRange
                                className="max-w-[300px]"
                                date={dateRange}
                                setDate={setDateRange}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                            <CardTitle className="text-2xl sm:text-3xl font-bold">챌린지 관리</CardTitle>
                            <div className="flex flex-row items-center space-x-2">
                                <DatePickerWithRange
                                    className="max-w-[300px]"
                                    date={dateRange}
                                    setDate={setDateRange}
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleRefresh}
                                    disabled={isLoading}
                                >
                                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div>데이터를 불러오는 중...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">챌린지 목록</h3>
                                <div className={`overflow-y-auto border rounded p-2 ${isMobile ? 'max-h-[calc(100dvh-320px)]' : 'max-h-[calc(100dvh-275px)]'}`}>
                                    {Object.entries(challenges).map(([date, challenge]) => (
                                        <Sheet key={date}>
                                            <SheetTrigger asChild>
                                                <Button
                                                    variant={selectedDate === date ? "default" : "outline"}
                                                    className="w-full mb-2"
                                                    onClick={() => handleSelectChallenge(date)}
                                                >
                                                    <div className="text-left w-full overflow-x-auto scrollbar-hide">{date} : {challenge ? `${challenge.startPage} → ${challenge.endPage}` : '데이터 없음'}</div>
                                                </Button>
                                            </SheetTrigger>
                                            {isMobile && (
                                                <SheetContent>
                                                    <SheetHeader>
                                                        <SheetTitle>챌린지 편집</SheetTitle>
                                                    </SheetHeader>
                                                    {renderChallengeEdit(date)}
                                                </SheetContent>
                                            )}
                                        </Sheet>
                                    ))}
                                </div>
                            </div>
                            {!isMobile && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">챌린지 편집</h3>
                                    {editChallenge ? renderChallengeEdit() : <p>편집할 챌린지를 선택하세요</p>}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
            <AlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>챌린지 수정 확인</AlertDialogTitle>
                        <AlertDialogDescription>
                            이미 공개된 챌린지를 수정하려고 합니다. 정말로 수정하시겠습니까?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={updateOrAddChallenge}>확인</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
};

export default ChallengeManageScreen;