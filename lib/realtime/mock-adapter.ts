"use client";

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

/**
 * Mock adapter for local development and testing
 * Simulates real-time behavior without actual network connections
 */
export class MockAdapter extends BaseRealtimeAdapter {
  private eventEmitter: Map<string, Map<string, Set<(data: any) => void>>> = new Map();
  private connected: boolean = false;
  private sessionId: string = `mock-${Math.random().toString(36).substring(2, 10)}`;
  private mockPresenceUsers: Record<string, RealtimeUserInfo>[] = [];

  constructor(config: RealtimeConfig) {
    super({
      debug: true,
      ...config
    });

    // Generate some mock presence users if not provided
    if (!config.mockData?.users) {
      this.mockPresenceUsers = [
        {
          "1": {
            id: 1,
            name: "John Doe",
            email: "john.doe@example.com",
            firstName: "John",
            lastName: "Doe",
            role: "admin"
          }
        },
        {
          "2": {
            id: 2,
            name: "Jane Smith",
            email: "jane.smith@example.com",
            firstName: "Jane",
            lastName: "Smith",
            role: "user"
          }
        },
        {
          "3": {
            id: 3,
            name: "Bob Johnson",
            email: "bob.johnson@example.com",
            firstName: "Bob",
            lastName: "Johnson",
            role: "developer"
          }
        }
      ];
    } else {
      this.mockPresenceUsers = config.mockData.users;
    }
  }

  async connect(): Promise<void> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    this.connected = true;
    this.connectionInfo = {
      state: ConnectionState.CONNECTED,
      socketId: this.sessionId
    };
    
    this.log('Mock adapter connected');
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.connectionInfo = {
      state: ConnectionState.DISCONNECTED
    };
    
