"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import useRealtime from '@/hooks/useRealtime';
import { AlertCircle, Send } from 'lucide-react';
import { realtimeApiService } from '@/services/realtimeApiService';
import { Channel } from '@/lib/realtime/types';

// Define a type that includes all possible properties we might need
type RealtimeService = {
  connectionInfo: any;
  triggerEvent?: (channelName: string, eventName: string, data: any) => Promise<any>;
  trigger?: (channelName: string, eventName: string, data: any) => Promise<any>;
  subscribedChannels?: Channel[];
  getSubscribedChannels?: () => Channel[];
  // Add any other properties you might need
  [key: string]: any;
};

export function EventSenderCard() {
  // Get the realtime service hook and cast it to our flexible type
  const realtime = useRealtime() as RealtimeService;
  
  // Extract properties safely with fallbacks
  const connectionInfo = realtime.connectionInfo;
  const triggerEvent = realtime.trigger || realtime.triggerEvent;
  
  // Create a local state for subscribed channels
  const [subscribedChannels, setSubscribedChannels] = useState<Channel[]>([]);
  
  // Other state variables
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [eventName, setEventName] = useState('');
  const [customEventName, setCustomEventName] = useState('');
  const [eventData, setEventData] = useState('{}');
  const [isSending, setIsSending] = useState(false);
  const [useApi, setUseApi] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Update channels when the connection changes
  useEffect(() => {
    // Function to get channels - adapt to what the hook actually provides
    const getChannels = () => {
      if (realtime.subscribedChannels) {
        return realtime.subscribedChannels;
      } else if (typeof realtime.getSubscribedChannels === 'function') {
        return realtime.getSubscribedChannels();
      } else {
        return [];
      }
    };
    
    // Initial update
    setSubscribedChannels(getChannels());
    
    // Set up periodic updates - reduced from 2s to 10s to prevent memory leaks
    const intervalId = setInterval(() => {
      setSubscribedChannels(getChannels());
    }, 10000); // Changed from 2000ms to 10000ms
    
    return () => clearInterval(intervalId);
  }, [realtime]);
  
  // Check if connection is available
  const isConnected = connectionInfo.state === 'connected';
  
  // Preset event types
  const presetEvents = [
    { name: 'Custom event...', value: 'custom' },
    { name: 'task:update', value: 'task:update' },
    { name: 'task:create', value: 'task:create' },
    { name: 'task:delete', value: 'task:delete' },
    { name: 'message', value: 'message' },
    { name: 'notification', value: 'notification' }
  ];
  
  // Parse JSON data or return default
  const parseEventData = () => {
    try {
      return JSON.parse(eventData);
    } catch (error) {
      setError('Invalid JSON data. Using empty object.');
      return {};
    }
  };
  
  // Handle sending an event
  const handleSendEvent = async () => {
    if (!selectedChannel) {
      setError('Please select a channel');
      return;
    }
    
    // Determine the actual event name (preset or custom)
    const actualEventName = eventName === 'custom' 
      ? customEventName
      : eventName;
      
    if (!actualEventName) {
      setError('Please enter an event name');
      return;
    }
    
    setError(null);
    setIsSending(true);
    
    try {
      const data = parseEventData();
      
      if (useApi) {
        // Send via API endpoint using the centralized service
        console.log('Sending event via API');
        try {
          await realtimeApiService.triggerEvent(selectedChannel, actualEventName, data);
        } catch (error: any) {
          throw new Error(error?.message || 'Failed to send event via API');
        }
      } else {
        // Send directly through client
        console.log('Sending event directly through client');
        // Safely handle possible undefined method
        if (typeof triggerEvent === 'function') {
          await triggerEvent(selectedChannel, actualEventName, data);
        } else {
          throw new Error('No trigger method available');
        }
      }
      
      // Reset form (optional)
      // setEventName('');
      // setEventData('{}');
    } catch (error) {
      console.error('Error sending event:', error);
      setError(error instanceof Error ? error.message : 'Failed to send event');
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Card className="bg-neutral-900 border-neutral-800 shadow-md overflow-hidden">
      <CardHeader className="pb-3 bg-neutral-950/50">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-purple-500"></div>
          <CardTitle className="text-lg font-mono text-white">Send Event</CardTitle>
        </div>
        <CardDescription className="text-neutral-400">
          Trigger realtime events on channels
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-5">
          <div className="flex flex-col gap-4">
            {/* Channel selector */}
            <div className="space-y-2">
              <Label htmlFor="channel-select" className="text-sm font-medium text-neutral-300">Channel</Label>
              <Select
                value={selectedChannel}
                onValueChange={setSelectedChannel}
                disabled={!isConnected || isSending || subscribedChannels.length === 0}
              >
                <SelectTrigger 
                  id="channel-select"
                  className="border-neutral-700 bg-neutral-800 text-neutral-200 focus:ring-purple-600 focus:ring-offset-neutral-900"
                >
                  <SelectValue placeholder="Select a channel" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-200">
                  {subscribedChannels.map((channel: Channel) => (
                    <SelectItem 
                      key={channel.name} 
                      value={channel.name}
                      className="focus:bg-neutral-700 focus:text-white data-[highlighted]:bg-neutral-700"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className={`h-2 w-2 rounded-full ${
                          channel.name.startsWith('presence-') ? 'bg-purple-500' : 
                          channel.name.startsWith('private-') ? 'bg-blue-500' : 'bg-emerald-500'
                        }`} />
                        <span className="truncate">{channel.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Event name selector */}
            <div className="space-y-2">
              <Label htmlFor="event-select" className="text-sm font-medium text-neutral-300">Event</Label>
              <div className="flex gap-2">
                <Select
                  value={eventName}
                  onValueChange={(value) => setEventName(value)}
                  disabled={!isConnected || isSending}
                >
                  <SelectTrigger 
                    className="flex-1 border-neutral-700 bg-neutral-800 text-neutral-200 focus:ring-purple-600 focus:ring-offset-neutral-900"
                  >
                    <SelectValue placeholder="Event type" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-200">
                    {presetEvents.map((event) => (
                      <SelectItem 
                        key={event.value} 
                        value={event.value}
                        className="focus:bg-neutral-700 focus:text-white data-[highlighted]:bg-neutral-700"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            event.value === 'custom' ? 'bg-neutral-400' :
                            event.value.includes('task') ? 'bg-blue-500' :
                            event.value === 'message' ? 'bg-purple-500' : 'bg-amber-500'
                          }`} />
                          {event.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {eventName === 'custom' && (
                  <Input
                    placeholder="Custom event name"
                    value={customEventName}
                    onChange={(e) => setCustomEventName(e.target.value)}
                    disabled={!isConnected || isSending}
                    className="flex-1 bg-neutral-800 border-neutral-700 text-neutral-200 placeholder:text-neutral-500 focus-visible:ring-purple-600 focus-visible:ring-offset-neutral-900"
                  />
                )}
              </div>
            </div>
            
            {/* Event data editor */}
            <div className="space-y-2">
              <Label htmlFor="event-data" className="text-sm font-medium text-neutral-300">Data (JSON)</Label>
              <Textarea
                id="event-data"
                placeholder='{ "key": "value" }'
                value={eventData}
                onChange={(e) => setEventData(e.target.value)}
                disabled={!isConnected || isSending}
                className="font-mono text-sm h-28 bg-neutral-800 border-neutral-700 text-neutral-200 placeholder:text-neutral-500 focus-visible:ring-purple-600 focus-visible:ring-offset-neutral-900"
              />
            </div>
            
            {/* Send options */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-neutral-800">
              <div className="flex items-center space-x-2 p-2 rounded-md bg-neutral-800/50 border border-neutral-700/50">
                <Switch
                  id="use-api"
                  checked={useApi}
                  onCheckedChange={setUseApi}
                  disabled={isSending}
                  className="data-[state=checked]:bg-purple-600"
                />
                <Label htmlFor="use-api" className="text-neutral-300 text-sm">Use server API</Label>
              </div>
              
              <Button
                onClick={handleSendEvent}
                disabled={!isConnected || isSending || !selectedChannel || !eventName}
                className="ml-auto bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all"
              >
                {isSending ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></div>
                    Sending...
                  </div>
                ) : (
                  <>
                    Send Event
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-900/50 text-red-300 rounded-md text-sm">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span>{error}</span>
            </div>
          )}
          
          {subscribedChannels.length === 0 && (
            <div className="text-sm text-amber-400 mt-2 p-3 rounded-md border border-dashed border-amber-800/50 bg-amber-950/20 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500"></div>
              <span>No channels available. Subscribe to a channel first.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
