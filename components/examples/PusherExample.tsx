"use client"

import React, { useState, useEffect } from 'react';
import { usePusherChannel } from '@/hooks/usePusherChannel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageData {
  text: string;
  _meta?: {
    userId: number;
    userName: string;
    timestamp: string;
  };
  [key: string]: any;
}

const PusherExample = () => {
  const [channelName, setChannelName] = useState('presence-general');
  const [eventName, setEventName] = useState('message');
  const [message, setMessage] = useState('');
  const [jsonData, setJsonData] = useState('{\n  "text": "Hello, world!"\n}');
  const [events, setEvents] = useState<MessageData[]>([]);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const { user } = useAuth();

  // Handle incoming Pusher events
  const handleEvent = (data: MessageData) => {
    setEvents(prev => [data, ...prev].slice(0, 50)); // Keep last 50 events
  };

  // Use our custom hook to connect to Pusher
  const {
    channel,
    isSubscribed,
    subscribe,
    unsubscribe,
    trigger,
    lastEvent,
    error
  } = usePusherChannel({
    channelName,
    eventName,
    onEvent: handleEvent,
    autoSubscribe: true
  });

  // Send a message through Pusher
  const handleSendMessage = async () => {
    try {
      let data: any;
      try {
        data = JSON.parse(jsonData);
      } catch (err) {
        // If JSON parsing fails, use the text field directly
        data = { text: message };
      }

      // Add message text from the simple input if JSON doesn't have it
      if (!data.text && message) {
        data.text = message;
      }

      const response = await trigger(eventName, data);
      setApiResponse(response);
      
      // Clear message input but keep JSON for reuse
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setApiResponse({ error: err instanceof Error ? err.message : String(err) });
    }
  };

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch (err) {
      return 'Invalid time';
    }
  };

  // Reconnect to Pusher when channel or event name changes
  useEffect(() => {
    if (isSubscribed) {
      unsubscribe();
      setTimeout(() => subscribe(), 300);
    }
  }, [channelName, eventName, isSubscribed, subscribe, unsubscribe]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Connection Configuration */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Pusher Connection</CardTitle>
            <CardDescription>Configure your Pusher channel and event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Channel Name</label>
              <Input
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="Enter channel name"
              />
              <p className="text-xs text-muted-foreground">
                Use 'presence-' prefix for presence channels
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Name</label>
              <Input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Enter event name"
              />
            </div>
            <div className="flex gap-2">
              {isSubscribed ? (
                <Button onClick={unsubscribe} variant="destructive">Disconnect</Button>
              ) : (
                <Button onClick={subscribe}>Connect</Button>
              )}
              <Badge variant={isSubscribed ? "default" : "destructive"}>
                {isSubscribed ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            {error && (
              <p className="text-sm text-red-500">Error: {error.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Send Message */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Send Message</CardTitle>
            <CardDescription>Send data through Pusher</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="simple">
              <TabsList className="w-full">
                <TabsTrigger value="simple" className="flex-1">Simple</TabsTrigger>
                <TabsTrigger value="json" className="flex-1">JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="simple" className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
              </TabsContent>
              <TabsContent value="json" className="space-y-2">
                <label className="text-sm font-medium">JSON Data</label>
                <Textarea
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  placeholder="Enter JSON data"
                  className="font-mono min-h-[120px]"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSendMessage} disabled={!isSubscribed}>
              Send Event
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Events Log */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Events Log</CardTitle>
            <CardDescription>
              Recent events received from channel: {channelName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              {events.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No events received yet
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={index} className="p-3 rounded border">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">
                          {event._meta?.userName || 'Unknown User'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event._meta?.timestamp 
                            ? formatTime(event._meta.timestamp) 
                            : 'No timestamp'}
                        </div>
                      </div>
                      <div className="text-sm">
                        {event.text || JSON.stringify(event)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* API Response */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>API Response</CardTitle>
            <CardDescription>Last response from the API</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {apiResponse ? JSON.stringify(apiResponse, null, 2) : 'No API response yet'}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PusherExample;