    this.log('Mock adapter disconnected');
    return Promise.resolve();
  }

  async subscribe(channelName: string, options: ChannelOptions = { type: ChannelType.PUBLIC }): Promise<Channel> {
    if (!this.connected) {
      await this.connect();
    }

    // Format channel name based on type
    const formattedChannelName = this.formatChannelName(channelName, options.type);
    
    // Check if already subscribed
    if (this.channels.has(formattedChannelName)) {
      const existingChannel = this.channels.get(formattedChannelName);
      if (existingChannel) {
        return existingChannel;
      }
    }

    // Create a new channel
    const channel: Channel = {
      name: formattedChannelName,
      type: options.type,
      members: {}
    };

    // If presence channel, add mock members
    if (options.type === ChannelType.PRESENCE) {
      const normalizedName = this.normalizeChannelName(channelName);
      
      // Generate some mock members for this channel
      channel.members = {};
      
      // Add current user
      const currentUser = this.getUserInfo();
      if (currentUser) {
        channel.members[currentUser.id.toString()] = currentUser;
      }
      
      // Add some random mock users
      const numMockUsers = Math.floor(Math.random() * 3) + 1; // 1-3 random users
      for (let i = 0; i < numMockUsers; i++) {
        const mockUser = this.mockPresenceUsers[i % this.mockPresenceUsers.length];
        if (mockUser) {
          const userId = Object.keys(mockUser)[0];
          channel.members[userId] = mockUser[userId];
        }
      }
      
      // Log the members
      this.log(`Mock presence channel ${formattedChannelName} subscribed with members:`, channel.members);
      
      // Simulate presence events after a short delay
      setTimeout(() => {
        this.emit(formattedChannelName, 'presence:subscribed', { members: channel.members });
      }, 500);
    } else {
      this.log(`Mock channel ${formattedChannelName} subscribed`);
    }

    // Store channel reference
    this.channels.set(formattedChannelName, channel);

    return channel;
  }

  async unsubscribe(channelName: string): Promise<void> {
    // Find which channel type is being used
    let formattedChannelName = channelName;
    const normalizedName = this.normalizeChannelName(channelName);
    
    if (!this.channels.has(formattedChannelName)) {
      // Try with different prefixes
      if (this.channels.has(`private-${normalizedName}`)) {
        formattedChannelName = `private-${normalizedName}`;
      } else if (this.channels.has(`presence-${normalizedName}`)) {
        formattedChannelName = `presence-${normalizedName}`;
      }
    }

    // Remove channel reference
    this.channels.delete(formattedChannelName);
    
    // Clean up event listeners for this channel
    this.eventListeners.delete(formattedChannelName);
    
    this.log(`Mock channel ${formattedChannelName} unsubscribed`);
    return Promise.resolve();
  }

  on(channelName: string, eventName: RealtimeEvent, listener: RealtimeListener): () => void {
    // Format channel name
    const normalizedName = this.normalizeChannelName(channelName);
    let formattedChannelName = channelName;
    
    if (!this.channels.has(formattedChannelName)) {
      // Try with different prefixes
      if (this.channels.has(`private-${normalizedName}`)) {
        formattedChannelName = `private-${normalizedName}`;
      } else if (this.channels.has(`presence-${normalizedName}`)) {
        formattedChannelName = `presence-${normalizedName}`;
      }
    }

    // Store event listener
    if (!this.eventEmitter.has(formattedChannelName)) {
      this.eventEmitter.set(formattedChannelName, new Map());
    }
    
    const channelEvents = this.eventEmitter.get(formattedChannelName);
    if (!channelEvents) {
      throw new Error(`Channel events for ${formattedChannelName} not found`);
    }
    
    if (!channelEvents.has(eventName)) {
      channelEvents.set(eventName, new Set());
    }
    
    const eventListeners = channelEvents.get(eventName);
    if (!eventListeners) {
      throw new Error(`Event listeners for ${formattedChannelName}:${eventName} not found`);
    }
    
    eventListeners.add(listener);
    
    // Also store in the standard eventListeners map for consistency
    if (!this.eventListeners.has(formattedChannelName)) {
      this.eventListeners.set(formattedChannelName, new Map());
    }
    
    const standardChannelListeners = this.eventListeners.get(formattedChannelName);
    if (!standardChannelListeners) {
      throw new Error(`Standard channel listeners for ${formattedChannelName} not found`);
    }
    
    if (!standardChannelListeners.has(eventName)) {
      standardChannelListeners.set(eventName, new Set());
    }
    
    const standardEventListeners = standardChannelListeners.get(eventName);
    if (!standardEventListeners) {
      throw new Error(`Standard event listeners for ${formattedChannelName}:${eventName} not found`);
    }
    
    standardEventListeners.add(listener);
    
    this.log(`Mock listener added for ${formattedChannelName}:${eventName}`);
    
    // Return unsubscribe function
    return () => {
      this.off(channelName, eventName, listener);
    };
  }

  off(channelName: string, eventName: RealtimeEvent, listener?: RealtimeListener): void {
    // Format channel name
    const normalizedName = this.normalizeChannelName(channelName);
    let formattedChannelName = channelName;
    
    if (!this.eventEmitter.has(formattedChannelName)) {
      // Try with different prefixes
      if (this.eventEmitter.has(`private-${normalizedName}`)) {
        formattedChannelName = `private-${normalizedName}`;
      } else if (this.eventEmitter.has(`presence-${normalizedName}`)) {
        formattedChannelName = `presence-${normalizedName}`;
      }
    }

    const channelEvents = this.eventEmitter.get(formattedChannelName);
    if (!channelEvents) {
      return;
    }
    
    if (listener) {
      // Remove specific listener
      const eventListeners = channelEvents.get(eventName);
      if (eventListeners) {
        eventListeners.delete(listener);
      }
      
      // Also remove from standard listeners
      const standardChannelListeners = this.eventListeners.get(formattedChannelName);
      if (standardChannelListeners) {
        const standardEventListeners = standardChannelListeners.get(eventName);
        if (standardEventListeners) {
          standardEventListeners.delete(listener);
        }
      }
    } else {
      // Remove all listeners for this event
      channelEvents.delete(eventName);
      
      // Also remove from standard listeners
      const standardChannelListeners = this.eventListeners.get(formattedChannelName);
      if (standardChannelListeners) {
        standardChannelListeners.delete(eventName);
      }
    }
    
    this.log(`Mock listener removed for ${formattedChannelName}:${eventName}`);
  }

  async trigger(channelName: string, eventName: RealtimeEvent, data: any): Promise<void> {
    // Format channel name
    const normalizedName = this.normalizeChannelName(channelName);
    let formattedChannelName = channelName;
    
    if (!this.channels.has(formattedChannelName)) {
      // Try with different prefixes
      if (this.channels.has(`private-${normalizedName}`)) {
        formattedChannelName = `private-${normalizedName}`;
      } else if (this.channels.has(`presence-${normalizedName}`)) {
        formattedChannelName = `presence-${normalizedName}`;
      }
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Emit the event
    this.emit(formattedChannelName, eventName, data);
    
    this.log(`Mock event triggered for ${formattedChannelName}:${eventName}`, data);
    return Promise.resolve();
  }

  private emit(channelName: string, eventName: string, data: any): void {
    const channelEvents = this.eventEmitter.get(channelName);
    if (!channelEvents) {
      return;
    }
    
    const eventListeners = channelEvents.get(eventName);
    if (!eventListeners) {
      return;
    }
    
    // Call all listeners
    for (const listener of eventListeners) {
      try {
        listener(data);
      } catch (error) {
        this.logError(`Error in mock listener for ${channelName}:${eventName}`, error);
      }
    }
  }

  getMembers(channelName: string): Record<string, RealtimeUserInfo> {
    // Format channel name
    const normalizedName = this.normalizeChannelName(channelName);
    let formattedChannelName = `presence-${normalizedName}`;
    
    if (!this.channels.has(formattedChannelName)) {
      formattedChannelName = channelName;
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
    this.connected = false;
    this.eventEmitter.clear();
    super.destroy();
  }
}
