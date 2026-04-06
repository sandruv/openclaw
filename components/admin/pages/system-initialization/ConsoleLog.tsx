import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface ConsoleLogProps {
  className?: string;
  title?: string;
  logs?: LogEntry[];
}

export function ConsoleLog({ className, title = 'System Logs', logs = [] }: ConsoleLogProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  // If no logs are provided, show a default message
  const displayLogs = logs.length > 0 ? logs : [
    { timestamp: new Date().toISOString(), message: 'No logs available yet', type: 'info' },
  ];

  // Auto scroll to bottom when new logs arrive
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);


  const getLogColor = (type: LogEntry['type'] | string): string => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <Card className={cn(
      "border-gray-700 bg-gray-900 text-white h-full flex flex-col",
      className
    )}>
      <CardHeader className="bg-black border-b border-gray-700 pb-2 rounded-lg">
        <CardTitle className="text-gray-100 text-md">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden">
        <div 
          ref={logContainerRef}
          className="font-mono text-sm h-full overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900"
          style={{ 
            height: 'calc(100% - 2rem)',
            backgroundColor: '#121212',
            whiteSpace: 'pre-wrap'
          }}
        >
          {displayLogs.map((log, index) => (
            <div key={index} className="mb-1">
              <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
              <span className={getLogColor(log.type as LogEntry['type'])}>{log.message}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
