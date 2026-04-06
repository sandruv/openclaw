'use client';

import { RefreshCw, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  onRefresh: () => void;
  onMakeUserOneSuperAdmin: () => void;
  isLoading: boolean;
  processing: boolean;
}

export function Toolbar({ 
  onRefresh, 
  onMakeUserOneSuperAdmin, 
  isLoading, 
  processing 
}: ToolbarProps) {
  return (
    <div className="flex-shrink-0 h-9 bg-gray-50 dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center px-3 gap-2">
      <button
        onClick={onRefresh}
        disabled={isLoading || processing}
        className="h-7 px-3 text-sm text-gray-700 dark:text-[#cccccc] hover:bg-gray-200 dark:hover:bg-[#3c3c3c] rounded flex items-center gap-1.5 disabled:opacity-50"
      >
        <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
        Refresh
      </button>
      
      <button
        onClick={onMakeUserOneSuperAdmin}
        disabled={processing || isLoading}
        className="h-7 px-3 text-sm bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded flex items-center gap-1.5 disabled:opacity-50 ml-auto"
      >
        <Crown className="h-3.5 w-3.5" />
        Make User #1 SuperAdmin
      </button>
    </div>
  );
}
