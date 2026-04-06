"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

interface SendEventCardProps {
  channelName: string;
  eventName: string;
  eventData: string;
  isSubscribed: boolean;
  loading: boolean;
  onEventNameChange: (event: string) => void;
  onEventDataChange: (data: string) => void;
  onSendEvent: () => void;
}

const SendEventCard = ({
  channelName,
  eventName,
  eventData,
  isSubscribed,
  loading,
  onEventNameChange,
  onEventDataChange,
  onSendEvent,
}: SendEventCardProps) => {
  
  // Attempt to parse JSON to check if it's valid
  const isValidJson = () => {
    try {
      JSON.parse(eventData);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Format JSON more nicely
  const formatJson = () => {
    try {
      const parsed = JSON.parse(eventData);
      const formatted = JSON.stringify(parsed, null, 2);
      onEventDataChange(formatted);
    } catch (e) {
      // If not valid JSON, do nothing
    }
  };

  return (
    <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle>Send Event</CardTitle>
        <CardDescription>
          Trigger an event on channel: <span className="font-mono text-sm">{channelName}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Event Name</label>
          <Input
            value={eventName}
            onChange={(e) => onEventNameChange(e.target.value)}
            placeholder="Enter event name"
            className="font-mono text-sm"
          />
        </div>
        
        <Tabs defaultValue="json" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="json">JSON Data</TabsTrigger>
            <TabsTrigger value="format">Format JSON</TabsTrigger>
          </TabsList>
          <TabsContent value="json" className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Event Data (JSON)</label>
              {eventData && !isValidJson() && (
                <div className="text-xs text-red-500">Invalid JSON</div>
              )}
            </div>
            <Textarea
              value={eventData}
              onChange={(e) => onEventDataChange(e.target.value)}
              placeholder="Enter JSON data"
              className="font-mono text-sm min-h-[150px] resize-none"
            />
          </TabsContent>
          <TabsContent value="format" className="pt-2">
            <div className="grid place-content-center gap-4 min-h-[150px]">
              <p className="text-sm text-center text-muted-foreground">
                Click the button below to prettify your JSON data
              </p>
              <Button variant="outline" onClick={formatJson} className="mx-auto">
                Format JSON
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onSendEvent} 
          disabled={loading || !isSubscribed} 
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Event'
          )}
        </Button>
      </CardFooter>
      {!isSubscribed && (
        <div className="px-6 pb-4">
          <p className="text-xs text-center text-amber-600">
            You need to subscribe to a channel first
          </p>
        </div>
      )}
    </Card>
  );
};

export default SendEventCard;
