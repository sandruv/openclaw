import { LoginCredentials, AuthResponse, User } from '../types/auth';
import { logger } from '@/lib/logger';
import { useSessionStore } from '@/stores/useSessionStore';
import { sessionCache } from '@/lib/cache/sessionCache';
import Cookies from 'js-cookie';

class AuthService {
  private setAuthHeader(token: string | null) {
      if (token) {
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${token}`);
      } else {
      const headers = new Headers();
      headers.delete('Authorization');
    }
  }

  // Set token in both localStorage and cookies
  private setToken(token: string) {
    localStorage.setItem('ywp_token', token);
    // Set cookie with path='/' to make it available for all paths
    Cookies.set('token', token, { path: '/' });
    useSessionStore.getState().setToken(token);
  }

  // Clear token from both localStorage and cookies
  private clearToken() {
    localStorage.removeItem('ywp_token');
    Cookies.remove('token', { path: '/' });
    useSessionStore.getState().clearSession();
  }

  private setCurrentUser(user: User) {
    localStorage.setItem('ywp_user', JSON.stringify(user));
    Cookies.set('user', JSON.stringify(user), { path: '/' });
    useSessionStore.getState().setUser(user);
  }

  private clearCurrentUser() {
    localStorage.removeItem('ywp_user');
    Cookies.remove('user', { path: '/' });
    useSessionStore.getState().clearSession();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const message = await response.json();
      const { session, userdata } = message.data;

      // Store user data in localStorage and session store
      this.setCurrentUser(userdata);
      
      // Set token in both localStorage and cookies
      this.setToken(session.token);
      this.setAuthHeader(session.token);
      
      return message;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async checkSession(): Promise<User | null> {
    try {
      const token = this.getToken();
      
      if (!token) {
        throw new Error('No token found');
      }
      
      // Check cache first
      if (sessionCache.isValid(token) && !sessionCache.shouldRevalidate()) {
        const cachedUser = sessionCache.getUser();
        if (cachedUser) {
          logger.debug('AuthService: Using cached session');
          return cachedUser;
        }
      }
      
      // Use GET with Authorization header to validate token and return user data
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        logger.debug('AuthService: Session validation failed');
        sessionCache.clear();
        return null;
      }
      
      const result = await response.json();
      
      if (result.status !== 200 || !result.data) {
        logger.debug('AuthService: Invalid session');
        sessionCache.clear();
        return null;
      }
      
      const { user, session } = result.data;
      
      // Update session store with user data and token
      useSessionStore.getState().setUser(user);
      useSessionStore.getState().setToken(token);
      
      // Cache the session
      sessionCache.set(user, token);
      
      return user;
    } catch (error) {
      console.error('Session check error:', error);
      sessionCache.clear();
      // Don't call logout here - let the calling code handle it to prevent infinite loops
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clean up local storage, cookies, session store, and cache
      this.clearCurrentUser();
      this.clearToken();
      sessionCache.clear();
      this.setAuthHeader(null);
    }
  }

  async loginViaMicrosoft(): Promise<string> {
    try {
      const response = await fetch('/api/auth', {
        method: 'GET',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get Microsoft auth URL');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Microsoft login error:', error);
      throw error;
    }
  }

  async handleMicrosoftCallback(code: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`/api/auth/login?code=${code}`, {
        method: 'GET',
      });

      const res = await response.json();
          
      const { session, userdata } = res.data;

      logger.debug('AuthService: Microsoft callback - ', res);
      
      if (!session || !userdata) {
        let error = 'Failed to handle Microsoft callback';
        if(res.data.name != undefined) {
          error = res.data.name +": "+res.data.subError;
        }
        throw new Error(error);
      }
      
      // Store user data in localStorage and session store
      localStorage.setItem('ywp_user', JSON.stringify(userdata));
      useSessionStore.getState().setUser(userdata);
      
      // Set token in both localStorage and cookies
      this.setToken(session.token);
      this.setAuthHeader(session.token);
      
      return res;
    } catch (error: any) {
      return {
        message: error?.message || 'An unexpected error occurred',
        status: 500
      };
    }
  }

  getToken(): string | null {
    // Try to get token from localStorage first, then from cookies as fallback
    return localStorage.getItem('ywp_token') || Cookies.get('token') || null;
  }

  getSessionUser(): string | null {
    return localStorage.getItem('ywp_user') || Cookies.get('user') || null;
  }

  initializeAuth(): void {
    const token = this.getToken();
    const userStr = this.getSessionUser();
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        useSessionStore.getState().setUser(user);
        useSessionStore.getState().setToken(token);
        
        // Ensure the token is set in both localStorage and cookies
        if (!localStorage.getItem('ywp_token')) {
          localStorage.setItem('ywp_token', token);
        }
        
        if (!Cookies.get('token')) {
          Cookies.set('token', token, { path: '/' });
        }

        if (!Cookies.get('user')) {
          Cookies.set('user', userStr, { path: '/' });
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }
    
    this.setAuthHeader(token);
  }
}

export const authService = new AuthService();
