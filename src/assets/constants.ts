import { differenceInDays, startOfDay } from "date-fns";

export const LINKLE_FIRST_DATE = new Date('2024-09-15T00:00:00Z');

export function calculateLinkleDayNumber() {
    const today = startOfDay(new Date());
    const firstDay = startOfDay(LINKLE_FIRST_DATE);
    const daysDifference = differenceInDays(today, firstDay);
    return daysDifference + 1; // 시작일을 1일째로 계산
}