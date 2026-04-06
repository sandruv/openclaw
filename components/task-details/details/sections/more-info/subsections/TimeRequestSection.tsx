'use client'

import { useState } from 'react'
import { Task } from "@/types/tasks"
import { SkeletonText } from "@/components/ui/skeleton-inline"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarIcon } from "lucide-react"
import { format, setHours, setMinutes, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/dateTimeFormat"

interface TimeRequestSectionProps {
  task: Task
  editMode: boolean
  isNavigating: boolean
  isSubmitting: boolean
  selectedTimeOfRequest: Date | null
  selectedAfterHours: boolean
  setSelectedTimeOfRequest: (date: Date | null) => void
  setSelectedAfterHours: (afterHours: boolean) => void
}

export function TimeRequestSection({
  task,
  editMode,
  isNavigating,
  isSubmitting,
  selectedTimeOfRequest,
  selectedAfterHours,
  setSelectedTimeOfRequest,
  setSelectedAfterHours
}: TimeRequestSectionProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Handle date change from calendar
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const currentTime = selectedTimeOfRequest || new Date()
      const newDate = setHours(setMinutes(date, currentTime.getMinutes()), currentTime.getHours())
      setSelectedTimeOfRequest(newDate)
      setCalendarOpen(false)
    }
  }

  // Handle time changes
  const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
    const currentDate = selectedTimeOfRequest || new Date()
    let newDate: Date
    
    if (type === 'hour') {
      newDate = setHours(currentDate, parseInt(value))
    } else {
      newDate = setMinutes(currentDate, parseInt(value))
    }
    
    setSelectedTimeOfRequest(newDate)
  }

  // Generate hours and minutes arrays
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 60 }, (_, i) => i)

  const timeOfRequestStr = task.time_of_request ? formatDateTime(task.time_of_request) : 'Not set'
  const afterHoursLabel = task.after_hours ? 'After Hours' : 'Business Hours'

  return (
    <div className="space-y-4">
      {/* Time of Request */}
      <div className="space-y-1">
        <div className="text-muted-foreground text-xs">Time of Request</div>
        <SkeletonText isLoading={isNavigating} className="w-40 h-4">
          <div className="text-sm">{timeOfRequestStr}</div>
        </SkeletonText>
      </div>

      {/* After Hours */}
      <div className="space-y-1">
        <div className="text-muted-foreground text-xs">Hours</div>
        {editMode ? (
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
            <Button
              type="button"
              onClick={() => setSelectedAfterHours(false)}
              disabled={isSubmitting}
              className={cn(
                "h-8 px-4 text-sm",
                !selectedAfterHours
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              )}
              title="Business Hours"
            >
              BH
            </Button>
            <Button
              type="button"
              onClick={() => setSelectedAfterHours(true)}
              disabled={isSubmitting}
              className={cn(
                "h-8 px-4 text-sm",
                selectedAfterHours
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              )}
              title="After Hours"
            >
              AH
            </Button>
          </div>
        ) : (
          <SkeletonText isLoading={isNavigating} className="w-24 h-4">
            <div className={cn(
              "text-sm inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
              task.after_hours 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            )}>
              {afterHoursLabel}
            </div>
          </SkeletonText>
        )}
      </div>
    </div>
  )
}
