'use client';

import { pusherClient } from '@/lib/pusher-client';
import { apiRequest } from '@/services/api/clientConfig';

interface User {
  id: number;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface PusherSubscription {
  channelName: string;
  eventName: string;
  callback: (data: any) => void;
}

class PusherService {
  private subscriptions: Map<string, PusherSubscription[]> = new Map();
  private channels: Map<string, any> = new Map();

  constructor() {
    // Optional initialization if needed
    console.log('PusherService initialized');
  }

  /**
   * Subscribe to a specific channel and event
   */
  subscribe(channelName: string, eventName: string, callback: (data: any) => void): () => void {
    // Create the channel if it doesn't exist
    if (!this.channels.has(channelName)) {
      const channel = pusherClient.subscribe(channelName);
      this.channels.set(channelName, channel);
    }

    const channel = this.channels.get(channelName);
    channel.bind(eventName, callback);

    // Track this subscription
    const subscription: PusherSubscription = { channelName, eventName, callback };
    const key = `${channelName}:${eventName}`;
    
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, []);
    }
    
    this.subscriptions.get(key)?.push(subscription);

    // Return unsubscribe function
    return () => {
      this.unsubscribe(channelName, eventName, callback);
    };
  }

  /**
   * Unsubscribe from a specific event on a channel
   */
  unsubscribe(channelName: string, eventName: string, callback: (data: any) => void): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.unbind(eventName, callback);
      
      // Update subscriptions
      const key = `${channelName}:${eventName}`;
      const subs = this.subscriptions.get(key) || [];
      const updatedSubs = subs.filter(sub => sub.callback !== callback);
      
      if (updatedSubs.length === 0) {
        this.subscriptions.delete(key);
        
        // Check if we need to unsubscribe from the channel entirely
        if (![...this.subscriptions.keys()].some(k => k.startsWith(`${channelName}:`))) {
          pusherClient.unsubscribe(channelName);
          this.channels.delete(channelName);
        }
      } else {
        this.subscriptions.set(key, updatedSubs);
      }
    }
  }

  /**
   * Unsubscribe from all events on a channel
   */
  unsubscribeAll(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
      this.channels.delete(channelName);
      
      // Clean up subscriptions for this channel
      const keysToDelete: string[] = [];
      this.subscriptions.forEach((subs, key) => {
        if (key.startsWith(`${channelName}:`)) {
          keysToDelete.push(key);
        }
      });
      
      keysToDelete.forEach(key => {
        this.subscriptions.delete(key);
      });
    }
  }

  /**
   * Request data from the server regarding task viewers
   */
  async getTaskViewers(taskId: number): Promise<any> {
    try {
      // Note: apiRequest automatically prepends '/api' to the path
      // Using GET request to match TaskViewers component pattern
      return await apiRequest(`/pusher/task-viewers/${taskId}`, {
        method: 'GET'
      });
    } catch (error) {
      console.error('Error fetching task viewers:', error);
      return { success: false, error: 'Failed to fetch viewers' };
    }
  }

  /**
   * Join a task as a viewer
   */
  async joinTaskAsViewer(taskId: number, user: User): Promise<any> {
    try {
      // Using apiRequest which handles headers and authentication
      // Using path parameters to match TaskViewers component pattern
      return await apiRequest(`/pusher/task-viewers/${taskId}/join`, {
        method: 'POST',
        data: { user }
      });
    } catch (error) {
      console.error('Error joining task as viewer:', error);
      return { success: false, error: 'Failed to join as viewer' };
    }
  }

  /**
   * Leave a task as a viewer
   */
  async leaveTaskAsViewer(taskId: number, user: User): Promise<any> {
    try {
      // Using apiRequest which handles headers and authentication
      // Using path parameters to match TaskViewers component pattern
      return await apiRequest(`/pusher/task-viewers/${taskId}/leave`, {
        method: 'POST',
        data: { user }
      });
    } catch (error) {
      console.error('Error leaving task as viewer:', error);
      return { success: false, error: 'Failed to leave as viewer' };
    }
  }

  /**
   * Get the current user information from localStorage
   */
  getCurrentUserInfo(): User | null {
    try {
      const userStr = localStorage.getItem('ywp_user');
      if (!userStr) return null;
      
      const userData = JSON.parse(userStr);
      return {
        id: userData.id,
        name: `${userData.first_name} ${userData.last_name}`.trim(),
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name
      };
    } catch (error) {
      console.error('Error getting current user info:', error);
      return null;
    }
  }

  /**
   * Helper to subscribe to task viewers
   */
  subscribeToTaskViewers(taskId: number, callback: (data: any) => void): () => void {
    const channelName = `presence-task-${taskId}`;
    const eventName = 'task:viewers';
    
    return this.subscribe(channelName, eventName, callback);
  }

  /**
   * Helper to subscribe to task updates
   */
  subscribeToTaskUpdates(callback: (data: any) => void): () => void {
    const channelName = 'tasks-channel';
    const eventName = 'tasks:update';
    
    return this.subscribe(channelName, eventName, callback);
  }

  /**
   * Helper to subscribe to task creation events
   */
  subscribeToTaskCreation(callback: (data: any) => void): () => void {
    const channelName = 'tasks-channel';
    const eventName = 'task:create';
    
    return this.subscribe(channelName, eventName, callback);
  }

  /**
   * Helper to subscribe to task deletion events
   */
  subscribeToTaskDeletion(callback: (data: any) => void): () => void {
    const channelName = 'tasks-channel';
    const eventName = 'task:delete';
    
    return this.subscribe(channelName, eventName, callback);
  }
}

// Create a singleton instance
const pusherService = new PusherService();

// Export the singleton instance
export default pusherService;
