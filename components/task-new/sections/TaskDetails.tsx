'use client'

import React, { useState, useMemo } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNewTaskStore } from "@/stores/useNewTaskStore"
import { useDropdownStore } from "@/stores/useDropdownStore"
import { cn } from "@/lib/utils"
import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TaskDetailsLoader } from "../loaders/TaskDetailsLoader"
import { TiptapEditorError } from "@/components/custom/loaders-errors/TiptapEditorError"
import { TiptapEditorSkeleton } from "@/components/custom/loaders-errors/TiptapEditorSkeleton"
import { logger } from '@/lib/logger'
import { PRIORITY_COLORS, TICKET_TYPE_COLORS, IMPACT_COLORS } from "@/constants/colors"
import { ValidationErrors } from "@/types/newTask"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { format, setHours, setMinutes } from "date-fns"

const TiptapEditor = dynamic(
  () => import('@/components/custom/TiptapEditor')
  .then(mod => mod.TiptapEditor).catch(err => {
    logger.error('Error loading TiptapEditor:', err)
    return () => <TiptapEditorError />
  }),
  { 
    ssr: false,
    loading: () => <TiptapEditorSkeleton />
})

interface TaskDetailsProps {
  errors: ValidationErrors
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ errors }) => {
  const { newTask, setNewTask } = useNewTaskStore()
  const { ticketTypes, priorities, impacts, isLoading } = useDropdownStore()
  const [calendarOpen, setCalendarOpen] = useState(false)

  const handleChange = (field: 'type' | 'priority' | 'impact') => (value: object) => {
    setNewTask({
      task: {
        ...newTask.task,
        [field]: value
      }
    })
  }

  // Handle datetime changes
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      // Preserve the current time when changing date
      const currentTime = newTask.task.time_of_request || new Date()
      const newDate = setHours(setMinutes(date, currentTime.getMinutes()), currentTime.getHours())
      setNewTask({
        task: {
          ...newTask.task,
          time_of_request: newDate
        }
      })
      setCalendarOpen(false)
    }
  }

  const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
    const currentDate = newTask.task.time_of_request || new Date()
    let newDate: Date
    
    if (type === 'hour') {
      newDate = setHours(currentDate, parseInt(value))
    } else {
      newDate = setMinutes(currentDate, parseInt(value))
    }
    
    setNewTask({
      task: {
        ...newTask.task,
        time_of_request: newDate
      }
    })
  }

  const handleAfterHoursChange = (afterHours: boolean) => {
    setNewTask({
      task: {
        ...newTask.task,
        after_hours: afterHours
      }
    })
  }

  // Generate hours and minutes for time selector
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), [])
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), [])

  return (
    <> 
      {isLoading ? (
        <TaskDetailsLoader />
      ) : (
        <>
          {/* Task Type and Time/Hours Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Task Type */}
            <div className="space-y-2 min-w-[500px]">
              <Label className="text-sm text-gray-400">Task Type</Label>
              <div className="flex flex-wrap gap-2">
                {ticketTypes.map((type) => {
                  const typeLabel = (type.label || '').toLowerCase()
                  const typeColor = TICKET_TYPE_COLORS[typeLabel as keyof typeof TICKET_TYPE_COLORS] || 'bg-gray-100'
                  const isSelected = newTask.task.type && newTask.task.type?.value === type.value
                  
                  return (
                    <Button
                      type="button"
                      key={type.value}
                      onClick={() => handleChange('type')(type)}
                      className={cn(
                        "h-8 px-4 text-sm hover:bg-gray-200 dark:hover:bg-gray-900/50 text-white",
                        isSelected
                          ? typeColor
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-400'
                      )}
                      data-testid={`task-type-${typeLabel}`}
                    >
                      {type.label || 'Unknown Type'}
                    </Button>
                  )
                })}
              </div>
              {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Time of Request */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-400">Time of Request</Label>
                <div className="flex gap-2 flex-wrap">
                  {/* Date Picker */}
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 justify-start text-left font-normal h-8 w-[120px]"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTask.task.time_of_request 
                          ? format(newTask.task.time_of_request, 'MMM d, yyyy')
                          : 'Select date'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newTask.task.time_of_request || undefined}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Time Selectors */}
                  <div className="flex items-center gap-1">
                    <Select
                      value={newTask.task.time_of_request ? newTask.task.time_of_request.getHours().toString() : '0'}
                      onValueChange={(value) => handleTimeChange('hour', value)}
                    >
                      <SelectTrigger className="w-16 h-8">
                        <SelectValue placeholder="HH" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        {hours.map((hour) => (
                          <SelectItem key={hour} value={hour.toString()}>
                            {hour.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-gray-400">:</span>
                    <Select
                      value={newTask.task.time_of_request ? newTask.task.time_of_request.getMinutes().toString() : '0'}
                      onValueChange={(value) => handleTimeChange('minute', value)}
                    >
                      <SelectTrigger className="w-16 h-8">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        {minutes.map((minute) => (
                          <SelectItem key={minute} value={minute.toString()}>
                            {minute.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* After Hours Toggle */}
              <div className="space-y-2 w-[200px] ml-auto">
                <Label className="text-sm text-gray-400">Hours: {newTask.task.after_hours ? 'After Hours' : 'Business Hours'}</Label>
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <Button
                    type="button"
                    onClick={() => handleAfterHoursChange(false)}
                    className={cn(
                      "h-8 px-4 text-sm flex-1",
                      !newTask.task.after_hours
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                    )}
                    title="Business Hours"
                  >
                    BH
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleAfterHoursChange(true)}
                    className={cn(
                      "h-8 px-4 text-sm flex-1",
                      newTask.task.after_hours
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                    )}
                    title="After Hours"
                  >
                    AH
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Input 
              id="summary" 
              placeholder="Task summary (required)"
              value={newTask.task.summary || ''}
              onChange={(e) => setNewTask({ task: { ...newTask.task, summary: e.target.value } })}
              className={cn(errors.summary && "border-red-500")}
              data-testid="task-summary-input"
            />
            {errors.summary && <p className="text-red-500 text-xs mt-1">{errors.summary}</p>}
          </div>
          <div className="space-y-2">
            <React.Suspense fallback={<div>Loading editor...</div>}>
              <TiptapEditor
                content={newTask.task.description}
                onChange={(content) => setNewTask({ task: { ...newTask.task, description: content } })}
                className="min-h-[200px] [&_.ProseMirror]:min-h-[150px]"
                data-testid="task-description-editor"
              />
            </React.Suspense>
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-400">Priority</Label>
              <div className="flex flex-wrap gap-2">
                {priorities.map((priority) => {
                  const priorityLabel = (priority.label || '').toLowerCase()
                  const priorityColor = PRIORITY_COLORS[priorityLabel as keyof typeof PRIORITY_COLORS] || 'bg-gray-100'
                  const isSelected = newTask.task.priority && newTask.task.priority?.value === priority.value
                  
                  return (
                    <Button
                      type="button"
                      key={priority.value}
                      onClick={() => handleChange('priority')(priority)}
                      className={cn(
                        "h-8 px-4 text-sm hover:bg-gray-200 dark:hover:bg-gray-900/50 text-white",
                        isSelected
                          ? priorityColor
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-400'
                      )}
                      data-testid={`priority-${priorityLabel}`}
                    >
                      {priority.label || 'Unknown Priority'}
                    </Button>
                  )
                })}
              </div>
              {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-400">Users Affected</Label>
              <div className="flex flex-wrap gap-2">
                {impacts.map((impact) => {
                  const impactLabel = (impact.label || '').toLowerCase()
                  const impactColor = IMPACT_COLORS[impactLabel as keyof typeof IMPACT_COLORS] || 'bg-gray-100'
                  const isSelected = newTask.task.impact && newTask.task.impact?.value === impact.value
                  
                  return (
                    <Button
                      type="button"
                      key={impact.value}
                      onClick={() => handleChange('impact')(impact)}
                      className={cn(
                        "h-8 px-4 text-sm hover:bg-gray-200 dark:hover:bg-gray-900/50 text-white",
                        isSelected
                          ? impactColor
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-400'
                      )}
                      data-testid={`impact-${impactLabel.replace(/\s+/g, '-')}`}
                    >
                      {impact.label || 'Unknown Impact'}
                    </Button>
                  )
                })}
              </div>
              {errors.impact && <p className="text-red-500 text-xs mt-1">{errors.impact}</p>}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default TaskDetails