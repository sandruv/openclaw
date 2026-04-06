"use client";

import { RealtimeAdapter, RealtimeConfig } from './types';
import { PusherAdapter } from './pusher-adapter';
import { SocketIOAdapter } from './socketio-adapter';
import { MockAdapter } from './mock-adapter';

// Adapter types
export enum AdapterType {
  PUSHER = 'pusher',
  SOCKETIO = 'socketio',
  MOCK = 'mock'
}

/**
 * Creates the appropriate realtime adapter based on configuration
 */
export function createAdapter(type: AdapterType, config: RealtimeConfig = {}): RealtimeAdapter {
  switch (type) {
    case AdapterType.PUSHER:
      return new PusherAdapter(config);
    case AdapterType.SOCKETIO:
      return new SocketIOAdapter(config);
    case AdapterType.MOCK:
      return new MockAdapter(config);
    default:
      throw new Error(`Unknown adapter type: ${type}`);
  }
}
