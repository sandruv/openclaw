"use client";

import { 
  RealtimeAdapter, 
  RealtimeEvent, 
  RealtimeListener, 
  RealtimeConfig,
  Channel,
  ChannelOptions,
  ChannelType,
  ConnectionInfo,
  RealtimeUserInfo
} from './types';
import { createAdapter, AdapterType } from './adapter-factory';

/**
 * Main service that provides a unified interface for real-time communication,
 * abstracting away the details of the underlying adapter.
 */
class RealtimeService {
  private adapter: RealtimeAdapter | null = null;
  private adapterType: AdapterType | null = null;
  private config: RealtimeConfig = {};
  private initialized: boolean = false;

  /**
   * Initialize the real-time service with the specified adapter type and configuration.
   * This should be called as early as possible in the application lifecycle.
   */
  initialize(options: { 
    adapterType?: AdapterType | string; 
    config?: RealtimeConfig 
  } = {}): void {
    if (this.initialized) {
      console.warn('RealtimeService already initialized');
      return;
    }

    // Get adapter type from options or environment variable or default to Pusher
    const adapterType = options.adapterType || 
      (process.env.NEXT_PUBLIC_REALTIME_ADAPTER as AdapterType) || 
      AdapterType.PUSHER;

    // Map string adapter type to enum
    let adapterEnum: AdapterType;
    if (typeof adapterType === 'string') {
      switch (adapterType.toLowerCase()) {
        case 'pusher':
          adapterEnum = AdapterType.PUSHER;
          break;
        case 'socketio':
          adapterEnum = AdapterType.SOCKETIO;
          break;
        case 'mock':
          adapterEnum = AdapterType.MOCK;
          break;
        default:
          console.warn(`Unknown adapter type: ${adapterType}, falling back to mock`);
          adapterEnum = AdapterType.MOCK;
      }
    } else {
      adapterEnum = adapterType;
    }

    // Get config from options or environment variables
    const config: RealtimeConfig = {
      ...(options.config || {}),
      debug: options.config?.debug || process.env.NEXT_PUBLIC_REALTIME_DEBUG === 'true',
      appKey: options.config?.appKey || process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
      cluster: options.config?.cluster || process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER
    };

    // Create the adapter
    this.adapter = createAdapter(adapterEnum, config);
    this.adapterType = adapterEnum;
    this.config = config;
    this.initialized = true;

    console.log(`RealtimeService initialized with ${adapterEnum} adapter`);
  }

  /**
   * Ensure the service is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.adapter) {
      this.initialize();
    }
  }

  /**
   * Connect to the real-time service
   */
  async connect(): Promise<void> {
    this.ensureInitialized();
    return this.adapter!.connect();
  }

  /**
   * Disconnect from the real-time service
   */
  async disconnect(): Promise<void> {
    if (!this.adapter) return Promise.resolve();
    return this.adapter.disconnect();
  }

  /**
   * Get connection information
   */
  getConnectionInfo(): ConnectionInfo {
    this.ensureInitialized();
    return this.adapter!.getConnectionInfo();
  }

  /**
   * Subscribe to a channel
   */
  async subscribe(channelName: string, options?: ChannelOptions): Promise<Channel> {
    this.ensureInitialized();
    return this.adapter!.subscribe(channelName, options);
  }

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channelName: string): Promise<void> {
    if (!this.adapter) return Promise.resolve();
    return this.adapter.unsubscribe(channelName);
  }

  /**
   * Get all subscribed channels
   */
  getSubscribedChannels(): Channel[] {
    if (!this.adapter) return [];
    return this.adapter.getSubscribedChannels();
  }

  /**
   * Listen for events on a channel
   */
  on(channelName: string, eventName: RealtimeEvent, listener: RealtimeListener): () => void {
    this.ensureInitialized();
    return this.adapter!.on(channelName, eventName, listener);
  }

  /**
   * Stop listening for events on a channel
   */
  off(channelName: string, eventName: RealtimeEvent, listener?: RealtimeListener): void {
    if (!this.adapter) return;
    this.adapter.off(channelName, eventName, listener);
  }

  /**
   * Trigger an event on a channel
   */
  async trigger(channelName: string, eventName: RealtimeEvent, data: any): Promise<void> {
    this.ensureInitialized();
    return this.adapter!.trigger(channelName, eventName, data);
  }

  /**
   * Get members of a presence channel
   */
  getMembers(channelName: string): Record<string, RealtimeUserInfo> {
    if (!this.adapter) return {};
    return this.adapter.getMembers(channelName);
  }

  /**
   * Get the number of members in a presence channel
   */
  getMembersCount(channelName: string): number {
    if (!this.adapter) return 0;
    return this.adapter.getMembersCount(channelName);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (!this.adapter) return;
    this.adapter.destroy();
    this.adapter = null;
    this.initialized = false;
  }

  /**
   * Get the current adapter type
   */
  getAdapterType(): AdapterType | null {
    return this.adapterType;
  }

  /**
   * Helper to format channel names correctly based on type
   */
  formatChannelName(name: string, type: ChannelType): string {
    switch (type) {
      case ChannelType.PRIVATE:
        return name.startsWith('private-') ? name : `private-${name}`;
      case ChannelType.PRESENCE:
        return name.startsWith('presence-') ? name : `presence-${name}`;
      case ChannelType.PUBLIC:
      default:
        return name.startsWith('private-') || name.startsWith('presence-') 
          ? name.replace(/^(private-|presence-)/, '') 
          : name;
    }
  }
}

// Create a singleton instance
export const realtimeService = new RealtimeService();

// Export for convenience
export default realtimeService;
