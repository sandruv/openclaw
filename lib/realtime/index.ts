/**
 * Realtime module exports
 * Provides a unified interface for all real-time communication needs
 */

// Re-export types
export * from './types';

// Re-export adapter factory
export { AdapterType, createAdapter } from './adapter-factory';

// Re-export service
export { realtimeService as default } from './realtime-service';

// Named export for service
export { realtimeService } from './realtime-service';

// Re-export adapters for advanced usage
export { PusherAdapter } from './pusher-adapter';
export { SocketIOAdapter } from './socketio-adapter';
export { MockAdapter } from './mock-adapter';
export { BaseRealtimeAdapter } from './base-adapter';
