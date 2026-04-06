import Pusher from 'pusher';

/**
 * Server-side Pusher instance
 * Used for server-initiated events and authentication
 */
export const PusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '',
  secret: process.env.PUSHER_APP_SECRET || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'ap1',
  useTLS: true,
});

/**
 * Trigger an event to a channel from the server
 */
export async function triggerEvent(channelName: string, eventName: string, data: any) {
  try {
    await PusherServer.trigger(channelName, eventName, data);
    return { success: true };
  } catch (error) {
    console.error('Error triggering Pusher event:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Authorize a private or presence channel
 */
export function authorizeChannel(socketId: string, channelName: string, presenceData?: any) {
  if (channelName.startsWith('presence-') && presenceData) {
    return PusherServer.authorizeChannel(socketId, channelName, presenceData);
  }
  
  return PusherServer.authorizeChannel(socketId, channelName);
}

/**
 * Get active channels
 */
export async function getChannels() {
  try {
    const result = await PusherServer.get({ path: '/channels', params: {} });
    return result;
  } catch (error) {
    console.error('Error getting Pusher channels:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get channel information
 */
export async function getChannel(channelName: string) {
  try {
    const result = await PusherServer.get({
      path: `/channels/${channelName}`,
      params: { info: ['user_count', 'subscription_count'] }
    });
    return result;
  } catch (error) {
    console.error('Error getting Pusher channel info:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get users in a presence channel
 */
export async function getChannelUsers(channelName: string) {
  if (!channelName.startsWith('presence-')) {
    return { 
      success: false, 
      error: 'Not a presence channel' 
    };
  }
  
  try {
    const result = await PusherServer.get({ path: `/channels/${channelName}/users` });
    return result;
  } catch (error) {
    console.error('Error getting Pusher channel users:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
