"use client";

import { useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { AdapterType } from '@/lib/realtime/adapter-factory';
import { realtimeService } from '@/lib/realtime/realtime-service';
import { Settings } from 'lucide-react';

type AdapterOption = {
  value: string;
  label: string;
};

const ADAPTER_OPTIONS: AdapterOption[] = [
  { value: 'pusher', label: 'Pusher' },
  { value: 'socketio', label: 'Socket.IO' },
  { value: 'mock', label: 'Mock (Local)' },
];

export function AdapterSelector() {
  // Get the current adapter type or default to Pusher
  const [adapterType, setAdapterType] = useState<string>('pusher');
  
  // Initialize with the current adapter type on mount
  useEffect(() => {
    const current = realtimeService.getAdapterType() || AdapterType.PUSHER;
    setAdapterType(current);
  }, []);
  
  // Handle adapter change
  const handleAdapterChange = useCallback((value: string) => {
    if (!value) return;
    
    // Update URL to persist selection
    const url = new URL(window.location.href);
    url.searchParams.set('adapter', value);
    window.history.replaceState({}, '', url.toString());
    
    // Update local state
    setAdapterType(value);
    
    // Reload to apply new adapter
    window.location.reload();
  }, []);
  
  return (
    <div className="flex items-center gap-3 p-2 px-3 bg-neutral-900/70 border border-neutral-800 rounded-full shadow-md backdrop-blur-sm transition-all hover:bg-neutral-800/80">
      <Settings className="h-4.5 w-4.5 text-sky-400" />
      <Select value={adapterType} onValueChange={handleAdapterChange}>
        <SelectTrigger className="w-[180px] border-0 bg-transparent focus:ring-0 focus:ring-offset-0 hover:bg-neutral-800/50 rounded-full px-3 text-neutral-200 text-sm font-medium transition-colors">
          <SelectValue placeholder="Select adapter" />
        </SelectTrigger>
        <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-200">
          {ADAPTER_OPTIONS.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="text-sm font-medium focus:bg-neutral-800 focus:text-white hover:bg-neutral-800"
            >
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${option.value === 'pusher' ? 'bg-purple-500' : option.value === 'socketio' ? 'bg-blue-500' : 'bg-green-500'}`} />
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
