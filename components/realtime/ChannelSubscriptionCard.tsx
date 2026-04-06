"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChannelType, Channel } from '@/lib/realtime/types';
import useRealtime from '@/hooks/useRealtime';

// Define a type that includes all possible properties we might need
type RealtimeService = {
  connectionInfo: any;
  subscribeToChannel?: (channelName: string, options?: any) => Promise<any>;
  subscribe?: (channelName: string, options?: any) => Promise<any>;
  unsubscribeFromChannel?: (channelName: string) => Promise<any>;
  unsubscribe?: (channelName: string) => Promise<any>;
  subscribedChannels?: Channel[];
  getSubscribedChannels?: () => Channel[];
  formatPresenceChannel?: (channelName: string) => string;
  formatPrivateChannel?: (channelName: string) => string;
  // Add any other properties you might need
  [key: string]: any;
};
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function ChannelSubscriptionCard() {
  // Get the realtime service hook and cast it to our flexible type
  const realtime = useRealtime() as RealtimeService;
  
  // Extract properties safely with fallbacks
  const connectionInfo = realtime.connectionInfo;
  const subscribe = realtime.subscribeToChannel || realtime.subscribe;
  const unsubscribe = realtime.unsubscribeFromChannel || realtime.unsubscribe;
  
  // Create a safe local copy of subscribed channels
  const [subscribedChannels, setSubscribedChannels] = useState<Channel[]>([]);
  
  // Update channels when the connection changes
  useEffect(() => {
    // Function to get channels safely with fallbacks
    const getChannels = () => {
      // Try different possible properties/methods to get channels
      try {
        // First try the direct property if available
        if (realtime.subscribedChannels) {
          return realtime.subscribedChannels;
        }
        
        // Next try the getter method if available
        if (typeof realtime.getSubscribedChannels === 'function') {
          return realtime.getSubscribedChannels();
        }
        
        // Finally try a direct access to the service as a last resort
        if (typeof window !== 'undefined') {
          const service = (window as any).__realtimeService;
          if (service && typeof service.getSubscribedChannels === 'function') {
            return service.getSubscribedChannels();
          }
        }
      } catch (e) {
        console.warn('Error retrieving subscribed channels', e);
      }
      
      // Fallback to empty array if all else fails
      return [];
    };
    
    // Initial update
    setSubscribedChannels(getChannels());
    
    // Set up periodic updates - reduced from 2s to 10s to prevent memory leaks
    const intervalId = setInterval(() => {
      setSubscribedChannels(getChannels());
    }, 10000); // Changed from 2000ms to 10000ms
    
    return () => clearInterval(intervalId);
  }, [realtime]);
  
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState<ChannelType>(ChannelType.PUBLIC);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [withPresence, setWithPresence] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if connection is available
  const isConnected = connectionInfo.state === 'connected';
  
  // Handle subscription to channel
  const handleSubscribe = async () => {
    if (!channelName.trim()) {
      setError('Please enter a channel name');
      return;
    }
    
    setError(null);
    setIsSubscribing(true);
    
    try {
      // Format the channel name based on type
      let formattedChannelName = channelName;
      if (channelType === ChannelType.PRESENCE) {
        // Always use a safe fallback approach
        formattedChannelName = `presence-${channelName}`;
        // Try to use the proper formatter if available
        if (realtime.formatPresenceChannel) {
          try {
            formattedChannelName = realtime.formatPresenceChannel(channelName);
          } catch (e) {
            console.warn('Could not format presence channel name', e);
          }
        }
      } else if (channelType === ChannelType.PRIVATE) {
        // Always use a safe fallback approach
        formattedChannelName = `private-${channelName}`;
        // Try to use the proper formatter if available
        if (realtime.formatPrivateChannel) {
          try {
            formattedChannelName = realtime.formatPrivateChannel(channelName);
          } catch (e) {
            console.warn('Could not format private channel name', e);
          }
        }
      }
      
      // Subscribe to the channel safely with error handling
      if (typeof subscribe === 'function') {
        await subscribe(formattedChannelName, { type: channelType, withPresence });
      } else {
        throw new Error('No subscribe method available');
      }
      
      // Clear the channel name input
      setChannelName('');
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      setError(error instanceof Error ? error.message : 'Failed to subscribe to channel');
    } finally {
      setIsSubscribing(false);
    }
  };
  
  // Handle unsubscription from channel
  const handleUnsubscribe = async (channel: string) => {
    try {
      // Unsubscribe from the channel safely with error handling
      if (typeof unsubscribe === 'function') {
        await unsubscribe(channel);
      } else {
        throw new Error('No unsubscribe method available');
      }
    } catch (error) {
      console.error('Error unsubscribing from channel:', error);
      setError(error instanceof Error ? error.message : 'Failed to unsubscribe from channel');
    }
  };
  
  // Get the visual indicator for channel type
  const getChannelTypeIndicator = (type: ChannelType) => {
    switch (type) {
      case ChannelType.PRESENCE:
        return <Badge variant="outline" className="ml-2 bg-purple-950/50 text-purple-300 border-purple-700">Presence</Badge>;
      case ChannelType.PRIVATE:
        return <Badge variant="outline" className="ml-2 bg-blue-950/50 text-blue-300 border-blue-700">Private</Badge>;
      case ChannelType.PUBLIC:
      default:
        return <Badge variant="outline" className="ml-2 bg-emerald-950/50 text-emerald-300 border-emerald-700">Public</Badge>;
    }
  };
  
  return (
    <Card className="bg-neutral-900 border-neutral-800 shadow-md overflow-hidden">
      <CardHeader className="pb-3 bg-neutral-950/50">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-purple-500"></div>
          <CardTitle className="text-lg font-mono text-white">Channel Subscription</CardTitle>
        </div>
        <CardDescription className="text-neutral-400">
          Subscribe to realtime channels
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-5">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Enter channel name"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  disabled={!isConnected || isSubscribing}
                  className="bg-neutral-800 border-neutral-700 text-neutral-200 placeholder:text-neutral-500 focus-visible:ring-purple-600 focus-visible:ring-offset-neutral-900"
                />
              </div>
              
              <Select
                value={channelType}
                onValueChange={(value) => setChannelType(value as ChannelType)}
                disabled={!isConnected || isSubscribing}
              >
                <SelectTrigger className="w-[120px] border-neutral-700 bg-neutral-800 text-neutral-200 focus:ring-purple-600 focus:ring-offset-neutral-900">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-200">
                  <SelectItem value="public" className="focus:bg-neutral-700 focus:text-white data-[highlighted]:bg-neutral-700">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500"></div>Public
                    </div>
                  </SelectItem>
                  <SelectItem value="private" className="focus:bg-neutral-700 focus:text-white data-[highlighted]:bg-neutral-700">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>Private
                    </div>
                  </SelectItem>
                  <SelectItem value="presence" className="focus:bg-neutral-700 focus:text-white data-[highlighted]:bg-neutral-700">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500"></div>Presence
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 p-2 rounded-md bg-neutral-800/50 border border-neutral-700/50">
              <Switch
                id="presence-switch"
                checked={withPresence}
                onCheckedChange={setWithPresence}
                disabled={!isConnected || isSubscribing || channelType !== ChannelType.PRESENCE}
                className="data-[state=checked]:bg-purple-600"
              />
              <Label htmlFor="presence-switch" className="text-neutral-300 text-sm">Enable presence tracking</Label>
            </div>
            
            <Button
              onClick={handleSubscribe}
              disabled={!isConnected || isSubscribing || !channelName.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
            >
              {isSubscribing ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></div>
                  Subscribing...
                </div>
              ) : 'Subscribe'}
            </Button>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-900/50 text-red-300 rounded-md text-sm">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="mt-6 pt-3 border-t border-neutral-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-sky-500"></div>
              <h3 className="text-sm font-medium text-white">Subscribed Channels</h3>
              <Badge variant="outline" className="ml-auto bg-neutral-800 text-neutral-300 border-neutral-700">
                {subscribedChannels.length}
              </Badge>
            </div>
            
            {subscribedChannels.length === 0 ? (
              <div className="text-sm text-neutral-500 rounded-md p-3 border border-dashed border-neutral-800 bg-neutral-900/50 text-center italic">
                No active subscriptions
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                {subscribedChannels.map((channel: Channel) => (
                  <div
                    key={channel.name}
                    className="flex justify-between items-center p-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-md hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex items-center overflow-hidden">
                      <span className="text-sm font-mono text-neutral-300 truncate">{channel.name}</span>
                      {getChannelTypeIndicator(channel.type)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnsubscribe(channel.name)}
                      className="h-7 text-xs bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white min-w-[100px]"
                    >
                      Unsubscribe
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
