"use client"

import PusherClient from 'pusher-js';

// Initialize PusherClient for client-side usage
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '',
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'ap1',
    forceTLS: true,
    authEndpoint: '/api/pusher/auth',
    auth: {
      headers: {
        // Include auth token in requests to the auth endpoint
        'Authorization': typeof window !== 'undefined' ? 
          `Bearer ${localStorage.getItem('ywp_token')}` : '',
      }
    }
  }
);

// Log connection state changes
pusherClient.connection.bind('state_change', (states: any) => {
  console.log('Pusher connection state changed from', states.previous, 'to', states.current);
});

// Log connection errors
pusherClient.connection.bind('error', (err: any) => {
  console.error('Pusher connection error:', err);
});

export default pusherClient;
