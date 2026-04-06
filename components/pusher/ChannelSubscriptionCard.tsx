"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChannelSubscriptionCardProps {
  channelName: string;
  customEvent: string;
  isSubscribed: boolean;
  onChannelNameChange: (name: string) => void;
  onEventChange: (event: string) => void;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
}

const ChannelSubscriptionCard = ({
  channelName,
  customEvent,
  isSubscribed,
  onChannelNameChange,
  onEventChange,
  onSubscribe,
  onUnsubscribe,
}: ChannelSubscriptionCardProps) => {
  return (
    <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle>Channel Subscription</CardTitle>
        <CardDescription>Subscribe to a Pusher channel</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Channel Name</label>
          <Input
            value={channelName}
            onChange={(e) => onChannelNameChange(e.target.value)}
            placeholder="Enter channel name (e.g., presence-general)"
            disabled={isSubscribed}
            className="font-mono text-sm"
          />
          <div className="flex flex-wrap gap-1 mt-1">
            <Badge variant="outline" className="cursor-pointer hover:bg-muted/50" onClick={() => onChannelNameChange('presence-general')}>
              presence-general
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted/50" onClick={() => onChannelNameChange('private-notifications')}>
              private-notifications
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted/50" onClick={() => onChannelNameChange('tasks')}>
              tasks
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Prefix with <code className="bg-muted px-1 rounded">presence-</code> for presence channels, 
            <code className="bg-muted px-1 rounded ml-1">private-</code> for private channels
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Event to Listen For</label>
          <Input
            value={customEvent}
            onChange={(e) => onEventChange(e.target.value)}
            placeholder="Enter event name"
            disabled={isSubscribed}
            className="font-mono text-sm"
          />
          <div className="flex flex-wrap gap-1 mt-1">
            <Badge variant="outline" className="cursor-pointer hover:bg-muted/50" onClick={() => onEventChange('message')}>
              message
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted/50" onClick={() => onEventChange('task:update')}>
              task:update
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted/50" onClick={() => onEventChange('notification')}>
              notification
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isSubscribed ? (
          <Button onClick={onUnsubscribe} variant="destructive" className="w-full">
            Unsubscribe
          </Button>
        ) : (
          <Button onClick={onSubscribe} className="w-full">
            Subscribe
          </Button>
        )}
      </CardFooter>
      {isSubscribed && (
        <div className="px-6 pb-4">
          <Badge
            className={cn(
              "w-full justify-center py-1.5",
              isSubscribed ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100"
            )}
          >
            Subscribed to: {channelName}
          </Badge>
        </div>
      )}
    </Card>
  );
};

export default ChannelSubscriptionCard;
