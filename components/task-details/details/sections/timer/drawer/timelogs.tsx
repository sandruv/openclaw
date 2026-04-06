'use client'

import { useState, useEffect, useRef } from 'react'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { Trash2, Clock, ChevronDown, ChevronRight, PenLine, X, MoreVertical, Calendar, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { deleteTimeEntry } from '@/services/timerService'
import { formatDuration, formatDurationShort } from '@/lib/dateTimeFormat'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useTimerStore } from '@/stores/useTimerStore'
import { useTaskDetailsStore } from '@/stores/useTaskDetailsStore'
import { useToast } from '@/components/ui/toast-provider'
import { getErrorMessage, getAvatarColor } from '@/lib/utils'
import { User } from '@/types/clients'
import { TimeEntry } from '@/types/tasks'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function TimeLogs() {
  const { timeEntries, loadTimeEntries } = useTimerStore()
  const { task } = useTaskDetailsStore()
  const { showToast } = useToast()
  
  // Track which user sections are expanded
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({})
  // Track which entry is pending deletion
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  // Countdown timer for delete confirmation
  const [countdown, setCountdown] = useState<number>(5)
  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  // Track open dropdown menu
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  // Track deletion in progress
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  
  // Only show entries for the current task
  const filteredEntries = timeEntries
    .filter(entry => entry.ticket_id === task?.id)
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
  
  // Group entries by user
  const entriesByUser = filteredEntries.reduce((acc: Record<number, { user: User | null; entries: TimeEntry[] }>, entry: TimeEntry) => {
    const userId = entry.user_id;
    if (!acc[userId]) {
      acc[userId] = {
        user: entry.user || null,
        entries: []
      };
    }
    acc[userId].entries.push(entry);
    return acc;
  }, {} as Record<number, { user: User | null; entries: TimeEntry[] }>);

  // Format the time range
  const formatTimeRange = (entry: TimeEntry) => {
    const startDate = new Date(entry.start_time);
    const dayFormat = format(startDate, 'EEE, MMM d');
    const startTimeFormat = format(startDate, 'h:mm a');
    
    if (entry.end_time) {
      const endDate = new Date(entry.end_time);
      const endTimeFormat = format(endDate, 'h:mm a');
      return `${dayFormat}, ${startTimeFormat} - ${endTimeFormat}`;
    }
    
    return `${dayFormat}, ${startTimeFormat} - current`;
  };

  // Get user initials for avatar fallback
  const getUserInitials = (user: User | null) => {
    if (!user) return '??';
    return `${(user.first_name?.[0] || '').toUpperCase()}${(user.last_name?.[0] || '').toUpperCase()}`;
  };
  
  // Helper function to get Date object from either string or Date
  const getDateFromValue = (value: string | Date | null | undefined): Date => {
    if (value instanceof Date) return value;
    if (typeof value === 'string') return parseISO(value);
    return new Date();
  };
  
  // Toggle expanded state for a user section
  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };
  
  // Check if a user section is expanded (false by default)
  const isUserExpanded = (userId: string): boolean => {
    return expandedUsers[userId] === true;
  };

  // Start delete confirmation process
  const startDeleteConfirmation = (entryId: number) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Set the entry to be deleted
    setPendingDeleteId(entryId);
    setCountdown(5);
    
    // Start countdown
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Clear timer when countdown reaches 0
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          // Reset pending delete when timer expires
          setPendingDeleteId(null);
          setOpenMenuId(null);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Cancel delete confirmation
  const cancelDeleteConfirmation = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPendingDeleteId(null);
    setCountdown(5);
    setOpenMenuId(null);
  };
  
  // Handle dropdown menu open/close
  const handleMenuOpenChange = (open: boolean, entryId: number) => {
    if (open) {
      setOpenMenuId(entryId);
    } else if (openMenuId === entryId && !pendingDeleteId) {
      // Only close if we're not in delete confirmation mode
      setOpenMenuId(null);
    }
  };
  
  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Delete a time entry
  const handleDeleteEntry = async (entryId: number) => {
    try {
      if (!task?.id) {
        throw new Error('Task ID is required');
      }
      
      setIsDeleting(true);
      
      const response = await deleteTimeEntry(task.id, entryId);
      
      if (response.status === 200) {
        showToast({
          title: 'Deleted!',
          description: 'Time entry deleted successfully',
          type: 'success'
        });
        // Refresh time entries
        loadTimeEntries(task.id);
      } else {
        throw new Error(response.message || 'Failed to delete time entry');
      }
      
      // Reset state after successful deletion
      cancelDeleteConfirmation();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      showToast({
        title: 'Error',
        description: errorMessage,
        type: 'error'
      });
      cancelDeleteConfirmation();
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div>
      
      {Object.entries(entriesByUser).length === 0 && (
        <div className="text-center text-muted-foreground py-6">
          No time entries found
        </div>
      )}
      
      {Object.entries(entriesByUser).map(([userId, { user, entries }]) => {
        const isExpanded = isUserExpanded(userId);
        const totalDuration = entries.reduce((total, entry) => total + (entry.duration || 0), 0);
        const userColor = getAvatarColor(parseInt(userId));
        
        return (
          <div key={userId} className="space-y-2">
            {/* User header with total time - clickable to expand/collapse */}
            <div 
              className="flex items-center justify-between p-2 rounded hover:bg-accent/50 cursor-pointer"
              onClick={() => toggleUserExpanded(userId)}
            >
              <div className="flex items-center gap-2">
                {isExpanded ? 
                  <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                }
                <Avatar className="h-7 w-7">
                  <AvatarFallback className={cn("text-xs text-white", userColor)}>{getUserInitials(user)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">
                  {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : `User ${userId}`}
                </span>
              </div>
              <div className="text-sm font-mono">
                {formatDurationShort(totalDuration)}
              </div>
            </div>
            
            {/* Time entries - only shown when expanded */}
            {isExpanded && (
              <div className="space-y-2 ml-8">
                {entries.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="rounded-md border bg-card p-2 flex justify-between items-center"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Clock className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              {entry.entry_type === 'automatic' ? 'Automatic tracking' : 'Manual tracking'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeRange(entry)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 ml-5 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          created {formatDistanceToNow(getDateFromValue(entry.created_at), { addSuffix: false })} ago
                        </span>
                      </div>

                      {entry.description && (
                      <div className="flex items-center gap-2 ml-5 mt-1">
                        <PenLine className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{entry.description}</p>
                      </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono">{entry.duration ? formatDurationShort(entry.duration) : '—'}</span>
                      <DropdownMenu 
                        open={openMenuId === entry.id}
                        onOpenChange={(open) => handleMenuOpenChange(open, entry.id)}

                      >
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 hover:bg-accent/50"
                            disabled={isDeleting}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-auto translate-y-[-25px]">
                          {pendingDeleteId === entry.id ? (
                            <>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive focus:bg-destructive/10 hover:bg-destructive/10 cursor-pointer text-xs"
                                onClick={() => handleDeleteEntry(entry.id)}
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-2 w-2 mr-1 animate-spin" />
                                ) : (
                                  <Trash2 className="h-2 w-2 mr-1" />
                                )}
                                {isDeleting ? 'Deleting...' : `Confirm (${countdown})`}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={cancelDeleteConfirmation}
                                className="cursor-pointer text-xs hover:bg-gray-100"
                                disabled={isDeleting}
                              >
                                <X className="h-2 w-2 mr-1" />
                                Cancel
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive focus:bg-destructive/10 hover:bg-destructive/10 cursor-pointer text-xs"
                              onClick={() => startDeleteConfirmation(entry.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-2 w-2 mr-1" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
