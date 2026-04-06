'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface LoggerPaneProps {
  logs: LogEntry[];
  title?: string;
}

export function LoggerPane({ logs, title = 'Output' }: LoggerPaneProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new logs arrive
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: LogEntry['type']): string => {
    switch (type) {
      case 'success': return 'text-green-600 dark:text-[#4ec9b0]';
      case 'error': return 'text-red-500 dark:text-[#f48771]';
      case 'warning': return 'text-yellow-600 dark:text-[#cca700]';
      default: return 'text-blue-600 dark:text-[#9cdcfe]';
    }
  };

  const getLogPrefix = (type: LogEntry['type']): string => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      default: return '›';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex-shrink-0 h-9 bg-white dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center px-3">
        <span className="text-xs text-gray-700 dark:text-[#cccccc] uppercase tracking-wide">{title}</span>
        <span className="ml-2 text-xs text-gray-500 dark:text-[#969696]">({logs.length} entries)</span>
      </div>

      {/* Log Content */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto font-mono text-sm leading-6 p-2 bg-white dark:bg-[#1e1e1e]"
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 dark:text-[#969696] text-sm py-2 px-1">
            No logs yet. Actions will appear here.
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex py-0.5 hover:bg-gray-100 dark:hover:bg-[#2a2d2e]">
              <span className="text-gray-400 dark:text-[#6a9955] w-30 flex-shrink-0 px-1">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={cn('w-5 flex-shrink-0 text-center', getLogColor(log.type))}>
                {getLogPrefix(log.type)}
              </span>
              <span className={cn('flex-1 px-1', getLogColor(log.type))}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
