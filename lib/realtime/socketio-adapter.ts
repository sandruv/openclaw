"use client";

import { io, Socket } from 'socket.io-client';
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

export class SocketIOAdapter extends BaseRealtimeAdapter {
  private socket: Socket | null = null;
  private socketRooms: Set<string> = new Set();
  private presenceData: Map<string, Record<string, RealtimeUserInfo>> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000;

  constructor(config: RealtimeConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    if (this.socket) {
      this.log('Socket.IO client already initialized');
      return Promise.resolve();
    }

    this.connectionInfo.state = ConnectionState.CONNECTING;

    try {
      // Get user info for auth
      const userInfo = this.getUserInfo();
      
      // Determine connection URL
      let url = this.config.host || '';
      
      if (!url) {
        // If no URL provided, construct one from the current origin with the socket port
        if (typeof window !== 'undefined') {
          const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
          const hostname = window.location.hostname;
          const port = this.config.port || process.env.NEXT_PUBLIC_SOCKET_PORT || '3001';
          url = `${protocol}://${hostname}:${port}`;
        } else {
          throw new Error('No socket URL provided and not in a browser environment');
        }
      }
      
      this.log('Initializing Socket.IO connection to:', url);
      
      // Socket.IO connection options
      const socketOptions: any = {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 10000,
        timeout: 20000,
        autoConnect: true,
        path: this.config.path || process.env.NEXT_PUBLIC_SOCKET_PATH || '/socket.io',
        forceNew: true,
        auth: {
          userId: userInfo?.id,
          userName: userInfo?.name,
          firstName: userInfo?.firstName,
          lastName: userInfo?.lastName,
          email: userInfo?.email,
          token: this.getAuthToken()
        }
      };
      
      // Add secure option for HTTPS connections
      if (url.startsWith('https')) {
        socketOptions.secure = true;
      }
      
      // Initialize Socket.IO connection
      this.socket = io(url, socketOptions);
      
      // Set up socket event handlers
      this.setupSocketEvents();
      
      return Promise.resolve();
    } catch (error) {
      this.connectionInfo = {
        state: ConnectionState.FAILED,
        error: error instanceof Error ? error : new Error(String(error))
      };
      this.logError('Error initializing Socket.IO client:', error);
      return Promise.reject(error);
    }
  }

