"use client"

import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Clock, Download, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EventLog {
  type: string;
  data: any;
  timestamp: Date;
}

interface EventLogsCardProps {
  logs: EventLog[];
  onClearLogs: () => void;
}

const EventLogsCard = ({ logs, onClearLogs }: EventLogsCardProps) => {
  // State for expanded/collapsed mode
  const [isExpanded, setIsExpanded] = useState(false);
  // State for console height when expanded
  const [consoleHeight, setConsoleHeight] = useState(400);
  // Get the latest log entry
  const latestLog = logs.length > 0 ? logs[0] : null;
  // Format JSON for display
  const formatJSON = (data: any): string => {
    try {
      if (typeof data === 'string') {
        // Try to parse if it's a JSON string
        try {
          const parsed = JSON.parse(data);
          return JSON.stringify(parsed, null, 2);
        } catch {
          return data;
        }
      }
      return JSON.stringify(data, null, 2);
    } catch (err) {
      return String(data);
    }
  };

  // Format timestamp
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false
    });
  };

  // Get log type color (for console-style UI)
  const getLogTypeColor = (type: string): string => {
    switch (type) {
      case 'error':
        return '#f87171'; // red-400
      case 'connection':
        return '#60a5fa'; // blue-400
      case 'message':
        return '#4ade80'; // green-400
      case 'subscribe':
      case 'subscription_succeeded':
        return '#c084fc'; // purple-400
      case 'unsubscribe':
        return '#fbbf24'; // amber-400
      case 'member_added':
        return '#34d399'; // emerald-400
      case 'member_removed':
        return '#f472b6'; // pink-400
      case 'api':
        return '#818cf8'; // indigo-400
      default:
        return '#94a3b8'; // slate-400
    }
  };
  
  // Add a blinking cursor animation to the stylesheet
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
      .animate-blink {
        animation: blink 1.2s infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Download logs as JSON
  const downloadLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportName = `pusher-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
  };

  // Function to handle console resize with mouse drag
  const handleResize = (e: React.MouseEvent<HTMLDivElement>, direction: 'up' | 'down') => {
    e.preventDefault();

    const startY = e.clientY;
    const startHeight = consoleHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = direction === 'up' ? (startY - moveEvent.clientY) : (moveEvent.clientY - startY);
      const newHeight = Math.max(200, Math.min(window.innerHeight * 0.8, startHeight + deltaY));
      setConsoleHeight(newHeight);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Format JSON as a single line (for collapsed view)
  const formatJSONOneLine = (data: any): string => {
    try {
      if (typeof data === 'string') {
        try {
          // Try to parse if it's a JSON string
          const parsed = JSON.parse(data);
          return JSON.stringify(parsed);
        } catch {
          return data;
        }
      }
      return JSON.stringify(data);
    } catch (err) {
      return String(data);
    }
  };

  // Render a single log entry in the console
  const renderLogEntry = (log: EventLog, isLatestOnly = false) => {
    const isSimpleEvent = 
      typeof log.data === 'string' || 
      typeof log.data === 'number' || 
      typeof log.data === 'boolean';
    
    return (
      <div 
        className={`font-mono text-sm border-l-2 pl-2 py-1 hover:bg-neutral-800/50 transition-colors ${isLatestOnly ? 'truncate max-w-full' : ''}`}
        style={{ borderLeftColor: getLogTypeColor(log.type) }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 min-w-[65px]">{formatTime(log.timestamp)}</span>
          <Badge className="bg-neutral-800 hover:bg-neutral-700 text-xs py-0 px-1.5" style={{ color: getLogTypeColor(log.type) }}>
            {log.type}
          </Badge>
          
          {/* Display simple event data or single-line JSON for collapsed view */}
          {isSimpleEvent ? (
            <span className="text-neutral-300 truncate">{String(log.data)}</span>
          ) : isLatestOnly ? (
            <span className="text-neutral-300 truncate text-xs">
              {formatJSONOneLine(log.data)}
            </span>
          ) : null}
        </div>
        
        {/* Display formatted JSON below the title when expanded */}
        {!isSimpleEvent && !isLatestOnly && (
          <pre className="text-xs mt-1 ml-[65px] bg-neutral-800/50 p-2 rounded-sm overflow-auto max-h-[200px] text-neutral-300 whitespace-pre-wrap border-l-2 border-neutral-700">
            {formatJSON(log.data)}
          </pre>
        )}
      </div>
    );
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 transition-all duration-300" 
      style={{ height: isExpanded ? `${consoleHeight}px` : 'auto' }}
    >
      {/* Resizer bar - only visible when expanded */}
      {isExpanded && (
        <div 
          className="absolute top-0 left-0 right-0 h-1.5 bg-neutral-700 hover:bg-emerald-500 cursor-ns-resize z-10"
          onMouseDown={(e) => handleResize(e, 'up')}
        />
      )}

      {/* Main console container */}
      <div className="shadow-lg border border-neutral-800 border-b-0 w-full h-full flex flex-col">
        {/* Console header with controls - Entire header clickable to expand/collapse */}
        <div 
          className="bg-neutral-900 text-white p-2 flex items-center justify-between border-b border-neutral-800 cursor-pointer select-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <div className="flex space-x-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <div className="font-mono font-medium ml-2 flex items-center">
              <span>pusher-console</span>
              <span className="text-emerald-400 ml-1 hidden sm:inline">~/events</span>
              <span className="animate-blink ml-1"> ▋</span>
            </div>
          </div>
          
          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            {logs.length > 0 && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-neutral-800 rounded-full"
                        onClick={downloadLogs}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <span>Download logs</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-neutral-800 rounded-full"
                        onClick={onClearLogs}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <span>Clear logs</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
            
            <Badge variant="outline" className="flex gap-1 items-center bg-neutral-800 text-neutral-300 border-neutral-700">
              <Clock className="h-3 w-3" />
              {logs.length}
            </Badge>
          </div>
        </div>
        
        {/* Console output area */}
        <div className="bg-neutral-900 text-green-50 flex-1 overflow-hidden">
          {!isExpanded ? (
            // Collapsed view - only show latest log entry
            <div className="py-1 px-2">
              {logs.length === 0 ? (
                <div className="text-neutral-500 font-mono text-xs">
                  ~ No events logged yet ~
                </div>
              ) : (
                latestLog && renderLogEntry(latestLog, true)
              )}
            </div>
          ) : (
            // Expanded view - show all log entries
            <ScrollArea className="h-full p-4">
              {logs.length === 0 ? (
                <div className="text-center text-neutral-500 py-8 font-mono">
                  ~ No events logged yet ~
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index}>{renderLogEntry(log)}</div>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventLogsCard;
