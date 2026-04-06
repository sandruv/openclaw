"use client"

import { useState, useEffect, useCallback } from 'react';
import { pusherClient } from '@/lib/pusher-client';
import { Channel } from 'pusher-js';

interface UsePusherChannelProps {
  channelName: string;
  eventName: string;
  onEvent?: (data: any) => void;
  autoSubscribe?: boolean;
}

interface UsePusherChannelResult {
  channel: Channel | null;
  isSubscribed: boolean;
  subscribe: () => void;
  unsubscribe: () => void;
  trigger: (eventName: string, data: any) => Promise<void>;
  lastEvent: any;
  error: Error | null;
}

/**
 * Hook for subscribing to and interacting with a Pusher channel
 */
export function usePusherChannel({
  channelName,
  eventName,
  onEvent,
  autoSubscribe = true,
}: UsePusherChannelProps): UsePusherChannelResult {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to the channel
  const subscribe = useCallback(() => {
    try {
      if (isSubscribed) return;
      
      const newChannel = pusherClient.subscribe(channelName);
      console.log(`Subscribed to Pusher channel: ${channelName}`);
      
      setChannel(newChannel);
      setIsSubscribed(true);
      setError(null);
    } catch (err) {
      console.error(`Error subscribing to channel ${channelName}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [channelName, isSubscribed]);

  // Unsubscribe from the channel
  const unsubscribe = useCallback(() => {
    if (!isSubscribed || !channel) return;
    
    try {
      pusherClient.unsubscribe(channelName);
      console.log(`Unsubscribed from Pusher channel: ${channelName}`);
      
      setChannel(null);
      setIsSubscribed(false);
    } catch (err) {
      console.error(`Error unsubscribing from channel ${channelName}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [channel, channelName, isSubscribed]);

  // Trigger an event on this channel (via an API endpoint)
  const trigger = useCallback(async (eventToTrigger: string, data: any) => {
    try {
      // Pusher client libraries can't trigger events directly due to security reasons
      // We need to use the server to trigger events
      const response = await fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: channelName,
          event: eventToTrigger,
          data,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to trigger event');
      }
      
      console.log(`Triggered event ${eventToTrigger} on channel ${channelName}`);
    } catch (err) {
      console.error(`Error triggering event ${eventToTrigger}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }, [channelName]);

  // Set up event listener
  useEffect(() => {
    if (!channel) return;
    
    const handleEvent = (data: any) => {
      console.log(`Received event ${eventName} on channel ${channelName}:`, data);
      setLastEvent(data);
      
      if (onEvent) {
        onEvent(data);
      }
    };
    
    // Bind to the event
    channel.bind(eventName, handleEvent);
    
    // Clean up
    return () => {
      channel.unbind(eventName, handleEvent);
    };
  }, [channel, eventName, channelName, onEvent]);

  // Auto-subscribe on mount if enabled
  useEffect(() => {
    if (autoSubscribe) {
      subscribe();
    }
    
    // Clean up on unmount
    return () => {
      if (isSubscribed) {
        unsubscribe();
      }
    };
  }, [autoSubscribe, subscribe, unsubscribe, isSubscribed]);

  return {
    channel,
    isSubscribed,
    subscribe,
    unsubscribe,
    trigger,
    lastEvent,
    error,
  };
}

export default usePusherChannel;
