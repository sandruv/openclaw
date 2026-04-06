'use client'

import { useMemo, useState } from 'react'
import { formatDuration } from '@/lib/dateTimeFormat'
import { format, addHours, differenceInHours, startOfHour, endOfHour, differenceInSeconds, startOfDay, endOfDay, addDays, isSameDay, isToday, parseISO, isValid } from 'date-fns'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { getAvatarColor } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TimeEntry } from '@/types/tasks'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

import { useTimerStore } from '@/stores/useTimerStore'
import { useTaskDetailsStore } from '@/stores/useTaskDetailsStore'

export function TimeFlow() {
  const { timeEntries } = useTimerStore()
  const { task } = useTaskDetailsStore()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarOpen, setCalendarOpen] = useState(false)
  
  // Extract all dates that have time entries for this task (either start or end on that date)
  const datesWithEntries = useMemo(() => {
    if (!task) return [];
    
    const uniqueDates = new Set<string>();
    
    timeEntries.forEach(entry => {
      if (entry.ticket_id === task.id) {
        // Add date from start time
        const entryStartDate = typeof entry.start_time === 'string' 
          ? parseISO(entry.start_time) 
          : entry.start_time;
          
        if (isValid(entryStartDate)) {
          uniqueDates.add(format(entryStartDate, 'yyyy-MM-dd'));
        }
        
        // Add date from end time if it exists
        if (entry.end_time) {
          const entryEndDate = typeof entry.end_time === 'string'
            ? parseISO(entry.end_time)
            : entry.end_time;
            
          if (isValid(entryEndDate)) {
            uniqueDates.add(format(entryEndDate, 'yyyy-MM-dd'));
          }
        }
      }
    });
    
    return Array.from(uniqueDates).map(dateStr => parseISO(dateStr));
  }, [timeEntries, task])
  
  // Show entries for the current task that either start on the selected day or end on the selected day
  const filteredEntries = useMemo(() => {
    return timeEntries.filter(entry => {
      if (entry.ticket_id !== task?.id) return false;
      
      // Handle both string and Date types for start_time
      const entryStartDate = typeof entry.start_time === 'string' 
        ? parseISO(entry.start_time) 
        : entry.start_time;
      
      // Check if entry starts on the selected day
      const startsOnSelectedDay = isSameDay(entryStartDate, selectedDate);
      
      // If there's an end time, check if it falls on the selected day
      if (entry.end_time) {
        const entryEndDate = typeof entry.end_time === 'string'
          ? parseISO(entry.end_time)
          : entry.end_time;
        
        const endsOnSelectedDay = isSameDay(entryEndDate, selectedDate);
        
        // Include entries that either start or end on the selected day
        return startsOnSelectedDay || endsOnSelectedDay;
      }
      
      // For entries without end time, just check the start date
      return startsOnSelectedDay;
    });
  }, [timeEntries, task, selectedDate])

  const { sortedEntries, userGroups } = useMemo(() => {
    const sorted = [...filteredEntries].sort((a, b) => {
      const aTime = typeof a.start_time === 'string' ? new Date(a.start_time) : a.start_time;
      const bTime = typeof b.start_time === 'string' ? new Date(b.start_time) : b.start_time;
      return aTime.getTime() - bTime.getTime();
    });
    
    // Group entries by user_id
    const groups = sorted.reduce((acc, entry) => {
      const userId = entry.user_id;
      if (!acc[userId]) {
        const userName = entry.user ? 
          `${entry.user.first_name || ''} ${entry.user.last_name || ''}`.trim() || entry.user.email : 
          `User ${entry.user_id}`;
          
        acc[userId] = {
          userId,
          userName,
          entries: []
        };
      }
      acc[userId].entries.push(entry);
      return acc;
    }, {} as Record<string | number, {userId: string | number, userName: string, entries: TimeEntry[]}> );
    
    return {
      sortedEntries: sorted,
      userGroups: Object.values(groups)
    };
  }, [filteredEntries]);

  // Find earliest and latest times to establish timeline boundaries - within a day
  const { startTime, endTime, timelineData } = useMemo(() => {
    // If no entries, use 12am to 11:59pm for the full day
    if (sortedEntries.length === 0) {
      const dayStart = new Date(selectedDate);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(selectedDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      return { 
        startTime: dayStart, 
        endTime: dayEnd,
        timelineData: [] 
      };
    }
    
    // Set boundaries to start of day 12am and end of day 11:59pm
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    // Find earliest start time within the selected day
    let startTime = dayStart;
    
    // Find latest end time - either from entries or current time for active entries
    let endTime = dayEnd;
    
    // Adjust start/end time based on actual entries if they extend beyond default hours
    sortedEntries.forEach(entry => {
      const entryStartTime = typeof entry.start_time === 'string' ? new Date(entry.start_time) : entry.start_time;
      if (entryStartTime < startTime && isSameDay(entryStartTime, selectedDate)) {
        startTime = startOfHour(entryStartTime);
      }
      
      if (entry.end_time) {
        const entryEndTime = typeof entry.end_time === 'string' ? new Date(entry.end_time) : entry.end_time;
        if (entryEndTime > endTime && isSameDay(entryEndTime, selectedDate)) {
          endTime = endOfHour(entryEndTime);
        }
      } else if (isToday(selectedDate)) {
        // For active entries on today, use current time
        const now = new Date();
        if (now > endTime) {
          endTime = endOfHour(now);
        }
      }
    });
    
    // Ensure at least one hour difference for visualization
    if (differenceInHours(endTime, startTime) < 1) {
      endTime = endOfHour(addHours(startTime, 1));
    }
    
    // Create entry data with position calculations
    const timelineData = sortedEntries.map(entry => {
      const entryStartTime = typeof entry.start_time === 'string' ? new Date(entry.start_time) : entry.start_time;
      const entryEndTime = entry.end_time ? 
        (typeof entry.end_time === 'string' ? new Date(entry.end_time) : entry.end_time) : 
        new Date();
      
      // Calculate position and width as percentages
      const timelineStart = startTime.getTime();
      const timelineEnd = endTime.getTime();
      const timelineLength = timelineEnd - timelineStart;
      
      const left = ((entryStartTime.getTime() - timelineStart) / timelineLength) * 100;
      const width = ((entryEndTime.getTime() - entryStartTime.getTime()) / timelineLength) * 100;
      
      // Calculate duration in seconds for the formatDuration function
      const durationInSeconds = differenceInSeconds(entryEndTime, entryStartTime);
      
      return {
        ...entry,
        startTime: entryStartTime,
        endTime: entryEndTime,
        duration: durationInSeconds,
        left: `${left}%`, 
        width: `${Math.max(width, 0.5)}%`, // Ensure minimum width for visibility
        // Use color based on user ID and adjust opacity based on entry type
        color: `${getAvatarColor(entry.user_id)} ${entry.entry_type === 'automatic' ? 'opacity-70' : 'opacity-90'}`,
        user: entry.user ? 
          `${entry.user.first_name || ''} ${entry.user.last_name || ''}`.trim() || entry.user.email : 
          `User ${entry.user_id}`
      };
    });
    
    return { startTime, endTime, timelineData };
  }, [sortedEntries, selectedDate])

  // Generate hour labels for the timeline
  const hourLabels = useMemo(() => {
    if (!startTime || !endTime) return [];
    
    const totalHours = differenceInHours(endTime, startTime) + 1;
    const labels = [];
    
    // Determine how many labels to show based on timeline length
    const maxLabels = 12; // Maximum number of hour labels to show
    const interval = totalHours <= maxLabels ? 1 : Math.ceil(totalHours / maxLabels);
    
    for (let i = 0; i <= totalHours; i += interval) {
      const time = addHours(startTime, i);
      // Skip if we're beyond the end time
      if (time > endTime) continue;
      
      const position = (i / totalHours) * 100;
      labels.push({
        time,
        formattedTime: format(time, 'h:mm a'),
        position: `${position}%`
      });
    }
    
    // Make sure we include the end time
    if (labels.length > 0 && labels[labels.length - 1].time < endTime) {
      labels.push({
        time: endTime,
        formattedTime: format(endTime, 'h:mm a'),
        position: '100%'
      });
    }
    
    return labels;
  }, [startTime, endTime]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        {/* Date navigation controls */}
        <div className="flex items-center space-x-2">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen} modal={true}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[150px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setCalendarOpen(false);
                  }
                }}
                disabled={(date) => {
                  // Only allow dates with entries to be selected
                  return !datesWithEntries.some(entryDate => 
                    isSameDay(date, entryDate)
                  );
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          {!isToday(selectedDate) && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setSelectedDate(new Date())}
              className="ml-1"
            >
              Today
            </Button>
          )}
        </div>

        {/* User count indicator */}
        {userGroups.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {userGroups.length} {userGroups.length === 1 ? 'user' : 'users'} tracked time
          </div>
        )}
      </div>
      
      {timelineData.length > 0 ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Timeline visualization */}
          <div className="flex-grow flex flex-col overflow-auto styled-scrollbar">
            {/* Timeline header with hour labels */}
            <div className="relative h-8 border-b mb-2">
              {hourLabels.map((label, idx) => (
                <div 
                  key={idx} 
                  className="absolute top-0 -ml-[1px] h-full flex flex-col items-center"
                  style={{ left: label.position }}
                >
                  <div className="w-[1px] h-2 bg-muted-foreground"></div>
                  <span className="text-xs text-muted-foreground">{label.formattedTime}</span>
                </div>
              ))}
            </div>
            
            {/* Timeline entries - organized by user */}
            <div className="relative w-full flex-grow overflow-hidden">
              <div className="absolute inset-0">
                <TooltipProvider>
                  {userGroups.map((userGroup, groupIdx) => (
                    <div 
                      key={userGroup.userId} 
                      className="relative mb-8 pb-1 border-b border-gray-100"
                    >
                      {/* User row indicator - small colored dot */}
                      <div className="absolute -left-2 top-1 flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getAvatarColor(userGroup.userId)}`}></div>
                      </div>
                      
                      {/* User's time entries */}
                      <div className="relative mt-6"> {/* Space for the user name */}
                        {timelineData
                          .filter(entry => entry.user_id === userGroup.userId)
                          .map((entry, idx) => (
                            <Tooltip key={idx}>
                              <TooltipTrigger asChild>
                                <div 
                                  className={`absolute rounded-sm h-7 ${entry.color} hover:opacity-100 cursor-pointer transition-opacity`}
                                  style={{ 
                                    left: entry.left, 
                                    width: entry.width,
                                    top: 0
                                  }}
                                >
                                  {parseFloat(entry.width) > 5 && (
                                    <span className="px-1 text-xs text-white truncate">
                                      {entry.duration ? formatDuration(entry.duration) : 'In progress'}
                                    </span>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <div className="text-xs space-y-1 p-2 px-1">
                                  <div><strong>Start:</strong> {format(entry.startTime, 'MMM d, h:mm a')}</div>
                                  <div><strong>Duration:</strong> {entry.duration ? formatDuration(entry.duration) : 'In progress'}</div>
                                  <div><strong>Type:</strong> {entry.entry_type === 'automatic' ? 'Automatic' : 'Manual'}</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                      </div>
                    </div>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col">
          <p>No time entries for {isToday(selectedDate) ? 'today' : format(selectedDate, 'MMM d, yyyy')}</p>
          {!isToday(selectedDate) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedDate(new Date())}
              className="mt-2"
            >
              Return to Today
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
