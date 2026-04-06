"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RealtimeUserInfo, Channel } from '@/lib/realtime/types';
import useRealtime from '@/hooks/useRealtime';

// Define a type that includes all possible properties we might need
type RealtimeService = {
  connectionInfo: any;
  subscribedChannels?: Channel[];
  getMembers?: (channelName: string) => Record<string, RealtimeUserInfo>;
  getMembersCount?: (channelName: string) => number;
  on?: (channelName: string, eventName: string, callback: Function) => Function;
  off?: (channelName: string, eventName: string, callback?: Function) => void;
  // Add any other properties you might need
  [key: string]: any;
};
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function ConnectedUsersCard() {
  // Get the realtime service hook and cast it to our flexible type using a two-step type assertion
  const realtime = useRealtime() as unknown as RealtimeService;
  
  // Create a local state for subscribed channels if needed
  const [subscribedChannels, setSubscribedChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [members, setMembers] = useState<Record<string, RealtimeUserInfo>>({});
  const [membersCount, setMembersCount] = useState(0);
  
  // Update subscribed channels
  useEffect(() => {
    const getChannels = () => {
      if (realtime.subscribedChannels) {
        return realtime.subscribedChannels;
      } else if (typeof realtime.getSubscribedChannels === 'function') {
        return realtime.getSubscribedChannels();
      } else {
        return [];
      }
    };
    
    // Initial fetch and periodic updates - reduced from 2s to 10s to prevent memory leaks
    setSubscribedChannels(getChannels());
    const intervalId = setInterval(() => {
      setSubscribedChannels(getChannels());
    }, 10000); // Changed from 2000ms to 10000ms
    
    return () => clearInterval(intervalId);
  }, [realtime]);
  
  // Filter just presence channels
  const presenceChannels = subscribedChannels.filter(channel => 
    channel.name.startsWith('presence-')
  );
  
  // Update selected channel when presence channels change
  useEffect(() => {
    if (presenceChannels.length > 0) {
      const channelName = presenceChannels[0].name;
      setSelectedChannel(channelName);
      
      // Safely get members for the selected channel
      if (typeof realtime.getMembers === 'function') {
        try {
          const channelMembers = realtime.getMembers(channelName) || {};
          setMembers(channelMembers);
          setMembersCount(Object.keys(channelMembers).length);
        } catch (e) {
          console.warn('Error getting members:', e);
          setMembers({});
          setMembersCount(0);
        }
      } else {
        setMembers({});
        setMembersCount(0);
      }
    } else {
      setSelectedChannel(null);
      setMembers({});
      setMembersCount(0);
    }
  }, [presenceChannels, realtime]);
  
  // Update members when selected channel changes
  useEffect(() => {
    if (selectedChannel) {
      // Set up periodic updates of members safely
      const updateMembers = () => {
        try {
          if (typeof realtime.getMembers === 'function') {
            const channelMembers = realtime.getMembers(selectedChannel) || {};
            setMembers(channelMembers);
            
            if (typeof realtime.getMembersCount === 'function') {
              setMembersCount(realtime.getMembersCount(selectedChannel));
            } else {
              setMembersCount(Object.keys(channelMembers).length);
            }
          }
        } catch (e) {
          console.warn('Error updating members:', e);
        }
      };
      
      // Update initially and then every 10 seconds - reduced from 2s to prevent memory leaks
      updateMembers();
      const interval = setInterval(updateMembers, 10000); // Changed from 2000ms to 10000ms
      
      return () => clearInterval(interval);
    }
  }, [selectedChannel, realtime]);
  
  // Handle channel selection change
  const handleChannelChange = (channelName: string) => {
    setSelectedChannel(channelName);
    
    // Safely access getMembers method
    let channelMembers: Record<string, RealtimeUserInfo> = {};
    try {
      if (typeof realtime.getMembers === 'function') {
        channelMembers = realtime.getMembers(channelName) || {};
      }
    } catch (e) {
      console.warn(`Error getting members for channel ${channelName}:`, e);
    }
    
    setMembers(channelMembers);
    setMembersCount(Object.keys(channelMembers).length);
  };
  
  // Helper function to get avatar color based on user ID
  const getAvatarColor = (id: string | number): string => {
    const colors = [
      'bg-rose-500',
      'bg-blue-500',
      'bg-emerald-500',
      'bg-amber-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-sky-500',
      'bg-cyan-500',
      'bg-violet-500'
    ];
    
    // Convert ID to string and get a consistent index
    const idStr = String(id);
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
      hash = ((hash << 5) - hash) + idStr.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Use absolute value and modulo to get index
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };
  
  // Helper function to get user initials
  const getUserInitials = (user: RealtimeUserInfo): string => {
    if (user.name) {
      const parts = user.name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    
    if (user.firstName && user.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return '#';
  };
  
  return (
    <Card className="bg-neutral-900 border-neutral-800 shadow-md overflow-hidden">
      <CardHeader className="pb-3 bg-neutral-950/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
            <div>
              <CardTitle className="text-lg font-mono text-white">Connected Users</CardTitle>
              <CardDescription className="text-neutral-400">
                Active in presence channels
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-950/50 text-emerald-300 border-emerald-700">
            {membersCount} {membersCount === 1 ? 'Member' : 'Members'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-5">
          {presenceChannels.length === 0 ? (
            <div className="text-sm text-neutral-500 rounded-md p-4 border border-dashed border-neutral-800 bg-neutral-900/50 text-center italic">
              No presence channels. Subscribe to a presence channel to see connected users.
            </div>
          ) : (
            <>
              {/* Channel selector */}
              {presenceChannels.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-neutral-800/30 rounded-md border border-neutral-800">
                  <div className="w-full text-xs text-neutral-400 mb-2 font-medium">Select Channel:</div>
                  {presenceChannels.map((channel) => (
                    <Badge
                      key={channel.name}
                      variant={selectedChannel === channel.name ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        selectedChannel === channel.name 
                          ? 'bg-sky-600 hover:bg-sky-700' 
                          : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                      }`}
                      onClick={() => handleChannelChange(channel.name)}
                    >
                      {channel.name}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Connected users list */}
              <div className="pt-2 border-t border-neutral-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <h3 className="text-sm font-medium text-white">Presence Members</h3>
                </div>
                {Object.keys(members).length === 0 ? (
                  <div className="flex gap-2 items-center justify-center p-4 bg-neutral-800/20 rounded-md border border-neutral-800/50">
                    <Avatar className="h-8 w-8 bg-neutral-800 animate-pulse">
                      <AvatarFallback className="text-neutral-500">...</AvatarFallback>
                    </Avatar>
                    <div className="text-xs text-neutral-400">
                      Waiting for members...
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3 items-center p-3 bg-neutral-800/20 rounded-md border border-neutral-800/50">
                    {Object.entries(members).map(([id, user]) => {
                      const initials = getUserInitials(user);
                      const name = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || `User ${id}`;
                      
                      return (
                        <Popover key={id}>
                          <PopoverTrigger asChild>
                            <button className="group relative">
                              <Avatar className="h-10 w-10 ring-2 ring-neutral-700 ring-offset-2 ring-offset-neutral-900 transition-all group-hover:ring-offset-neutral-800 group-hover:ring-neutral-600">
                                <AvatarFallback className={`${getAvatarColor(id)} text-white text-[0.9em] font-semibold shadow-md`}>
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-neutral-900"></span>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-4 bg-neutral-900 border-neutral-800 shadow-lg" side="bottom">
                            <div className="space-y-3">
                              <div className="flex items-center">
                                <Avatar className="h-14 w-14 mr-3 ring-2 ring-neutral-700 ring-offset-2 ring-offset-neutral-900">
                                  <AvatarFallback className={`${getAvatarColor(id)} text-white font-semibold`}>
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium text-white">{name}</h4>
                                  {user.email && (
                                    <p className="text-xs text-neutral-400">{user.email}</p>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs mt-1 bg-neutral-800/50 p-2 rounded-md border border-neutral-700/50">
                                <div className="font-medium text-neutral-300">ID:</div>
                                <div className="font-mono text-sky-300">{id}</div>
                                
                                {user.role && (
                                  <>
                                    <div className="font-medium text-neutral-300">Role:</div>
                                    <div>
                                      <Badge variant="outline" className="text-[10px] h-4 border-neutral-700 bg-neutral-800/50 text-neutral-300">
                                        {user.role}
                                      </Badge>
                                    </div>
                                  </>
                                )}
                                
                                {/* Display custom data if available */}
                                {(user as any).metadata && (
                                  <>
                                    <div className="font-medium text-neutral-300">Metadata:</div>
                                    <div className="font-mono text-xs text-neutral-400 truncate">
                                      {JSON.stringify((user as any).metadata)}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
