"use client"
import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLoader } from '@/contexts/LoaderContext'
import { authService} from '@/services/authService'
import { User } from '@/types/auth'
import { logger } from '@/lib/logger'
import { PUBLIC_PATHS } from '@/constants/auth'
import { getRedirectPathForRole } from '@/lib/auth'
import { RoleType } from '@/lib/roleProvider'
import { sessionCache } from '@/lib/cache/sessionCache'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loginViaMicrosoft: () => Promise<string>
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { setIsLoading: setRouteLoading } = useLoader()

  // Helper function to check if a path is public
  const isPublicPath = (currentPath: string | null) => {
    if (!currentPath) return false;
    
    return PUBLIC_PATHS.some(path => {
      // Exact match
      if (currentPath === path) return true;
      
      // Special case for root path to avoid matching everything
      if (path === '/') return currentPath === '/';
      
      // For other paths, check if pathname starts with the path followed by / or ends with the path
      // This handles both exact matches and subdirectories
      return currentPath.startsWith(path + '/') || currentPath.endsWith(path);
    });
  };

  const logSetuserAndRedirect = (log: string) => {
    console.log("AuthContext: Redirecting to login - ", log)
    setUser(null)

    if (!isPublicPath(pathname)) {
      router.replace('/')
    }
  };

  // Handle routing based on user's role
  const handleRouteBasedOnRole = (user: User | null) => {
    if (!user) return;
    console.log("AuthContext: Redirecting to role-based route - ", user)
    const redirectPath = getRedirectPathForRole(user);
    router.replace(redirectPath);
  };

  // Function to check if the current user can access the current path based on role
  // Note: Full permission checking is done in middleware, this is for client-side UX
  const canAccessCurrentPath = (currentPath: string, user: User | null) => {
    // Anyone can access public paths
    if (isPublicPath(currentPath)) return true;
    
    // Check if user exists and has a role
    if (!user || !user.role_id) return false;
    
    const roleId = Number(user.role_id);
    
    // SuperAdmin and Admin can access everything
    if (roleId === RoleType.SuperAdmin || roleId === RoleType.Admin) {
      return true;
    }
    
    // Agent can access tasks and related routes
    if (roleId === RoleType.Agent) {
      return true; // Full access handled by middleware permissions
    }
    
    // ClientUser and InternalUser - limited access
    if (roleId === RoleType.ClientUser || roleId === RoleType.InternalUser) {
      // Allow dashboard, settings, and patch-updates
      return currentPath === '/dashboard' || 
             currentPath.startsWith('/dashboard/') ||
             currentPath.startsWith('/settings') ||
             currentPath.startsWith('/patch-updates');
    }
    
    return false;
  };

  const initializedRef = useRef(false)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      if (!mounted) return

      setIsLoading(true)
      
      try {
        // Initialize axios headers with stored token
        authService.initializeAuth()
        
        const token = authService.getToken()
        const user_in_session = authService.getSessionUser()
        
        if (!token || !user_in_session) {
          logSetuserAndRedirect('No token or user in session')
          return
        }

        const user = JSON.parse(user_in_session?? "")
        logger.debug('AuthContext: user in session - ', user)

        // Check cache first, only validate session if needed
        const cachedUser = sessionCache.getUser()
        if (sessionCache.isValid(token) && cachedUser && !sessionCache.shouldRevalidate()) {
          logger.debug('AuthContext: Using cached session')
          setUser(cachedUser)
          
          // Handle routing for cached user
          if (pathname === '/') {
            handleRouteBasedOnRole(cachedUser);
          } else if (!canAccessCurrentPath(pathname, cachedUser)) {
            const redirectPath = getRedirectPathForRole(cachedUser);
            router.replace(redirectPath);
          }
          return
        }

        // Only validate session if not cached or needs revalidation
        const validUser = await authService.checkSession()
        if (!validUser) {
          logSetuserAndRedirect('Invalid session')
          logout()
          return
        }

        // Parse and set user data
        const parsedUser = JSON.parse(user_in_session)
        setUser(parsedUser)

        // Check if user should be redirected based on permissions and current path
        if (parsedUser) {
          // Handle initial landing page
          if (pathname === '/') {
            handleRouteBasedOnRole(parsedUser);
          } else if (!canAccessCurrentPath(pathname, parsedUser)) {
            const redirectPath = getRedirectPathForRole(parsedUser);
            router.replace(redirectPath);
          }
        }
      } catch (error) {
        logSetuserAndRedirect('Auth initialization failed')
      } finally {
        if (mounted) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          setIsLoading(false)
        }
      }
    }

    // Only run initialization once unless pathname changes to root
    if (!initializedRef.current || pathname === '/') {
      initializedRef.current = true
      initializeAuth()
    } else {
      // For other pathname changes, just check access without full session validation
      const token = authService.getToken()
      const cachedUser = sessionCache.getUser()
      
      if (token && cachedUser && sessionCache.isValid(token)) {
        if (!canAccessCurrentPath(pathname, cachedUser)) {
          const redirectPath = getRedirectPathForRole(cachedUser);
          router.replace(redirectPath);
        }
      }
    }

    return () => {
      mounted = false
    }
  }, [pathname, router])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await authService.login({ email, password })
      if(res.message !== 'ok') {
        throw new Error(res.message)
      }

      const data = res.data
      const userData = data?.userdata ?? null;
      setUser(userData)
      
      // Redirect based on user role
      handleRouteBasedOnRole(userData);
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginViaMicrosoft = async (): Promise<string> => {
    setIsLoading(true);
    try {
      const authUrl = await authService.loginViaMicrosoft();
      return authUrl;
    } catch (error) {
      console.error('Microsoft login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setRouteLoading(true); // Show global route loader
      await authService.logout();
      setUser(null);
      router.replace('/');
    } catch (error) {
      logger.error('Logout failed:', error);
      setRouteLoading(false); // Hide loader on error
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    loginViaMicrosoft,
    isLoading,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}