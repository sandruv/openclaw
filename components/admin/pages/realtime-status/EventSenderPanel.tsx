'use client';

import { Channel } from '@/lib/realtime/types';
import { Send, RefreshCw, Loader2 } from 'lucide-react';

const PRESET_EVENTS = [
  { name: 'test-event', value: 'test-event' },
  { name: 'task:update', value: 'task:update' },
  { name: 'task:create', value: 'task:create' },
  { name: 'message', value: 'message' },
  { name: 'notification', value: 'notification' },
];

interface EventSenderPanelProps {
  isConnected: boolean;
  isSending: boolean;
  selectedChannel: string;
  eventName: string;
  eventData: string;
  subscribedChannels: Channel[];
  onSelectedChannelChange: (value: string) => void;
  onEventNameChange: (value: string) => void;
  onEventDataChange: (value: string) => void;
  onSendEvent: () => void;
  onResetEventData: () => void;
}

export function EventSenderPanel({
  isConnected,
  isSending,
  selectedChannel,
  eventName,
  eventData,
  subscribedChannels,
  onSelectedChannelChange,
  onEventNameChange,
  onEventDataChange,
  onSendEvent,
  onResetEventData,
}: EventSenderPanelProps) {
  return (
    <div className="bg-white dark:bg-[#252526] border border-gray-200 dark:border-[#3c3c3c] rounded-md overflow-hidden">
      <div className="h-8 bg-gray-50 dark:bg-[#2d2d2d] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center justify-between px-3">
        <span className="text-xs font-medium text-gray-600 dark:text-[#969696] uppercase tracking-wide">Event Sender</span>
        <button
          onClick={onResetEventData}
          className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Reset
        </button>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Channel Select */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 dark:text-[#969696]">Target Channel</label>
            <select
              value={selectedChannel}
              onChange={(e) => onSelectedChannelChange(e.target.value)}
              disabled={!isConnected || subscribedChannels.length === 0}
              className="w-full h-9 px-3 text-sm bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#3c3c3c] rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Select channel...</option>
              {subscribedChannels.map((channel) => (
                <option key={channel.name} value={channel.name}>{channel.name}</option>
              ))}
            </select>
          </div>
          
          {/* Event Name */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 dark:text-[#969696]">Event Name</label>
            <div className="flex gap-2">
              <select
                value={PRESET_EVENTS.find(e => e.value === eventName) ? eventName : ''}
                onChange={(e) => e.target.value && onEventNameChange(e.target.value)}
                disabled={!isConnected}
                className="w-28 h-9 px-2 text-sm bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#3c3c3c] rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Presets</option>
                {PRESET_EVENTS.map((event) => (
                  <option key={event.value} value={event.value}>{event.name}</option>
                ))}
              </select>
              <input
                type="text"
                value={eventName}
                onChange={(e) => onEventNameChange(e.target.value)}
                placeholder="Event name"
                disabled={!isConnected}
                className="flex-1 h-9 px-3 text-sm bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#3c3c3c] rounded-md text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#6a6a6a] focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
          </div>
          
          {/* Send Button */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 dark:text-[#969696]">&nbsp;</label>
            <button
              onClick={onSendEvent}
              disabled={!isConnected || isSending || !selectedChannel || !eventName}
              className="w-full h-9 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-[#3c3c3c] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Event
            </button>
          </div>
        </div>
        
        {/* Event Data */}
        <div className="mt-4 space-y-2">
          <label className="text-xs font-medium text-gray-600 dark:text-[#969696]">Event Data (JSON)</label>
          <textarea
            value={eventData}
            onChange={(e) => onEventDataChange(e.target.value)}
            disabled={!isConnected}
            rows={4}
            className="w-full px-3 py-2 text-sm font-mono bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#3c3c3c] rounded-md text-gray-900 dark:text-[#9cdcfe] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
