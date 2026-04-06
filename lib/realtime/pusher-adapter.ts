"use client";

import PusherClient, { Channel as PusherChannel } from 'pusher-js';
import { BaseRealtimeAdapter } from './base-adapter';
import {
  Channel,
  ChannelOptions,
  ChannelType,
  ConnectionInfo,
  ConnectionState,
  RealtimeEvent,
  RealtimeListener,
  RealtimeUserInfo,
  RealtimeConfig
} from './types';

interface PusherMember {
  id: string;
  info: RealtimeUserInfo;
}

export class PusherAdapter extends BaseRealtimeAdapter {
  private pusher: PusherClient | null = null;
  private pusherChannels: Map<string, PusherChannel> = new Map();

  constructor(config: RealtimeConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    if (this.pusher) {
      this.log('Pusher client already initialized');
      return;
    }

    this.connectionInfo.state = ConnectionState.CONNECTING;

    try {
      // Initialize Pusher client
      this.pusher = new PusherClient(
        this.config.appKey || process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '',
        {
          cluster: this.config.cluster || process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'ap1',
          forceTLS: this.config.forceSecure !== false,
          authEndpoint: this.config.authEndpoint || '/api/pusher/auth',
          auth: {
            headers: {
              'Authorization': `Bearer ${this.getAuthToken() || ''}`,
            }
          }
        }
      );

      // Set up connection event handlers
      this.pusher.connection.bind('connected', () => {
        this.connectionInfo = {
          state: ConnectionState.CONNECTED,
          socketId: this.pusher?.connection?.socket_id
        };
        this.log('Pusher connected', this.connectionInfo);
      });

      this.pusher.connection.bind('disconnected', () => {
        this.connectionInfo.state = ConnectionState.DISCONNECTED;
        this.log('Pusher disconnected');
      });

      this.pusher.connection.bind('error', (error: any) => {
        this.connectionInfo = {
          state: ConnectionState.FAILED,
          error: error
        };
        this.logError('Pusher connection error:', error);
      });

      // Set state to connected if already connected
      if (this.pusher.connection.state === 'connected') {
        this.connectionInfo = {
          state: ConnectionState.CONNECTED,
          socketId: this.pusher.connection.socket_id
        };
      }

      return Promise.resolve();
    } catch (error) {
      this.connectionInfo = {
        state: ConnectionState.FAILED,
        error: error instanceof Error ? error : new Error(String(error))
      };
      this.logError('Error initializing Pusher client:', error);
      return Promise.reject(error);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.pusher) {
      return Promise.resolve();
    }

    try {
      // Unsubscribe from all channels
      for (const channelName of this.pusherChannels.keys()) {
        await this.unsubscribe(channelName);
      }

      // Disconnect Pusher client
      this.pusher.disconnect();
      this.pusher = null;
      this.connectionInfo.state = ConnectionState.DISCONNECTED;
      return Promise.resolve();
    } catch (error) {
      this.logError('Error disconnecting Pusher client:', error);
      return Promise.reject(error);
    }
  }

  async subscribe(channelName: string, options: ChannelOptions = { type: ChannelType.PUBLIC }): Promise<Channel> {
    if (!this.pusher) {
      await this.connect();
    }

    if (!this.pusher) {
      throw new Error('Pusher client not initialized');
    }

    try {
      // Format channel name based on type
      const formattedChannelName = this.formatChannelName(channelName, options.type);
      
      // Check if already subscribed
      if (this.pusherChannels.has(formattedChannelName)) {
        const existingChannel = this.channels.get(formattedChannelName);
        if (existingChannel) {
          return existingChannel;
        }
      }

      // Subscribe to channel
      const pusherChannel = this.pusher.subscribe(formattedChannelName);

      // Create a new channel object
      const channel: Channel = {
        name: formattedChannelName,
        type: options.type,
        members: {}
      };

      // If presence channel, set up member events
      if (options.type === ChannelType.PRESENCE) {
        const presenceChannel = pusherChannel as any;
        
        // Set up presence channel events
        presenceChannel.bind('pusher:subscription_succeeded', (data: { members: Record<string, PusherMember> }) => {
          const members: Record<string, RealtimeUserInfo> = {};
          
          for (const [id, member] of Object.entries(data.members)) {
            members[id] = member.info || { id };
          }
          
          channel.members = members;
          this.log('Presence channel subscription succeeded', formattedChannelName, members);
        });

        presenceChannel.bind('pusher:member_added', (member: PusherMember) => {
          if (channel.members && member.id) {
            channel.members[member.id] = member.info || { id: member.id };
            this.log('Member added to presence channel', formattedChannelName, member);
          }
        });

        presenceChannel.bind('pusher:member_removed', (member: PusherMember) => {
          if (channel.members && member.id) {
            delete channel.members[member.id];
            this.log('Member removed from presence channel', formattedChannelName, member);
          }
        });
      }

      // Store channel references
      this.pusherChannels.set(formattedChannelName, pusherChannel);
      this.channels.set(formattedChannelName, channel);

      return channel;
    } catch (error) {
      this.logError('Error subscribing to Pusher channel:', channelName, error);
      throw error;
    }
  }

