"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

const InstructionsCard = () => {
  return (
    <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Usage Instructions
          <a
            href="https://pusher.com/docs/channels/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm flex items-center hover:underline text-blue-600 dark:text-blue-400"
          >
            Pusher Docs <ExternalLink className="ml-1 h-3.5 w-3.5" />
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal list-inside space-y-3 text-sm">
          <li className="pl-2">
            <strong>Subscribe to a channel</strong> - Enter a channel name and click <span className="bg-muted px-1 rounded">Subscribe</span>
            <ul className="list-disc list-inside pl-5 mt-1 text-muted-foreground">
              <li>Use <code className="bg-muted px-1 rounded">presence-</code> prefix for presence channels that show connected users</li>
              <li>Use <code className="bg-muted px-1 rounded">private-</code> prefix for private channels</li>
              <li>No prefix for public channels (e.g., <code className="bg-muted px-1 rounded">tasks</code>)</li>
            </ul>
          </li>
          
          <li className="pl-2">
            <strong>Send events</strong> - After subscribing, use the Send Event section to publish messages
            <ul className="list-disc list-inside pl-5 mt-1 text-muted-foreground">
              <li>Enter an event name (e.g., <code className="bg-muted px-1 rounded">message</code>, <code className="bg-muted px-1 rounded">task:update</code>)</li>
              <li>Provide valid JSON data or it will be converted to <code className="bg-muted px-1 rounded">{'"text": "your message"'}</code></li>
              <li>The event will be broadcast to all subscribers of the channel</li>
            </ul>
          </li>
          
          <li className="pl-2">
            <strong>Monitor presence</strong> - When using a presence channel, connected users will appear in the Connected Users card
            <ul className="list-disc list-inside pl-5 mt-1 text-muted-foreground">
              <li>Users are updated in real-time as they join or leave</li>
              <li>Open this page in multiple browsers to see multiple users</li>
            </ul>
          </li>
          
          <li className="pl-2">
            <strong>View logs</strong> - All events and activities are displayed in the Event Logs
            <ul className="list-disc list-inside pl-5 mt-1 text-muted-foreground">
              <li>Each event is color-coded by type</li>
              <li>Logs can be downloaded for debugging</li>
              <li>Events include timestamps for tracking activity</li>
            </ul>
          </li>
          
          <li className="pl-2">
            <strong>Compare with Socket.IO</strong> - This page is similar to the Socket Status page but uses Pusher instead
            <ul className="list-disc list-inside pl-5 mt-1 text-muted-foreground">
              <li>Pusher provides cloud-hosted infrastructure for real-time communication</li>
              <li>Socket.IO is self-hosted and runs on your own server</li>
              <li>Both support similar patterns for pub/sub messaging</li>
            </ul>
          </li>
        </ol>
      </CardContent>
    </Card>
  );
};

export default InstructionsCard;
