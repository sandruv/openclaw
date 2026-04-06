"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/auth';
import { cn } from '@/lib/utils';

interface PusherConnectionCardProps {
  connectionState: string;
  user: User | null;
}

const PusherConnectionCard = ({ connectionState, user }: PusherConnectionCardProps) => {
  // Get connection state color
  const getStateColor = (state: string) => {
    switch (state) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-amber-500';
      case 'failed': return 'bg-red-500';
      case 'unavailable': return 'bg-red-500';
      case 'disconnected': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Pusher Connection Status</span>
          <Badge
            className={cn(
              "text-white font-medium",
              getStateColor(connectionState)
            )}
          >
            {connectionState}
          </Badge>
        </CardTitle>
        <CardDescription>Current connection state and configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 p-4 rounded-lg bg-muted/50">
          <h4 className="font-semibold text-sm mb-2">Environment Variables</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm font-medium">App Key:</div>
            <div className="text-sm font-mono bg-muted p-1 rounded text-right">
              {process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'Not configured'}
            </div>
            <div className="text-sm font-medium">Cluster:</div>
            <div className="text-sm font-mono bg-muted p-1 rounded text-right">
              {process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'Not configured'}
            </div>
            <div className="text-sm font-medium">Environment:</div>
            <div className="text-sm font-mono bg-muted p-1 rounded text-right">
              {process.env.NEXT_PUBLIC_ENVIRONMENT || 'Not configured'}
            </div>
          </div>
        </div>

        {user && (
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-semibold text-sm mb-2">User Information</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">User ID:</div>
              <div className="text-sm font-mono bg-muted p-1 rounded text-right">
                {user.id}
              </div>
              <div className="text-sm font-medium">Name:</div>
              <div className="text-sm overflow-hidden text-right">
                {user.first_name} {user.last_name}
              </div>
              <div className="text-sm font-medium">Email:</div>
              <div className="text-sm overflow-hidden text-right">
                {user.email}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 rounded-lg text-sm bg-muted/50">
          <span className="font-medium">Status: </span>
          {connectionState === 'connected' ? (
            <span className="text-green-600">
              Connected to Pusher servers
            </span>
          ) : (
            <span className="text-amber-600">
              {connectionState === 'connecting' 
                ? 'Establishing connection...' 
                : `Not connected (${connectionState})`}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PusherConnectionCard;
