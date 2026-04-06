'use client';

import { cn } from '@/lib/utils';

const ADAPTER_OPTIONS = [
  { value: 'pusher', label: 'Pusher', color: 'bg-purple-500' },
  { value: 'socketio', label: 'Socket.IO', color: 'bg-blue-500' },
  { value: 'mock', label: 'Mock', color: 'bg-green-500' },
];

interface AdapterSelectorPanelProps {
  adapterType: string;
  onAdapterChange: (value: string) => void;
}

export function AdapterSelectorPanel({
  adapterType,
  onAdapterChange,
}: AdapterSelectorPanelProps) {
  return (
    <div className="bg-white dark:bg-[#252526] border border-gray-200 dark:border-[#3c3c3c] rounded-md overflow-hidden">
      <div className="h-8 bg-gray-50 dark:bg-[#2d2d2d] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center px-3">
        <span className="text-xs font-medium text-gray-600 dark:text-[#969696] uppercase tracking-wide">Adapter Selection</span>
      </div>
      <div className="p-4">
        <div className="flex gap-2">
          {ADAPTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onAdapterChange(option.value)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all border",
                adapterType === option.value
                  ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300"
                  : "bg-gray-50 dark:bg-[#1e1e1e] border-gray-200 dark:border-[#3c3c3c] text-gray-600 dark:text-[#969696] hover:bg-gray-100 dark:hover:bg-[#2a2d2e]"
              )}
            >
              <div className={cn("h-2 w-2 rounded-full", option.color)} />
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-[#6a6a6a] mt-2">
          Current: <span className="font-medium text-gray-700 dark:text-[#cccccc]">{adapterType}</span> • Changing adapter will reload the page
        </p>
      </div>
    </div>
  );
}
