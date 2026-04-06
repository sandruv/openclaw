import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { User } from '@/types/auth';

// Define event types for better type safety
export type SocketEvent = 
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

// Define listener type
type SocketListener = (data: any) => void;

// Define user info type for socket
interface UserInfo {
  id: number;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
}

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<SocketListener>> = new Map();
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000;
  private url: string = '';

  // Initialize the socket connection
  initialize(url?: string): void {
    if (this.socket) {
      console.warn('Socket connection already initialized');
      return;
    }

    // Socket.io is being replaced with Pusher, initialization is disabled
    console.log('Socket.io initialization is disabled - using Pusher instead');
    return;

    /* 
    if (!url) {
      // If no URL provided, construct one from the current origin but with the socket port
      // Construct URL from window location with separate socket port
      const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
      const hostname = window.location.hostname;
      // Use NEXT_PUBLIC_SOCKET_PORT or fall back to 3001
      const port = process.env.NEXT_PUBLIC_SOCKET_PORT || '3001';
      url = `${protocol}://${hostname}:${port}`;
    }

    console.log('Initializing socket connection to:', url);
    this.url = url;
    
    try {
      // Get user data for auth
      const userInfo = this.getUserInfo();
      
      // Configure socket options with better production support
      const socketOptions: any = {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 10000,
        timeout: 20000,
        autoConnect: true,
        path: process.env.NEXT_PUBLIC_SOCKET_PATH || '/socket.io',
        forceNew: true,
        auth: {
          userId: userInfo?.id,
          userName: userInfo?.name,
          firstName: userInfo?.firstName,
          lastName: userInfo?.lastName,
          email: userInfo?.email
        }
      };
      
      // Add secure option for HTTPS connections
      if (url.startsWith('https')) {
        socketOptions.secure = true;
      }
      
      this.socket = io(url, socketOptions);

      this.setupSocketEvents();
    } catch (error) {
      console.error('Failed to initialize socket connection:', error);
    }
    */
  }

  // Get user info from localStorage
  private getUserInfo(): UserInfo | null {
    try {
      const userStr = localStorage.getItem('ywp_user');
      if (!userStr) return null;
      
      const userData: User = JSON.parse(userStr);
      return {
        id: userData.id,
        name: `${userData.first_name} ${userData.last_name}`.trim(),
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name
      };
    } catch (error) {
      console.error('Error getting user info from localStorage:', error);
      return null;
    }
  }

  // Set up default socket event handlers
  private setupSocketEvents(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyListeners('connect', { id: this.socket?.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.notifyListeners('disconnect', { reason });
      
      // Attempt to reconnect if the disconnect wasn't intentional
      if (reason !== 'io client disconnect') {
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.notifyListeners('error', { error: error.message || 'Connection failed' });
      
      this.isConnected = false;
      this.attemptReconnect();
    });
    
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      this.notifyListeners('reconnect', { attemptNumber });
    });
    
    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
      this.notifyListeners('error', { error: error.message || 'Reconnection failed' });
    });
  }

  // Add event listener
  on(event: SocketEvent, listener: SocketListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
      
      // Register the event with the socket if it's not a built-in event
      if (this.socket && !['connect', 'disconnect', 'error'].includes(event)) {
        this.socket.on(event, (data: any) => {
          this.notifyListeners(event, data);
        });
      }
    }

    this.listeners.get(event)?.add(listener);

    // Return a function to remove this specific listener
    return () => {
      this.off(event, listener);
    };
  }

  // Remove event listener
  off(event: SocketEvent, listener: SocketListener): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
      
      // If no listeners left for this event, clean up
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
        
        // Unregister from socket if it's not a built-in event
        if (this.socket && !['connect', 'disconnect', 'error'].includes(event)) {
          this.socket.off(event);
        }
      }
    }
  }

  // Emit an event to the server
  emit(event: string, data: any): void {
    if (!this.socket || !this.isConnected) {
      console.warn('Cannot emit event: socket not connected');
      return;
    }

    // Get current user info
    const userInfo = this.getUserInfo();
    
    // Attach user info to the data
    const enrichedData = {
      ...data,
      _user: userInfo // Use underscore prefix to avoid potential conflicts
    };

    this.socket.emit(event, enrichedData);
  }

  // Notify all listeners for an event
  private notifyListeners(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in socket listener for event ${event}:`, error);
        }
      });
    }
  }

  // Attempt to reconnect to the socket server
  private attemptReconnect(): void {
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts > this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached`);
      this.notifyListeners('error', { error: 'Max reconnection attempts reached' });
      return;
    }
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    if (this.socket) {
      this.socket.connect();
    } else {
      // If socket was completely destroyed, re-initialize
      this.initialize(this.url);
    }
  }
  
  // Disconnect the socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Check if socket is connected
  isSocketConnected(): boolean {
    return this.isConnected;
  }

  // Get socket ID
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // Get current user info
  getCurrentUserInfo(): UserInfo | null {
    return this.getUserInfo();
  }

  // Reconnect manually
  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    } else if (this.url) {
      this.initialize(this.url);
    }
  }
}

// Create a singleton instance
export const socketService = new SocketService();

// React hook for using socket in components
export function useSocket() {
  const [isConnected, setIsConnected] = useState<boolean>(socketService.isSocketConnected());

  useEffect(() => {
    // Initialize socket if not already done
    if (!socketService.isSocketConnected()) {
      socketService.initialize();
    }

    // Set up connection status listeners
    const connectHandler = () => setIsConnected(true);
    const disconnectHandler = () => setIsConnected(false);

    const connectUnsubscribe = socketService.on('connect', connectHandler);
    const disconnectUnsubscribe = socketService.on('disconnect', disconnectHandler);

    // Update initial connection status
    setIsConnected(socketService.isSocketConnected());

    // Clean up listeners on unmount
    return () => {
      connectUnsubscribe();
      disconnectUnsubscribe();
    };
  }, []);

  return {
    isConnected,
    socket: socketService,
    on: socketService.on.bind(socketService),
    emit: socketService.emit.bind(socketService),
    disconnect: socketService.disconnect.bind(socketService),
    reconnect: socketService.reconnect.bind(socketService),
    getCurrentUserInfo: socketService.getCurrentUserInfo.bind(socketService),
  };
}

// Export the singleton instance and the hook
export default socketService;
