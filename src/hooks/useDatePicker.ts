import { useState, useCallback } from 'react'

export const useDatePicker = (initialDate?: Date) => {
    const [date, setDate] = useState<Date | undefined>(initialDate)

    const handleDateChange = useCallback((newDate: Date | undefined) => {
        setDate(newDate)
    }, [])

    const handleTodayClick = useCallback(() => {
        setDate(new Date())
    }, [])

    return { date, handleDateChange, handleTodayClick }
}