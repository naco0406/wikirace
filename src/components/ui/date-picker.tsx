"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useDatePicker } from "@/hooks/useDatePicker"
import { useCallback } from "react"

export function DatePickerDemo() {
    const [date, setDate] = React.useState<Date>()

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}

interface DatePickerWithTodayProps {
    onDateChange: (date: Date | undefined) => void
    value: Date | undefined
    className?: string
    todayButtonLabel?: string
    placeholder?: string
}

export function DatePickerWithToday({
    onDateChange,
    value,
    className,
    todayButtonLabel = "Today",
    placeholder = "Pick a date"
}: DatePickerWithTodayProps) {
    const handleDateChange = (newDate: Date | undefined) => {
        onDateChange(newDate);
    };

    const handleTodayClick = () => {
        onDateChange(new Date());
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(value, "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Button onClick={handleTodayClick} className="w-full mb-2">{todayButtonLabel}</Button>
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={handleDateChange}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}