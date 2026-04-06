'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { RoleProvider } from '@/lib/roleProvider';
import { realtimeService, AdapterType } from '@/lib/realtime';
import { LoggerPane, LogEntry } from '../system-initialization/LoggerPane';
import { AdminSkeleton } from '../system-initialization/Skeleton';
import { realtimeApiService } from '@/services/realtimeApiService';
import useRealtime from '@/hooks/useRealtime';
import { ChannelType, Channel } from '@/lib/realtime/types';
import { Radio } from 'lucide-react';
import { ConnectionStatusPanel } from './ConnectionStatusPanel';
import { AdapterSelectorPanel } from './AdapterSelectorPanel';
import { ChannelSubscriptionPanel } from './ChannelSubscriptionPanel';
import { EventSenderPanel } from './EventSenderPanel';

// Default values for quick testing
const DEFAULTS = {
  channelName: 'test-channel',
  eventName: 'test-event',
  eventData: JSON.stringify({ message: 'Hello from admin!', timestamp: new Date().toISOString() }, null, 2),
};

export function RealtimeStatusPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [adapterType, setAdapterType] = useState<string>('mock');
  const router = useRouter();
  const { user } = useAuth();
  
  // Connection state
  const [latency, setLatency] = useState<number | null>(null);
  const [isTestingLatency, setIsTestingLatency] = useState(false);
  
  // Channel subscription state
  const [channelName, setChannelName] = useState(DEFAULTS.channelName);
  const [channelType, setChannelType] = useState<ChannelType>(ChannelType.PUBLIC);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [localSubscribedChannels, setLocalSubscribedChannels] = useState<Channel[]>([]);
  
  // Event sender state
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [eventName, setEventName] = useState(DEFAULTS.eventName);
  const [eventData, setEventData] = useState(DEFAULTS.eventData);
  const [isSending, setIsSending] = useState(false);
  
  // Get realtime hook
  const realtime = useRealtime();
  const connectionInfo = realtime?.connectionInfo || { state: 'disconnected' };
  const isConnected = connectionInfo.state === 'connected';
  const subscribedChannels = realtime?.subscribedChannels || localSubscribedChannels;
  
  // Only allow access to admin users
  const isAdmin = user ? RoleProvider.isAdmin({
    ...user,
    role_id: typeof user.role_id === 'string' ? parseInt(user.role_id) : user.role_id
  }) : false;

  const addLog = useCallback((message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setLogs(prev => [...prev, { message, timestamp: new Date().toISOString(), type }]);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(
      typeof window !== 'undefined' ? window.location.search : ''
    );
    const adapterParam = urlParams.get('adapter');
    
    let selectedAdapter: AdapterType;
    switch (adapterParam?.toLowerCase()) {
      case 'pusher':
        selectedAdapter = AdapterType.PUSHER;
        break;
      case 'socketio':
        selectedAdapter = AdapterType.SOCKETIO;
        break;
      case 'mock':
        selectedAdapter = AdapterType.MOCK;
        break;
      default:
        selectedAdapter = (process.env.NEXT_PUBLIC_REALTIME_ADAPTER as AdapterType) || AdapterType.MOCK;
    }
    
    setAdapterType(selectedAdapter);
    
    realtimeService.initialize({
      adapterType: selectedAdapter,
      config: { debug: true }
    });
    
    realtimeService.connect();
    addLog(`Realtime service initialized with ${selectedAdapter} adapter`, 'info');
    
    setLoading(false);
    
    return () => {
      realtimeService.destroy();
    };
  }, [addLog]);

  // Update local subscribed channels from realtime hook
  useEffect(() => {
    if (realtime?.subscribedChannels) {
      setLocalSubscribedChannels(realtime.subscribedChannels);
    }
  }, [realtime?.subscribedChannels]);

  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/');
    }
  }, [user, isAdmin, router]);

  // Adapter change handler
  const handleAdapterChange = useCallback((value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('adapter', value);
    window.history.replaceState({}, '', url.toString());
    window.location.reload();
  }, []);

  // Latency test
  const testLatency = useCallback(async () => {
    setIsTestingLatency(true);
    addLog('Testing latency...', 'info');
    try {
      const start = performance.now();
      await realtimeApiService.ping();
      const end = performance.now();
      const result = Math.round(end - start);
      setLatency(result);
      addLog(`Latency: ${result}ms`, result < 100 ? 'success' : result < 300 ? 'warning' : 'error');
    } catch {
      addLog('Latency test failed', 'error');
      setLatency(null);
    } finally {
      setIsTestingLatency(false);
    }
  }, [addLog]);

  // Subscribe to channel
  const handleSubscribe = useCallback(async () => {
    if (!channelName.trim()) {
      addLog('Please enter a channel name', 'warning');
      return;
    }
    
    setIsSubscribing(true);
    addLog(`Subscribing to ${channelType}-${channelName}...`, 'info');
    
    try {
      let formattedName = channelName;
      if (channelType === ChannelType.PRESENCE) formattedName = `presence-${channelName}`;
      else if (channelType === ChannelType.PRIVATE) formattedName = `private-${channelName}`;
      
      if (realtime?.subscribe) {
        await realtime.subscribe(formattedName, { type: channelType });
        addLog(`Subscribed to ${formattedName}`, 'success');
      } else {
        throw new Error('Subscribe method not available');
      }
    } catch (error) {
      addLog(`Failed to subscribe: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsSubscribing(false);
    }
  }, [channelName, channelType, realtime, addLog]);

  // Unsubscribe from channel
  const handleUnsubscribe = useCallback(async (channel: string) => {
    try {
      if (realtime?.unsubscribe) {
        await realtime.unsubscribe(channel);
        addLog(`Unsubscribed from ${channel}`, 'success');
      }
    } catch (error) {
      addLog(`Failed to unsubscribe: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }, [realtime, addLog]);

  // Send event
  const handleSendEvent = useCallback(async () => {
    if (!selectedChannel) {
      addLog('Please select a channel', 'warning');
      return;
    }
    if (!eventName) {
      addLog('Please enter an event name', 'warning');
      return;
    }
    
    setIsSending(true);
    addLog(`Sending "${eventName}" to ${selectedChannel}...`, 'info');
    
    try {
      const data = JSON.parse(eventData);
      await realtimeApiService.triggerEvent(selectedChannel, eventName, data);
      addLog(`Event "${eventName}" sent successfully`, 'success');
    } catch (error) {
      addLog(`Failed to send event: ${error instanceof Error ? error.message : 'Invalid JSON or send error'}`, 'error');
    } finally {
      setIsSending(false);
    }
  }, [selectedChannel, eventName, eventData, addLog]);

  // Reset event data to defaults
  const resetEventData = useCallback(() => {
    setEventData(JSON.stringify({ message: 'Hello from admin!', timestamp: new Date().toISOString() }, null, 2));
    addLog('Event data reset to defaults', 'info');
  }, [addLog]);

  if (loading) {
    return <AdminSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="h-full flex bg-gray-100 dark:bg-[#1e1e1e]">
      {/* Left Pane - Main Content */}
      <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-[#3c3c3c] min-w-0 overflow-hidden">
        {/* Header Bar */}
        <div className="flex-shrink-0 h-10 bg-white dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center px-4">
          <Radio className="h-4 w-4 text-blue-500 mr-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-[#cccccc]">Realtime Status Dashboard</span>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Row 1: Connection Status + Adapter Selector */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ConnectionStatusPanel
              isConnected={isConnected}
              socketId={connectionInfo.socketId}
              latency={latency}
              isTestingLatency={isTestingLatency}
              onTestLatency={testLatency}
            />
            <AdapterSelectorPanel
              adapterType={adapterType}
              onAdapterChange={handleAdapterChange}
            />
          </div>
          
          {/* Row 2: Channel Subscription */}
          <ChannelSubscriptionPanel
            isConnected={isConnected}
            channelName={channelName}
            channelType={channelType}
            isSubscribing={isSubscribing}
            subscribedChannels={subscribedChannels}
            onChannelNameChange={setChannelName}
            onChannelTypeChange={setChannelType}
            onSubscribe={handleSubscribe}
            onUnsubscribe={handleUnsubscribe}
          />
          
          {/* Row 3: Event Sender */}
          <EventSenderPanel
            isConnected={isConnected}
            isSending={isSending}
            selectedChannel={selectedChannel}
            eventName={eventName}
            eventData={eventData}
            subscribedChannels={subscribedChannels}
            onSelectedChannelChange={setSelectedChannel}
            onEventNameChange={setEventName}
            onEventDataChange={setEventData}
            onSendEvent={handleSendEvent}
            onResetEventData={resetEventData}
          />
        </div>
      </div>

      {/* Right Pane - Logger */}
      <div className="w-[35%] flex-shrink-0 min-w-[280px] flex flex-col">
        <LoggerPane logs={logs} title="Activity Log" />
      </div>
    </div>
  );
}

export default RealtimeStatusPage;
