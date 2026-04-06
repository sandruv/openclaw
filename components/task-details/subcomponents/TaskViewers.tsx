'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AvatarGroup } from "@/components/ui/avatar-group"
import { Card } from "@/components/ui/card"
import { pusherClient } from '@/lib/pusher-client'
import { getInitials, getAvatarColor } from '@/lib/utils'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ViewerUser {
  id: number;
  name: string;
  email: string;
  socketId: string;
}

interface TaskViewersProps {
  taskId: number;
}

export function TaskViewers({ taskId }: TaskViewersProps) {
  const [viewers, setViewers] = useState<ViewerUser[]>([]);
  const taskIdRef = useRef(taskId);
  const channelRef = useRef<any>(null);

  // Update the ref when taskId changes
  useEffect(() => {
    taskIdRef.current = taskId;
  }, [taskId]);
  
  // Helper to get current user info from localStorage
  const getCurrentUserInfo = useCallback(() => {
    try {
      const userStr = localStorage.getItem('ywp_user')
      if (!userStr) return null
      
      const userData = JSON.parse(userStr)
      return {
        id: userData.id,
        name: `${userData.first_name} ${userData.last_name}`.trim(),
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name
      }
    } catch (error) {
      return null
    }
  }, []);

  // Handle viewer updates
  const handleViewersUpdate = useCallback((data: any) => {
    if (data.taskId === taskIdRef.current) {
      // Get current user info
      const currentUser = getCurrentUserInfo();
      
      // Filter out the current user from the viewers list
      const filteredViewers = data.viewers.filter((viewer: ViewerUser) => {
        // If we have a current user, filter by ID, otherwise show all
        return currentUser ? viewer.id !== currentUser.id : true;
      });
      
      setViewers(filteredViewers);
    }
  }, [getCurrentUserInfo]);

  useEffect(() => {
    if (!taskId) return;

    // Get current user info
    const currentUser = getCurrentUserInfo();
    if (!currentUser) return; // Don't proceed if we don't have user info

    // Subscribe to the task-specific channel
    const channelName = `presence-task-${taskId}`;
    const channel = pusherClient.subscribe(channelName);
    
    // Store ref to channel for cleanup
    channelRef.current = channel;
    
    // Handle member added (someone viewing the task)
    channel.bind('pusher:member_added', (member: any) => {
      // When a new member joins, we'll get updated viewers list from the server
    });
    
    // Handle viewer list updates
    channel.bind('task:viewers', handleViewersUpdate);
    
    // Also listen on the tasks-channel for updates
    const tasksChannel = pusherClient.subscribe('tasks-channel');
    tasksChannel.bind('task:update', (data: any) => {
      if (data.taskId === taskId && data.action === 'viewers_update') {
        handleViewersUpdate(data);
      }
    });

    // Announce this user is viewing the task via API
    // fetch(`/api/pusher/task-viewers/${taskId}/join`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     user: currentUser
    //   })
    // }).catch(err => {
    //   // Silently handle error
    // });
    
    // // Request current viewers list
    // fetch(`/api/pusher/task-viewers/${taskId}`)
    //   .then(res => res.json())
    //   .then(data => {
    //     if (data.success) {
    //       handleViewersUpdate({ taskId, viewers: data.viewers })
    //     }
    //   })
    //   .catch(err => {
    //     // Silently handle error
    //   });

    // Clean up when component unmounts or taskId changes
    return () => {
      // Announce this user is no longer viewing the task
      fetch(`/api/pusher/task-viewers/${taskId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: currentUser
        })
      }).catch(err => {
        // Silently handle error
      });
      
      // Clean up Pusher channels
      if (channelRef.current) {
        channelRef.current.unbind_all();
        pusherClient.unsubscribe(channelName);
      }
      tasksChannel.unbind('task:update');
      pusherClient.unsubscribe('tasks-channel');
    };
  }, [taskId, handleViewersUpdate, getCurrentUserInfo]);

  const hasViewers = viewers.length > 0;

  return (
    <div 
      className={cn(
        "fixed left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out",
        hasViewers ? "top-[-10px] opacity-100 translate-y-0 scale-100" : "top-[-100px] opacity-0 -translate-y-4 scale-95"
      )}
    >
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t-0 border-0 shadow-md px-4 pb-2 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <Users className="h-3 w-3" />
            <span>Viewing now:</span>
          </div>
          <TooltipProvider>
            <AvatarGroup limit={5}>
              {viewers.map((viewer) => {
                // Get a consistent color for this viewer based on their ID
                const avatarColor = getAvatarColor(viewer.id);
                
                return (
                  <Tooltip key={viewer.socketId}>
                    <TooltipTrigger asChild>
                      <Avatar className="h-8 w-8 border-2 border-background">
                        <AvatarFallback className={`${avatarColor} text-white`}>
                          <span className="text-xs">
                            {getInitials(viewer.name)}
                          </span>
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{viewer.name}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </AvatarGroup>
          </TooltipProvider>
        </div>
      </Card>
    </div>
  );
}
