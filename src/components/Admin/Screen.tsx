import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { addDailyChallenge, getAdminConsoleURL } from '@/lib/firebaseConfig';
import { DailyChallenge } from '@/lib/gameData';
import { useRouter } from 'next/navigation';
import { openInNewTab } from '@/lib/utils';
import { addDays, format } from 'date-fns';
import { Minus, RefreshCw } from 'lucide-react';
import { useForm, useFieldArray, FieldValues } from 'react-hook-form';
import { cn } from "@/lib/utils";
import { useRandomWikipediaTitle } from '@/hooks/useRandomWikipedia';
import { DatePickerWithToday } from '../ui/date-picker';

interface ChallengeInput {
    date: Date | undefined;
    startPage: string;
    endPage: string;
}

const AdminScreen: React.FC = () => {
    const router = useRouter();
    const [adminConsoleUrl, setAdminConsoleUrl] = useState<string | null>(null);
    const DEFAULT_CONSOLE_URL = 'https://console.firebase.google.com/';

    const { control, handleSubmit, register, setValue, watch, formState: { errors } } = useForm<{ challenges: ChallengeInput[] }>({
        defaultValues: {
            challenges: [{ date: undefined, startPage: '', endPage: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "challenges"
    });

    const watchedChallenges = watch("challenges");

    const { title: randomTitle, isLoading: isTitleLoading, refetch: refetchTitle } = useRandomWikipediaTitle();

    useEffect(() => {
        const fetchAdminConsoleURL = async () => {
            const fetchedUrl = await getAdminConsoleURL();
            setAdminConsoleUrl(fetchedUrl);
        };
        fetchAdminConsoleURL();
    }, []);

    const onSubmit = async (data: FieldValues) => {
        try {
            const batch = data.challenges.map(async (input: ChallengeInput) => {
                if (input.date && input.startPage && input.endPage) {
                    const challengeData: DailyChallenge = {
                        startPage: input.startPage,
                        endPage: input.endPage,
                        totalCount: 0
                    };
                    await addDailyChallenge(format(input.date, 'yyyy-MM-dd'), challengeData);
                }
            });

            await Promise.all(batch);
            alert('데이터가 성공적으로 추가되었습니다.');
            // Reset form or handle success
        } catch (error) {
            console.error('Error adding documents: ', error);
            alert('데이터 추가 중 오류가 발생했습니다.');
        }
    };

    const addNewChallenge = () => {
        const lastChallenge = watchedChallenges[watchedChallenges.length - 1];
        const lastDate = lastChallenge?.date;
        const nextDate = lastDate ? addDays(lastDate, 1) : new Date();
        append({ date: nextDate, startPage: '', endPage: '' });
    };

    const handleBackToHome = () => {
        router.push('/');
    };

    const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

    const handleRandomTitle = async (index: number, field: 'startPage' | 'endPage') => {
        const loadingKey = `${index}-${field}`;
        setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
        try {
            const newTitle = await refetchTitle();
            if (newTitle) {
                setValue(`challenges.${index}.${field}`, newTitle);
            }
        } finally {
            setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
        }
    };

    const handleDateChange = (index: number, date: Date | undefined) => {
        setValue(`challenges.${index}.date`, date, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
        });
    };

    return (
        <div className="p-6 max-w-4xl w-full mx-auto">
            <div className="flex flex-row mb-8 space-x-4">
                <span className="text-2xl font-bold my-auto mr-auto">관리자 페이지</span>
                <Button variant="outline" onClick={handleBackToHome}>메인</Button>
                <Button variant="outline" onClick={() => openInNewTab(adminConsoleUrl ?? DEFAULT_CONSOLE_URL)}>Firebase Console</Button>
            </div>
            <h1 className="text-xl font-bold mb-4">챌린지 추가</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                {fields.map((field, index) => (
                    <Card key={field.id} className="mb-4 relative">
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={() => remove(index)}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <DatePickerWithToday
                                        onDateChange={(date) => handleDateChange(index, date)}
                                        value={watchedChallenges[index]?.date}
                                        placeholder="날짜 선택"
                                        className={cn(
                                            "w-full",
                                            errors.challenges?.[index]?.date && "border-red-500 focus:ring-red-500"
                                        )}
                                    />
                                    {errors.challenges?.[index]?.date && (
                                        <p className="mt-1 text-xs text-red-500">날짜를 선택해주세요</p>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        placeholder="시작 페이지"
                                        {...register(`challenges.${index}.startPage` as const, { required: true })}
                                        className={cn(
                                            "pr-10",
                                            errors.challenges?.[index]?.startPage && "border-red-500 focus:ring-red-500"
                                        )}
                                        disabled={loadingStates[`${index}-startPage`]}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full hover:bg-transparent focus:ring-0 focus:ring-offset-0"
                                        onClick={() => handleRandomTitle(index, 'startPage')}
                                        disabled={loadingStates[`${index}-startPage`]}
                                    >
                                        <RefreshCw className={cn("h-4 w-4", loadingStates[`${index}-startPage`] && "animate-spin")} />
                                    </Button>
                                    {/* {errors.challenges?.[index]?.startPage && (
                                        <p className="mt-1 text-xs text-red-500">시작 페이지를 입력해주세요</p>
                                    )} */}
                                </div>
                                <div className="relative">
                                    <Input
                                        placeholder="종료 페이지"
                                        {...register(`challenges.${index}.endPage` as const, { required: true })}
                                        className={cn(
                                            "pr-10",
                                            errors.challenges?.[index]?.endPage && "border-red-500 focus:ring-red-500"
                                        )}
                                        disabled={loadingStates[`${index}-endPage`]}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full hover:bg-transparent focus:ring-0 focus:ring-offset-0"
                                        onClick={() => handleRandomTitle(index, 'endPage')}
                                        disabled={loadingStates[`${index}-endPage`]}
                                    >
                                        <RefreshCw className={cn("h-4 w-4", loadingStates[`${index}-endPage`] && "animate-spin")} />
                                    </Button>
                                    {/* {errors.challenges?.[index]?.endPage && (
                                        <p className="mt-1 text-xs text-red-500">종료 페이지를 입력해주세요</p>
                                    )} */}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                <div className="mb-4 space-x-4">
                    <Button type="button" onClick={addNewChallenge}>새 챌린지 추가</Button>
                    <Button type="submit">적용</Button>
                </div>
            </form>
        </div>
    );
};

export default AdminScreen;