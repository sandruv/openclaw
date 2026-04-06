/**
 * Authentication-related constants
 */

// List of paths that don't require authentication
export const PUBLIC_PATHS = [
  '/', 
  '/signin', 
  '/api-reference', 
  '/socket-status', 
  '/signin-admin', 
  '/push-notifications', 
  '/pusher-status', 
  '/realtime-status'
];

// List of API routes that don't require authentication
export const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/session',
  '/api/auth/callback',
  '/api/auth/signin-admin',
  '/api/auth/signin-client',
  '/api/auth',
  '/api/emails',
  '/api/clients-msp',
  '/api/users-msp',
  '/api/export',
  '/api/me',
  '/api/users/validate-email',
  '/api/socket-status/clients',
  '/api/pusher/trigger',
  // New realtime API endpoints
  '/api/realtime/auth',
  '/api/realtime/ping',
  '/api/realtime/trigger',
  '/api/pusher/test-trigger',
  // Azure blob endpoints for file viewing
  '/api/azure-blob/view',
  // Role permissions endpoint for middleware caching
  '/api/role-permissions',
];
