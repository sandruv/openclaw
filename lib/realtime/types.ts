/**
 * Core interfaces for the real-time communication system
 * These interfaces define the contract that all real-time adapters must implement
 */

// Event types for better type safety
export type RealtimeEvent = 
  | 'connect'
  | 'disconnect'
  | 'reconnect'
  | 'error'
  | 'task:update'
  | 'task:create'
  | 'task:delete'
  | 'task:order-update'
  | 'activity:create'
  | 'activity:update'
  | 'activity:delete'
  | 'notification'
  | 'message'
  | string; // Allow for custom event types

// Listener type for event callbacks
export type RealtimeListener = (data: any) => void;

// User information for presence channels
export interface RealtimeUserInfo {
  id: number | string;
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  avatar?: string;
}

// Channel types
export enum ChannelType {
  PUBLIC = 'public',      // Anyone can subscribe
  PRIVATE = 'private',    // Only authenticated users with permission can subscribe
  PRESENCE = 'presence'   // Like private but includes member awareness
}

// Channel subscription options
export interface ChannelOptions {
  type: ChannelType;
  withPresence?: boolean;
  userInfo?: RealtimeUserInfo;
}

// Channel representation
export interface Channel {
  name: string;
  type: ChannelType;
  members?: Record<string, RealtimeUserInfo>;
}

// Configuration for real-time adapters
export interface RealtimeConfig {
  appKey?: string;
  appId?: string;
  cluster?: string;
  host?: string;
  port?: string | number;
  path?: string;
  authEndpoint?: string;
  forceSecure?: boolean;
  mockData?: any;
  debug?: boolean;
}

// Connection state
export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  FAILED = 'failed'
}

// Connection information
export interface ConnectionInfo {
  state: ConnectionState;
  socketId?: string;
  latency?: number;
  error?: Error | string;
}

// Core interface that all real-time adapters must implement
export interface RealtimeAdapter {
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getConnectionInfo(): ConnectionInfo;
  
  // Channel management
  subscribe(channelName: string, options?: ChannelOptions): Promise<Channel>;
  unsubscribe(channelName: string): Promise<void>;
  getSubscribedChannels(): Channel[];
  
  // Event management
  on(channelName: string, eventName: RealtimeEvent, listener: RealtimeListener): () => void;
  off(channelName: string, eventName: RealtimeEvent, listener?: RealtimeListener): void;
  trigger(channelName: string, eventName: RealtimeEvent, data: any): Promise<void>;
  
  // Presence functionality
  getMembers(channelName: string): Record<string, RealtimeUserInfo>;
  getMembersCount(channelName: string): number;
  
  // Cleanup
  destroy(): void;
}

// Factory function type for creating adapters
export type RealtimeAdapterFactory = (config: RealtimeConfig) => RealtimeAdapter;