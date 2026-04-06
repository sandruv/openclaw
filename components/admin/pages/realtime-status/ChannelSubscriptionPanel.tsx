'use client';

import { ChannelType, Channel } from '@/lib/realtime/types';
import { Hash, XCircle, Loader2 } from 'lucide-react';

interface ChannelSubscriptionPanelProps {
  isConnected: boolean;
  channelName: string;
  channelType: ChannelType;
  isSubscribing: boolean;
  subscribedChannels: Channel[];
  onChannelNameChange: (value: string) => void;
  onChannelTypeChange: (value: ChannelType) => void;
  onSubscribe: () => void;
  onUnsubscribe: (channelName: string) => void;
}

export function ChannelSubscriptionPanel({
  isConnected,
  channelName,
  channelType,
  isSubscribing,
  subscribedChannels,
  onChannelNameChange,
  onChannelTypeChange,
  onSubscribe,
  onUnsubscribe,
}: ChannelSubscriptionPanelProps) {
  return (
    <div className="bg-white dark:bg-[#252526] border border-gray-200 dark:border-[#3c3c3c] rounded-md overflow-hidden">
      <div className="h-8 bg-gray-50 dark:bg-[#2d2d2d] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center justify-between px-3">
        <span className="text-xs font-medium text-gray-600 dark:text-[#969696] uppercase tracking-wide">Channel Subscription</span>
        <span className="text-xs text-gray-500 dark:text-[#6a6a6a]">{subscribedChannels.length} active</span>
      </div>
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Subscribe Form */}
          <div className="flex-1 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={channelName}
                onChange={(e) => onChannelNameChange(e.target.value)}
                placeholder="Channel name"
                disabled={!isConnected || isSubscribing}
                className="flex-1 h-9 px-3 text-sm bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#3c3c3c] rounded-md text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#6a6a6a] focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              />
              <select
                value={channelType}
                onChange={(e) => onChannelTypeChange(e.target.value as ChannelType)}
                disabled={!isConnected || isSubscribing}
                className="h-9 px-3 text-sm bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#3c3c3c] rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="presence">Presence</option>
              </select>
              <button
                onClick={onSubscribe}
                disabled={!isConnected || isSubscribing || !channelName.trim()}
                className="h-9 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-[#3c3c3c] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Hash className="h-4 w-4" />}
                Subscribe
              </button>
            </div>
          </div>
          
          {/* Subscribed Channels List */}
          <div className="lg:w-80 lg:border-l lg:border-gray-200 dark:lg:border-[#3c3c3c] lg:pl-4">
            <div className="text-xs text-gray-500 dark:text-[#6a6a6a] mb-2">Subscribed Channels</div>
            {subscribedChannels.length === 0 ? (
              <div className="text-sm text-gray-400 dark:text-[#6a6a6a] italic">No active subscriptions</div>
            ) : (
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {subscribedChannels.map((channel) => (
                  <div key={channel.name} className="flex items-center justify-between py-1 px-2 bg-gray-50 dark:bg-[#1e1e1e] rounded text-sm">
                    <span className="font-mono text-gray-700 dark:text-[#9cdcfe] truncate">{channel.name}</span>
                    <button
                      onClick={() => onUnsubscribe(channel.name)}
                      className="text-red-500 hover:text-red-600 p-1"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
