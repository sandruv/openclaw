"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/types/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Mail, Info, Clock } from 'lucide-react';
import { getInitials, getAvatarColor } from '@/lib/utils'

interface ChannelMember {
  id: string;
  info?: {
    name?: string;
    email?: string;
    avatar?: string;
    [key: string]: any;
  };
}

interface ConnectedUsersCardProps {
  members: Record<string, ChannelMember>;
  count: number;
  currentUser: User | null;
}

const ConnectedUsersCard = ({ members, count, currentUser }: ConnectedUsersCardProps) => {
  return (
    <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="mr-5">
            <CardTitle className="text-base">Connected Users</CardTitle>
            <CardDescription className="text-xs">Active in channel</CardDescription>
          </div>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {count} {count === 1 ? 'Member' : 'Members'}
          </Badge>
        </div>
        
        {Object.keys(members).length === 0 ? (
          <div className="flex gap-2 items-center px-1 py-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="text-xs text-muted-foreground ml-2">
              Waiting for members...
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 items-center">
            {Object.entries(members).map(([id, member]) => {
              const isCurrentUser = currentUser && id === currentUser.id.toString();
              const name = member.info?.name || `User ${id}`;
              const initials = member.info?.name 
                ? getInitials(member.info.name) 
                : (member.info?.initials || id.substring(0, 2).toUpperCase());
              
              return (
                <Popover key={id}>
                  <PopoverTrigger asChild>
                    <button className="group relative">
                      <Avatar className={`h-9 w-9 ${isCurrentUser ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}>
                        <AvatarFallback className={`${getAvatarColor(id)} text-white text-[0.9em] font-semibold`}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="center" className="w-64 p-3">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <Avatar className={`${getAvatarColor(id)} h-12 w-12`}>
                        <AvatarFallback className={`${getAvatarColor(id)} text-white text-[1.2em] font-semibold`}>
                          {initials}
                        </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-1">
                            {name}
                            {isCurrentUser && (
                              <Badge variant="default" className="ml-1 text-[0.65rem] px-1 py-0">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            User ID: {id.substring(0, 10)}...
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        {member.info?.email && (
                          <div className="flex items-center gap-2 text-xs">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="truncate">{member.info.email}</span>
                          </div>
                        )}
                        
                        {member.info?.role && (
                          <div className="flex items-center gap-2 text-xs">
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Role: {member.info.role}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Connected at {new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">Additional Info:</span>
                        <pre className="mt-1 overflow-x-auto bg-muted p-2 rounded-sm text-[0.65rem]">
                          {JSON.stringify(member.info || {}, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectedUsersCard;