  private setupSocketEvents(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.connectionInfo = {
        state: ConnectionState.CONNECTED,
        socketId: this.socket?.id
      };
      this.reconnectAttempts = 0;
      this.log('Socket.IO connected', this.connectionInfo);
      
      // Rejoin all rooms after reconnect
      this.rejoinRooms();
    });

    this.socket.on('disconnect', (reason) => {
      this.connectionInfo.state = ConnectionState.DISCONNECTED;
      this.log('Socket.IO disconnected:', reason);
      
      // Attempt to reconnect if the disconnect wasn't intentional
      if (reason !== 'io client disconnect') {
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      this.connectionInfo = {
        state: ConnectionState.FAILED,
        error: error
      };
      this.logError('Socket.IO connection error:', error);
      this.attemptReconnect();
    });
    
    this.socket.on('presence', (data: { room: string, members: Record<string, RealtimeUserInfo> }) => {
      this.log('Received presence update for room:', data.room, data.members);
      
      if (data.room && data.members) {
        // Update presence data for the room
        this.presenceData.set(data.room, data.members);
        
        // Update channel members
        const formattedChannelName = `presence-${data.room}`;
        const channel = this.channels.get(formattedChannelName);
        
        if (channel) {
          channel.members = data.members;
          this.log('Updated presence channel members:', formattedChannelName, data.members);
        }
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logError(`Max reconnection attempts (${this.maxReconnectAttempts}) reached`);
      return;
    }
    
    this.reconnectAttempts++;
    this.connectionInfo.state = ConnectionState.CONNECTING;
    
    this.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    this.reconnectTimer = setTimeout(() => {
      if (this.socket) {
        this.socket.connect();
      } else {
        this.connect();
      }
    }, this.reconnectDelay);
  }

  private rejoinRooms(): void {
    // Rejoin all rooms after a reconnect
    for (const room of this.socketRooms) {
      this.log(`Rejoining room: ${room}`);
      this.socket?.emit('join', { room });
    }
  }

  async disconnect(): Promise<void> {
    if (!this.socket) {
      return Promise.resolve();
    }

    try {
      // Clear reconnect timer if active
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      // Leave all rooms
      for (const room of this.socketRooms) {
        this.socket.emit('leave', { room });
      }
      
      // Disconnect socket
      this.socket.disconnect();
      this.socket = null;
      this.socketRooms.clear();
      this.connectionInfo.state = ConnectionState.DISCONNECTED;
      
      return Promise.resolve();
    } catch (error) {
      this.logError('Error disconnecting Socket.IO client:', error);
      return Promise.reject(error);
    }
  }

  async subscribe(channelName: string, options: ChannelOptions = { type: ChannelType.PUBLIC }): Promise<Channel> {
    if (!this.socket) {
      await this.connect();
    }

    if (!this.socket) {
      throw new Error('Socket.IO client not initialized');
    }

    try {
      // Format channel name based on type
      const formattedChannelName = this.formatChannelName(channelName, options.type);
      const normalizedName = this.normalizeChannelName(channelName);
      
      // Check if already subscribed
      if (this.channels.has(formattedChannelName)) {
        const existingChannel = this.channels.get(formattedChannelName);
        if (existingChannel) {
          return existingChannel;
        }
      }

      // Create a new channel object
      const channel: Channel = {
        name: formattedChannelName,
        type: options.type,
        members: {}
      };

      // Join room for this channel
      this.socket.emit('join', { 
        room: normalizedName,
        presence: options.type === ChannelType.PRESENCE,
        userInfo: options.type === ChannelType.PRESENCE ? this.getUserInfo() : undefined
      });
      
      // Add to rooms set
      this.socketRooms.add(normalizedName);
      
      // If presence channel, request initial presence data
      if (options.type === ChannelType.PRESENCE) {
        this.socket.emit('presence:get', { room: normalizedName });
      }
      
      // Store channel reference
      this.channels.set(formattedChannelName, channel);

      return channel;
    } catch (error) {
      this.logError('Error subscribing to Socket.IO channel:', channelName, error);
      throw error;
    }
  }

  async unsubscribe(channelName: string): Promise<void> {
    if (!this.socket) {
      return Promise.resolve();
    }

    try {
      // Find which channel type is being used
      let formattedChannelName = channelName;
      const normalizedName = this.normalizeChannelName(channelName);
      
      // Leave room for this channel
      this.socket.emit('leave', { room: normalizedName });
      
      // Remove from rooms set
      this.socketRooms.delete(normalizedName);
      
      // Remove channel references
      if (this.channels.has(formattedChannelName)) {
        this.channels.delete(formattedChannelName);
      } else if (this.channels.has(`private-${normalizedName}`)) {
        this.channels.delete(`private-${normalizedName}`);
      } else if (this.channels.has(`presence-${normalizedName}`)) {
        this.channels.delete(`presence-${normalizedName}`);
      }
      
      // Clean up presence data
      this.presenceData.delete(normalizedName);
      
      // Clean up event listeners for this channel
      this.eventListeners.delete(formattedChannelName);
      this.eventListeners.delete(`private-${normalizedName}`);
      this.eventListeners.delete(`presence-${normalizedName}`);

      return Promise.resolve();
    } catch (error) {
      this.logError('Error unsubscribing from Socket.IO channel:', channelName, error);
      return Promise.reject(error);
    }
  }

  on(channelName: string, eventName: RealtimeEvent, listener: RealtimeListener): () => void {
    if (!this.socket) {
      throw new Error('Socket.IO client not initialized');
    }
    
    // Format channel name and normalize for room
    const formattedChannelName = channelName;
    const normalizedName = this.normalizeChannelName(channelName);
    
    // Create a wrapper function to handle room-specific events
    const callback = (data: any) => {
      // Check if the event is for the correct room
      if (data && data.room && data.room !== normalizedName) {
        return;
      }
      
      // Pass along just the payload, not the room info
      const payload = data && data.data !== undefined ? data.data : data;
      listener(payload);
    };
    
    // Register for the event
    this.socket.on(`${normalizedName}:${eventName}`, callback);
    
    // Also register for global events
    this.socket.on(eventName, callback);
    
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
  }

  off(channelName: string, eventName: RealtimeEvent, listener?: RealtimeListener): void {
    if (!this.socket) {
      return;
    }
    
    // Format channel name and normalize for room
    const formattedChannelName = channelName;
    const normalizedName = this.normalizeChannelName(channelName);
    
    if (listener) {
      // Unbind specific listener
      this.socket.off(`${normalizedName}:${eventName}`);
      
      // Also unbind from global events
      this.socket.off(eventName);
      
      // Remove listener reference
      const channelListeners = this.eventListeners.get(formattedChannelName);
      if (channelListeners) {
        const eventListeners = channelListeners.get(eventName);
        if (eventListeners) {
          eventListeners.delete(listener);
        }
      }
    } else {
      // Unbind all listeners for this event
      this.socket.off(`${normalizedName}:${eventName}`);
      
      // Remove all listener references for event
      const channelListeners = this.eventListeners.get(formattedChannelName);
      if (channelListeners) {
        channelListeners.delete(eventName);
      }
    }
  }

  async trigger(channelName: string, eventName: RealtimeEvent, data: any): Promise<void> {
    if (!this.socket) {
      throw new Error('Socket.IO client not initialized');
    }
    
    try {
      // Format channel name and normalize for room
      const normalizedName = this.normalizeChannelName(channelName);
      
      // Emit event to server
      this.socket.emit('event', {
        room: normalizedName,
        event: eventName,
        data
      });
      
      return Promise.resolve();
    } catch (error) {
      this.logError('Error triggering Socket.IO event:', channelName, eventName, error);
      return Promise.reject(error);
    }
  }

  getMembers(channelName: string): Record<string, RealtimeUserInfo> {
    // Format channel name and normalize for room
    const normalizedName = this.normalizeChannelName(channelName);
    
    // Get presence data for room
    const presenceData = this.presenceData.get(normalizedName);
    if (presenceData) {
      return presenceData;
    }
    
    // Try to get from channel members
    const formattedChannelName = `presence-${normalizedName}`;
    const channel = this.channels.get(formattedChannelName);
    if (channel && channel.members) {
      return channel.members;
    }
    
    return {};
  }

  getMembersCount(channelName: string): number {
    return Object.keys(this.getMembers(channelName)).length;
  }

  destroy(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.socketRooms.clear();
    this.presenceData.clear();
    super.destroy();
  }
}
