import { jwtVerify } from 'jose'
import { RoleType } from '@/lib/roleProvider'

// Define user interface based on JWT payload
export interface JWTUser {
  id: number;
  email: string;
  name?: string;
  role_id?: number;
  [key: string]: unknown;
}
import { User } from '@/types/auth'

export async function verifyAuth(token: string) {
  if (!token) {
    return { error: 'Missing token' }
  }

  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
    return verified.payload
  } catch {
    return { error: 'Invalid token' }
  }
}

/**
 * Extracts user details directly from JWT token without database query
 */
export async function extractUserFromToken(token: string): Promise<JWTUser | { error: string }> {
  if (!token) {
    return { error: 'Missing token' }
  }

  try {
    let actualToken = token;
    if (actualToken.startsWith('Bearer ')) {
      actualToken = actualToken.substring(7).trim();
    }

    if (!actualToken || actualToken === 'null' || actualToken === 'undefined') {
      return { error: 'Invalid token format' };
    }

    if (!process.env.JWT_SECRET) {
      return { error: 'Server configuration error' };
    }

    const verified = await jwtVerify(
      actualToken,
      new TextEncoder().encode(process.env.JWT_SECRET),
      { maxTokenAge: '7d' }
    );
    const payload = verified.payload;

    const userData: JWTUser = {
      id: payload.id as number,
      email: payload.email as string,
      name: payload.name as string | undefined,
      role_id: payload.role_id as number | undefined,
    }

    Object.keys(payload).forEach(key => {
      if (!['id', 'email', 'name', 'role_id', 'iat', 'exp', 'nbf'].includes(key)) {
        userData[key] = payload[key]
      }
    })

    return userData
  } catch (err) {
    return { error: 'Invalid token: ' + ((err as Error)?.message || 'Unknown error') }
  }
}

/**
 * Determines the appropriate redirect path based on the user's role
 */
export function getRedirectPathForRole(user: User | null): string {
  if (!user) return '/';

  const roleId = Number(user.role_id);

  switch (roleId) {
    case RoleType.SuperAdmin:
    case RoleType.Admin:
    case RoleType.Agent:
      return '/tasks';
    case RoleType.ClientUser:
    case RoleType.InternalUser:
      return '/dashboard';
    default:
      return '/dashboard';
  }
}

/**
 * @deprecated Use getRedirectPathForRole instead
 */
export function getRedirectPathBasedOnDomain(user: User | null): string {
  return getRedirectPathForRole(user);
}

/**
 * Stub: session/DB lookup not available in frontend prototype.
 * Always returns an error.
 */
export async function getUserFromToken(_token: string) {
  return { error: 'Database not available in frontend prototype' }
}
