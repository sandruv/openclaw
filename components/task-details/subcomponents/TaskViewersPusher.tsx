'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AvatarGroup } from "@/components/ui/avatar-group"
import { Card } from "@/components/ui/card"
import { getInitials, getAvatarColor } from '@/lib/utils'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { pusherClient } from '@/lib/pusher-client'
import { useAuth } from '@/contexts/AuthContext'

interface ViewerUser {
  id: number;
  name: string;
  email: string;
  initials?: string;
  role?: string;
}

interface TaskViewersPusherProps {
  taskId: number;
}

export function TaskViewersPusher({ taskId }: TaskViewersPusherProps) {
  const [viewers, setViewers] = useState<ViewerUser[]>([]);
  const { user: currentUser } = useAuth();
  const taskIdRef = useRef(taskId);
  const channelRef = useRef<any>(null);
  
  // Update the ref when taskId changes
  useEffect(() => {
    taskIdRef.current = taskId;
  }, [taskId]);

  // Subscribe to Pusher channel and manage viewers
  useEffect(() => {
    // Skip if no taskId or no current user
    if (!taskId || !currentUser) return;

    // Create a presence channel name for this task
    const channelName = `presence-task-${taskId}`;
    
    console.log(`Subscribing to Pusher channel: ${channelName}`);
    
    // Subscribe to the presence channel
    const channel = pusherClient.subscribe(channelName);
    channelRef.current = channel;

    // When successfully subscribed to the presence channel
    channel.bind('pusher:subscription_succeeded', (members: any) => {
      console.log(`Successfully subscribed to ${channelName}, ${members.count} members`);
      
      // Process existing members
      const channelViewers: ViewerUser[] = [];
      
      members.each((member: any) => {
        // Skip current user
        if (member.id === currentUser.id.toString()) return;
        
        // Add other members to the viewers list
        channelViewers.push({
          id: parseInt(member.id, 10),
          name: member.info?.name || 'Unknown User',
          email: member.info?.email || '',
          initials: member.info?.initials,
          role: member.info?.role
        });
      });
      
      setViewers(channelViewers);
    });

    // Member added - add to viewers list
    channel.bind('pusher:member_added', (member: any) => {
      console.log('Member added to channel:', member);
      
      // Skip if it's the current user
      if (member.id === currentUser.id.toString()) return;
      
      // Get user ID as a number for consistency
      const memberId = parseInt(member.id, 10);
      
      // Add to viewers list only if not already present (deduplication)
      setViewers(prev => {
        // Check if this member is already in the list
        const existingMember = prev.find(viewer => viewer.id === memberId);
        if (existingMember) {
          console.log('Member already in viewers list, skipping duplicate', memberId);
          return prev; // Return unchanged list if already present
        }
        
        // Add new member to list
        return [
          ...prev,
          {
            id: memberId,
            name: member.info?.name || 'Unknown User',
            email: member.info?.email || '',
            initials: member.info?.initials,
            role: member.info?.role
          }
        ];
      });
    });

    // Member removed - remove from viewers list
    channel.bind('pusher:member_removed', (member: any) => {
      console.log('Member removed from channel:', member);
      setViewers(prev => prev.filter(viewer => viewer.id !== parseInt(member.id, 10)));
    });

    // Clean up when component unmounts or taskId changes
    return () => {
      console.log(`Unsubscribing from Pusher channel: ${channelName}`);
      pusherClient.unsubscribe(channelName);
    };
  }, [taskId, currentUser]);

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
                  <Tooltip key={`viewer-${viewer.id}`}>
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
