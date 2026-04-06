'use client'

import { useEffect, useState, useCallback, useRef } from "react"
import { TableCell } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import pusherService from '@/services/pusherService'
import { getInitials, getAvatarColor } from "@/lib/utils"

interface ViewerUser {
  id: number
  name: string
  email: string
  socketId: string
  first_name?: string
  last_name?: string
  socket_id?: string
}

interface ViewersColumnProps {
  taskId: number
}

export function ViewersColumn({ taskId }: ViewersColumnProps) {
  const [viewers, setViewers] = useState<ViewerUser[]>([])
  const taskIdRef = useRef(taskId)
  
  // Update the ref when taskId changes
  useEffect(() => {
    taskIdRef.current = taskId
  }, [taskId])

  // Handle viewer updates
  const handleViewersUpdate = useCallback((data: any) => {
    if (data.taskId === taskIdRef.current) {      
      // Normalize viewer data format
      const normalizedViewers = data.viewers.map((viewer: ViewerUser) => ({
        id: viewer.id,
        name: viewer.name || `${viewer.first_name || ''} ${viewer.last_name || ''}`.trim(),
        email: viewer.email || '',
        socketId: viewer.socketId || viewer.socket_id || ''
      }))
      
      setViewers(normalizedViewers)
    }
  }, [])

  // Use refs to track polling and fetching state
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentTaskIdRef = useRef<number | null>(null)
  const isInitialFetchDoneRef = useRef(false)

  // Fetch viewers function - defined outside useEffect to avoid recreation on each render
  const fetchViewers = useCallback(() => {
    if (!taskIdRef.current) return
    
    pusherService.getTaskViewers(taskIdRef.current)
      .then((data: any) => {
        if (data.success) {
          handleViewersUpdate({ taskId: taskIdRef.current, viewers: data.viewers })
        }
      })
      .catch((err: any) => {
        // Silently handle errors
        console.error('Error fetching viewers:', err)
      })
  }, [handleViewersUpdate])
  
  // Set up event listener
  useEffect(() => {
    // This setup only needs to happen once
    const unsubscribeUpdates = pusherService.subscribeToTaskUpdates((data: any) => {
      if (data.taskId === taskIdRef.current && data.action === 'viewers_update') {
        fetchViewers() // Fetch updated viewers when notified of a change
      }
    })
    
    // Clean up
    return () => unsubscribeUpdates()
  }, [fetchViewers])
  
  // Handle taskId changes and polling - using a setup function pattern to avoid looping
  useEffect(() => {
    let isMounted = true;
    
    // Only proceed if there's a valid taskId
    if (!taskId) return;
    
    // Update the task ID reference
    taskIdRef.current = taskId;
    
    // Clear existing interval before setting up a new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Make initial fetch only if component is still mounted
    const performInitialFetch = async () => {
      if (isMounted) {
        try {
          await fetchViewers();
        } catch (error) {
          console.error('Initial fetch error:', error);
        }
      }
    };
    
    // Call initial fetch
    performInitialFetch();
    
    // DISABLED: Polling causes severe memory leaks with 100+ tasks
    // Rely on Pusher real-time events for updates instead
    // Set up a new polling interval
    // intervalRef.current = setInterval(() => {
    //   if (isMounted && taskIdRef.current === taskId) {
    //     fetchViewers();
    //   }
    // }, 10000);
    
    // Clean up function
    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [taskId, fetchViewers]);

  if (!viewers || viewers.length === 0) {
    return <TableCell className="w-[100px]" />
  }

  // Show up to 3 avatars, with a +X indicator if there are more
  const displayedViewers = viewers.slice(0, 3)
  const additionalViewers = viewers.length > 3 ? viewers.length - 3 : 0

  return (
    <TableCell className="w-[100px]">
      <div className="flex -space-x-2">
        <TooltipProvider>
          {displayedViewers.map((viewer) => (
            <Tooltip key={viewer.socketId || `viewer-${viewer.id}`}>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className={`${getAvatarColor(viewer.id)} text-white text-xs`}>
                    {getInitials(viewer.name)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{viewer.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {additionalViewers > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-background bg-muted">
                  <AvatarFallback className="bg-muted-foreground text-background text-xs">
                    +{additionalViewers}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{`${additionalViewers} more ${additionalViewers === 1 ? 'viewer' : 'viewers'}`}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
    </TableCell>
  )
}
