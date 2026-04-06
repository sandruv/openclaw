import Pusher from 'pusher';

let pusherInstance: Pusher | null = null;

/**
 * Get the Pusher server instance (lazy initialization)
 * Only initializes on first call to avoid build-time side effects
 */
export function getPusher(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID || '',
      key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '',
      secret: process.env.PUSHER_APP_SECRET || '',
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'ap1',
      useTLS: true,
    });
    
    // Only log if debug flag is set
    if (process.env.DEBUG_INIT === '1') {
      console.log('[Pusher] Initialized with app ID:', process.env.PUSHER_APP_ID);
    }
  }
  
  return pusherInstance;
}

/**
 * @deprecated Use getPusher() instead. This export is kept for backward compatibility.
 * Will be removed in a future version.
 */
export const pusherServer = getPusher();
