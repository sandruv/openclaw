import { apiRequest } from '@/services/api/clientConfig';

/**
 * RealtimeApiService - Handles all API calls related to real-time functionality
 * This service centralizes API interactions for realtime components
 */
export const realtimeApiService = {
  /**
   * Ping server to measure latency
   * @returns Response with timestamp and message
   */
  ping: async () => {
    return apiRequest<{ success: boolean; timestamp: number; message: string }>('realtime/ping', {
      method: 'GET'
    });
  },

  /**
   * Trigger a realtime event through the API
   * @param channel Channel to send the event to
   * @param event Event name
   * @param data Event data (payload)
   * @returns Response with status
   */
  triggerEvent: async (channel: string, event: string, data: any) => {
    return apiRequest<{ success: boolean }>('realtime/trigger', {
      method: 'POST',
      data: {
        channel,
        event,
        data
      }
    });
  },

  /**
   * Authenticate a private or presence channel
   * @param socketId Socket ID from the realtime provider
   * @param channel Channel name to authenticate
   * @param userData Optional user data for presence channels
   * @returns Authentication token response
   */
  authenticate: async (socketId: string, channel: string, userData?: any) => {
    return apiRequest<{ auth: string; channel_data?: string }>('realtime/auth', {
      method: 'POST',
      data: {
        socket_id: socketId,
        channel_name: channel,
        user_data: userData
      }
    });
  },
  
  /**
   * Get connected clients (for Socket.IO adapter)
   * @returns List of connected client IDs
   */
  getConnectedClients: async () => {
    return apiRequest<{ success: boolean; clients: string[]; count: number }>('socket/clients', {
      method: 'GET'
    });
  }
};

export default realtimeApiService;
