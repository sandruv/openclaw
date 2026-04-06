"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConnectionState } from '@/lib/realtime/types';
import useRealtime from '@/hooks/useRealtime';
import { realtimeApiService } from '@/services/realtimeApiService';

export function ConnectionStatus() {
  const { connectionInfo, adapterType } = useRealtime();
  const [latency, setLatency] = useState<number | null>(null);
  
  // Measure latency periodically
  useEffect(() => {
    const checkLatency = async () => {
      const start = Date.now();
      try {
        // Ping a small event to measure roundtrip time using the service
        await realtimeApiService.ping();
        const end = Date.now();
        setLatency(end - start);
      } catch (error) {
        console.error('Error measuring latency:', error);
        setLatency(null);
      }
    };
    
    // Check latency initially and then every 10 seconds
    checkLatency();
    const interval = setInterval(checkLatency, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Helper function to get the appropriate badge variant based on connection state
  const getConnectionBadgeVariant = (state: ConnectionState): "default" | "destructive" | "outline" | "secondary" => {
    switch (state) {
      case ConnectionState.CONNECTED:
        return "default";
      case ConnectionState.CONNECTING:
        return "secondary";
      case ConnectionState.DISCONNECTED:
        return "outline";
      case ConnectionState.FAILED:
        return "destructive";
      default:
        return "outline";
    }
  };
  
  // Helper function to get a human-readable connection state
  const getConnectionStateText = (state: ConnectionState): string => {
    switch (state) {
      case ConnectionState.CONNECTED:
        return "Connected";
      case ConnectionState.CONNECTING:
        return "Connecting...";
      case ConnectionState.DISCONNECTED:
        return "Disconnected";
      case ConnectionState.FAILED:
        return "Connection Failed";
      default:
        return "Unknown";
    }
  };
  
  // Helper function to get latency text with appropriate colors
  const getLatencyText = (): { text: string; color: string } => {
    if (latency === null) {
      return { text: 'Unknown', color: 'text-yellow-500' };
    }
    
    if (latency < 100) {
      return { text: `${latency}ms`, color: 'text-green-500' };
    } else if (latency < 300) {
      return { text: `${latency}ms`, color: 'text-yellow-500' };
    } else {
      return { text: `${latency}ms`, color: 'text-red-500' };
    }
  };
  
  const latencyInfo = getLatencyText();
  
  return (
    <Card className="bg-neutral-900 border-neutral-800 shadow-md overflow-hidden">
      <CardHeader className="pb-2 bg-neutral-950/50">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full animate-pulse ${
            connectionInfo.state === 'connected' ? 'bg-emerald-500' : 
            connectionInfo.state === 'connecting' ? 'bg-amber-500' : 'bg-red-500'
          }`} />
          <CardTitle className="text-lg font-mono text-white">Realtime Connection</CardTitle>
        </div>
        <CardDescription className="text-neutral-400">
          Connection status and adapter information
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex gap-3 items-center">
              <span className="text-sm font-medium text-neutral-300">Status:</span>
              <Badge 
                className={`text-xs px-2.5 py-0.5 font-medium ${
                  connectionInfo.state === 'connected' ? 'bg-emerald-950/70 text-emerald-400 border-emerald-700' : 
                  connectionInfo.state === 'connecting' ? 'bg-amber-950/70 text-amber-400 border-amber-700' : 
                  'bg-red-950/70 text-red-400 border-red-700'
                }`}
                variant="outline"
              >
                {connectionInfo.state}
              </Badge>
            </div>
            
            <div className="flex gap-3 items-center">
              <span className="text-sm font-medium text-neutral-300">Adapter:</span>
              <Badge variant="outline" className="bg-blue-950/50 text-blue-400 border-blue-800 hover:bg-blue-900/30">
                {adapterType}
              </Badge>
            </div>
          </div>
          
          {connectionInfo.state === 'connected' && (
            <div className="space-y-3 pt-2 border-t border-neutral-800/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-300">Socket ID:</span>
                <code className="bg-neutral-800 p-1.5 px-2 rounded text-xs text-emerald-300 font-mono">
                  {connectionInfo.socketId || 'Not available'}
                </code>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-300">Latency:</span>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`text-xs px-2 py-0.5 ${
                      latency && latency < 100 ? 'bg-emerald-950/70 text-emerald-400 border-emerald-700' : 
                      latency && latency < 300 ? 'bg-amber-950/70 text-amber-400 border-amber-700' : 
                      'bg-red-950/70 text-red-400 border-red-700'
                    }`}
                    variant="outline"
                  >
                    {latency !== null ? `${Math.round(latency)}ms` : 'N/A'}
                  </Badge>
                </div>
              </div>
              
              {connectionInfo.error && (
                <div className="flex items-center justify-between mt-3 p-2 rounded bg-red-950/30 border border-red-900/50">
                  <span className="text-sm font-medium text-red-400">Error:</span>
                  <span className="text-sm text-red-300">{String(connectionInfo.error)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
