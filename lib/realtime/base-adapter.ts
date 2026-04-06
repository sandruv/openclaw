/**
 * Abstract base adapter that provides common functionality 
 * and default implementations for the RealtimeAdapter interface
 */

import {
  Channel,
  ChannelOptions,
  ChannelType,
  ConnectionInfo,
  ConnectionState,
  RealtimeAdapter,
  RealtimeConfig,
  RealtimeEvent,
  RealtimeListener,
  RealtimeUserInfo
} from './types';

export abstract class BaseRealtimeAdapter implements RealtimeAdapter {
  protected config: RealtimeConfig;
  protected channels: Map<string, Channel> = new Map();
  protected connectionInfo: ConnectionInfo = {
    state: ConnectionState.DISCONNECTED
  };
  protected eventListeners: Map<string, Map<RealtimeEvent, Set<RealtimeListener>>> = new Map();

  constructor(config: RealtimeConfig) {
    this.config = {
      debug: false,
      ...config
    };
  }

  // Logging utility
  protected log(...args: any[]): void {
    if (this.config.debug) {
      console.log(`[RealtimeAdapter]`, ...args);
    }
  }

  // Error logging utility
  protected logError(...args: any[]): void {
    console.error(`[RealtimeAdapter]`, ...args);
  }

  // Connection methods (to be implemented by specific adapters)
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;

  // Default implementation for getting connection info
  getConnectionInfo(): ConnectionInfo {
    return this.connectionInfo;
  }

  // Channel management methods (to be implemented by specific adapters)
  abstract subscribe(channelName: string, options?: ChannelOptions): Promise<Channel>;
  abstract unsubscribe(channelName: string): Promise<void>;

  // Default implementation for getting subscribed channels
  getSubscribedChannels(): Channel[] {
    return Array.from(this.channels.values());
  }

  // Event handling methods (to be implemented by specific adapters)
  abstract on(channelName: string, eventName: RealtimeEvent, listener: RealtimeListener): () => void;
  abstract off(channelName: string, eventName: RealtimeEvent, listener?: RealtimeListener): void;
  abstract trigger(channelName: string, eventName: RealtimeEvent, data: any): Promise<void>;

  // Presence methods (to be implemented by specific adapters)
  abstract getMembers(channelName: string): Record<string, RealtimeUserInfo>;
  abstract getMembersCount(channelName: string): number;

  // Helper method to get user info from local storage
  protected getUserInfo(): RealtimeUserInfo | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userStr = localStorage.getItem('ywp_user');
      if (!userStr) return null;
      
      const userData = JSON.parse(userStr);
      return {
        id: userData.id,
        name: `${userData.first_name} ${userData.last_name}`.trim(),
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role?.name || 'user'
      };
    } catch (error) {
      this.logError('Error getting user info from localStorage:', error);
      return null;
    }
  }

  // Helper method to get auth token from local storage
  protected getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      return localStorage.getItem('ywp_token');
    } catch (error) {
      this.logError('Error getting auth token from localStorage:', error);
      return null;
    }
  }

  // Default implementation for cleanup
  destroy(): void {
    this.disconnect();
    this.eventListeners.clear();
    this.channels.clear();
  }

  // Format channel name based on type
  protected formatChannelName(channelName: string, type: ChannelType): string {
    switch (type) {
      case ChannelType.PRIVATE:
        return channelName.startsWith('private-') ? channelName : `private-${channelName}`;
      case ChannelType.PRESENCE:
        return channelName.startsWith('presence-') ? channelName : `presence-${channelName}`;
      case ChannelType.PUBLIC:
      default:
        return channelName.startsWith('private-') || channelName.startsWith('presence-') 
          ? channelName.replace(/^(private-|presence-)/, '') 
          : channelName;
    }
  }

  // Helper method to normalize channel name for internal use
  protected normalizeChannelName(channelName: string): string {
    return channelName.replace(/^(private-|presence-)/, '');
  }

  // Helper method to determine channel type from name
  protected getChannelTypeFromName(channelName: string): ChannelType {
    if (channelName.startsWith('presence-')) return ChannelType.PRESENCE;
    if (channelName.startsWith('private-')) return ChannelType.PRIVATE;
    return ChannelType.PUBLIC;
  }
}
