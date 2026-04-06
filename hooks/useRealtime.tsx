"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Channel,
  ChannelOptions,
  ChannelType,
  ConnectionInfo,
  ConnectionState,
  RealtimeEvent,
  RealtimeListener,
  RealtimeUserInfo
} from '@/lib/realtime/types';
import realtimeService from '@/lib/realtime/realtime-service';
import { AdapterType } from '@/lib/realtime/adapter-factory';

interface UseRealtimeResult {
  // Connection
  connectionInfo: ConnectionInfo;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  
  // Channels
  subscribe: (channelName: string, options?: ChannelOptions) => Promise<Channel>;
  unsubscribe: (channelName: string) => Promise<void>;
  subscribedChannels: Channel[];
  
  // Events
  on: (channelName: string, eventName: RealtimeEvent, listener: RealtimeListener) => () => void;
  off: (channelName: string, eventName: RealtimeEvent, listener?: RealtimeListener) => void;
  trigger: (channelName: string, eventName: RealtimeEvent, data: any) => Promise<void>;
  
  // Presence
  getMembers: (channelName: string) => Record<string, RealtimeUserInfo>;
  getMembersCount: (channelName: string) => number;
  
  // Utility
  adapterType: AdapterType | null;
  formatPresenceChannel: (channelName: string) => string;
  formatPrivateChannel: (channelName: string) => string;
}

/**
 * React hook for using the realtime service in components
 */
export function useRealtime(autoConnect: boolean = true): UseRealtimeResult {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>(
    realtimeService.getConnectionInfo()
  );
  const [subscribedChannels, setSubscribedChannels] = useState<Channel[]>([]);
  const adapterType = realtimeService.getAdapterType();
  
  // Reference to track mounted state
  const isMounted = useRef(true);
  
  // Update connection info and subscribed channels periodically
  useEffect(() => {
    isMounted.current = true;
    
    // Connect if auto-connect is enabled
    if (autoConnect) {
      realtimeService.connect();
    }
    
    // Set up periodic updates
    const intervalId = setInterval(() => {
      if (isMounted.current) {
        setConnectionInfo(realtimeService.getConnectionInfo());
        setSubscribedChannels(realtimeService.getSubscribedChannels());
      }
    }, 1000);
    
    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
    };
  }, [autoConnect]);
  
  // Refresh connection info immediately when it changes
  const updateConnectionInfo = useCallback(() => {
    if (isMounted.current) {
      setConnectionInfo(realtimeService.getConnectionInfo());
    }
  }, []);
  
  // Refresh subscribed channels list
  const updateSubscribedChannels = useCallback(() => {
    if (isMounted.current) {
      setSubscribedChannels(realtimeService.getSubscribedChannels());
    }
  }, []);
  
  // Connect to the service
  const connect = useCallback(async () => {
    await realtimeService.connect();
    updateConnectionInfo();
  }, [updateConnectionInfo]);
  
  // Disconnect from the service
  const disconnect = useCallback(async () => {
    await realtimeService.disconnect();
    updateConnectionInfo();
  }, [updateConnectionInfo]);
  
  // Subscribe to a channel
  const subscribe = useCallback(async (channelName: string, options?: ChannelOptions) => {
    const channel = await realtimeService.subscribe(channelName, options);
    updateSubscribedChannels();
    return channel;
  }, [updateSubscribedChannels]);
  
  // Unsubscribe from a channel
  const unsubscribe = useCallback(async (channelName: string) => {
    await realtimeService.unsubscribe(channelName);
    updateSubscribedChannels();
  }, [updateSubscribedChannels]);
  
  // Listen for events
  const on = useCallback((channelName: string, eventName: RealtimeEvent, listener: RealtimeListener) => {
    return realtimeService.on(channelName, eventName, listener);
  }, []);
  
  // Stop listening for events
  const off = useCallback((channelName: string, eventName: RealtimeEvent, listener?: RealtimeListener) => {
    realtimeService.off(channelName, eventName, listener);
  }, []);
  
  // Trigger an event
  const trigger = useCallback(async (channelName: string, eventName: RealtimeEvent, data: any) => {
    await realtimeService.trigger(channelName, eventName, data);
  }, []);
  
  // Get members of a presence channel
  const getMembers = useCallback((channelName: string) => {
    return realtimeService.getMembers(channelName);
  }, []);
  
  // Get members count of a presence channel
  const getMembersCount = useCallback((channelName: string) => {
    return realtimeService.getMembersCount(channelName);
  }, []);
  
  // Format a presence channel name
  const formatPresenceChannel = useCallback((channelName: string) => {
    return realtimeService.formatChannelName(channelName, ChannelType.PRESENCE);
  }, []);
  
  // Format a private channel name
  const formatPrivateChannel = useCallback((channelName: string) => {
    return realtimeService.formatChannelName(channelName, ChannelType.PRIVATE);
  }, []);
  
  return {
    connectionInfo,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    subscribedChannels,
    on,
    off,
    trigger,
    getMembers,
    getMembersCount,
    adapterType,
    formatPresenceChannel,
    formatPrivateChannel
  };
}

export default useRealtime;