  async unsubscribe(channelName: string): Promise<void> {
    if (!this.pusher) {
      return Promise.resolve();
    }

    try {
      // Find which channel type is being used
      let formattedChannelName = channelName;
      if (!this.pusherChannels.has(channelName)) {
        // Try with different prefixes
        if (this.pusherChannels.has(`private-${channelName}`)) {
          formattedChannelName = `private-${channelName}`;
        } else if (this.pusherChannels.has(`presence-${channelName}`)) {
          formattedChannelName = `presence-${channelName}`;
        }
      }

      // Unsubscribe from Pusher channel
      this.pusher.unsubscribe(formattedChannelName);
      
      // Remove channel references
      this.pusherChannels.delete(formattedChannelName);
      this.channels.delete(formattedChannelName);
      
      // Clean up event listeners for this channel
      this.eventListeners.delete(formattedChannelName);

      return Promise.resolve();
    } catch (error) {
      this.logError('Error unsubscribing from Pusher channel:', channelName, error);
      return Promise.reject(error);
    }
  }

  on(channelName: string, eventName: RealtimeEvent, listener: RealtimeListener): () => void {
    if (!this.pusher) {
      throw new Error('Pusher client not initialized');
    }

    try {
      // Find which channel type is being used
      let formattedChannelName = channelName;
      if (!this.pusherChannels.has(channelName)) {
        // Try with different prefixes
        if (this.pusherChannels.has(`private-${channelName}`)) {
          formattedChannelName = `private-${channelName}`;
        } else if (this.pusherChannels.has(`presence-${channelName}`)) {
          formattedChannelName = `presence-${channelName}`;
        } else {
          throw new Error(`Channel ${channelName} not found`);
        }
      }

      const pusherChannel = this.pusherChannels.get(formattedChannelName);
      if (!pusherChannel) {
        throw new Error(`Channel ${formattedChannelName} not found`);
      }

      // Set up event listener on Pusher channel
      const callback = (data: any) => {
        listener(data);
      };
      
      pusherChannel.bind(eventName, callback);

      // Store event listener reference
      if (!this.eventListeners.has(formattedChannelName)) {
        this.eventListeners.set(formattedChannelName, new Map());
      }
      
      const channelListeners = this.eventListeners.get(formattedChannelName);
      if (!channelListeners) {
        throw new Error(`Channel listeners for ${formattedChannelName} not found`);
      }
      
      if (!channelListeners.has(eventName)) {
        channelListeners.set(eventName, new Set());
      }
      
      const eventListeners = channelListeners.get(eventName);
      if (!eventListeners) {
        throw new Error(`Event listeners for ${formattedChannelName}:${eventName} not found`);
      }
      
      eventListeners.add(listener);

      // Return unsubscribe function
      return () => {
        this.off(channelName, eventName, listener);
      };
    } catch (error) {
      this.logError('Error binding to Pusher event:', channelName, eventName, error);
      throw error;
    }
  }

  off(channelName: string, eventName: RealtimeEvent, listener?: RealtimeListener): void {
    if (!this.pusher) {
      return;
    }

    try {
      // Find which channel type is being used
      let formattedChannelName = channelName;
      if (!this.pusherChannels.has(channelName)) {
        // Try with different prefixes
        if (this.pusherChannels.has(`private-${channelName}`)) {
          formattedChannelName = `private-${channelName}`;
        } else if (this.pusherChannels.has(`presence-${channelName}`)) {
          formattedChannelName = `presence-${channelName}`;
        } else {
          return; // Channel not found, nothing to unbind
        }
      }

      const pusherChannel = this.pusherChannels.get(formattedChannelName);
      if (!pusherChannel) {
        return; // Channel not found, nothing to unbind
      }

      if (listener) {
        // Unbind specific listener
        pusherChannel.unbind(eventName, listener);
        
        // Remove listener reference
        const channelListeners = this.eventListeners.get(formattedChannelName);
        if (channelListeners) {
          const eventListeners = channelListeners.get(eventName);
          if (eventListeners) {
            eventListeners.delete(listener);
          }
        }
      } else {
        // Unbind all listeners for event
        pusherChannel.unbind(eventName);
        
        // Remove all listener references for event
        const channelListeners = this.eventListeners.get(formattedChannelName);
        if (channelListeners) {
          channelListeners.delete(eventName);
        }
      }
    } catch (error) {
      this.logError('Error unbinding from Pusher event:', channelName, eventName, error);
    }
  }

  async trigger(channelName: string, eventName: RealtimeEvent, data: any): Promise<void> {
    // Pusher client-side doesn't support triggering events directly
    // We need to use server-side API or a proxy endpoint
    try {
      // Format channel name based on type
      let formattedChannelName = channelName;
      const channelType = this.getChannelTypeFromName(channelName);
      
      if (!channelName.startsWith('private-') && !channelName.startsWith('presence-') && channelType !== ChannelType.PUBLIC) {
        formattedChannelName = this.formatChannelName(channelName, channelType);
      }

      // Call server endpoint to trigger event
      const response = await fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken() || ''}`
        },
        body: JSON.stringify({
          channel: formattedChannelName,
          event: eventName,
          data
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to trigger event: ${response.statusText}`);
      }

      return Promise.resolve();
    } catch (error) {
      this.logError('Error triggering Pusher event:', channelName, eventName, error);
      return Promise.reject(error);
    }
  }

  getMembers(channelName: string): Record<string, RealtimeUserInfo> {
    // Find which channel type is being used
    let formattedChannelName = channelName;
    if (!this.channels.has(channelName)) {
      // Try with presence prefix
      formattedChannelName = `presence-${this.normalizeChannelName(channelName)}`;
      if (!this.channels.has(formattedChannelName)) {
        return {};
      }
    }

    const channel = this.channels.get(formattedChannelName);
    if (!channel || !channel.members) {
      return {};
    }

    return channel.members;
  }

  getMembersCount(channelName: string): number {
    return Object.keys(this.getMembers(channelName)).length;
  }

  destroy(): void {
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
    }
    
    this.pusherChannels.clear();
    super.destroy();
  }
}
