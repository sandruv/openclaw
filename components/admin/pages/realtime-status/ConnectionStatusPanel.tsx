'use client';

import { cn } from '@/lib/utils';
import { Wifi, WifiOff, Zap, Loader2 } from 'lucide-react';

interface ConnectionStatusPanelProps {
  isConnected: boolean;
  socketId?: string;
  latency: number | null;
  isTestingLatency: boolean;
  onTestLatency: () => void;
}

export function ConnectionStatusPanel({
  isConnected,
  socketId,
  latency,
  isTestingLatency,
  onTestLatency,
}: ConnectionStatusPanelProps) {
  return (
    <div className="bg-white dark:bg-[#252526] border border-gray-200 dark:border-[#3c3c3c] rounded-md overflow-hidden">
      <div className="h-8 bg-gray-50 dark:bg-[#2d2d2d] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center px-3">
        <span className="text-xs font-medium text-gray-600 dark:text-[#969696] uppercase tracking-wide">Connection Status</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-[#969696]">Status</span>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-600 dark:text-red-400">Disconnected</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-[#969696]">Socket ID</span>
          <code className="text-xs font-mono bg-gray-100 dark:bg-[#1e1e1e] px-2 py-1 rounded text-gray-700 dark:text-[#9cdcfe]">
            {socketId || 'N/A'}
          </code>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-[#969696]">Latency</span>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-mono",
              latency === null ? "text-gray-500" :
              latency < 100 ? "text-green-500" :
              latency < 300 ? "text-yellow-500" : "text-red-500"
            )}>
              {latency !== null ? `${latency}ms` : '—'}
            </span>
            <button
              onClick={onTestLatency}
              disabled={isTestingLatency || !isConnected}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3c3c3c] disabled:opacity-50 transition-colors"
            >
              {isTestingLatency ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              ) : (
                <Zap className="h-4 w-4 text-blue-500" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
