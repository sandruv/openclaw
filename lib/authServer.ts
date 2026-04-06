import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Extract authentication token from request
 * Tries Authorization header first, then falls back to HttpOnly cookie
 */
export async function getAuthToken(request: NextRequest): Promise<string | null> {
  // Try Authorization header first (for API calls from frontend)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token) return token;
  }
  
  // Fallback to HttpOnly cookie (for SSR and cases where header isn't set)
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('ywp_token');
    if (tokenCookie?.value) {
      return tokenCookie.value;
    }
  } catch (error) {
    console.error('Error reading token from cookie:', error);
  }
  
  return null;
}
