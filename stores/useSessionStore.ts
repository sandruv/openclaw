import { create } from 'zustand';
import { User } from '@/types/auth';
import { RoleProvider } from '@/lib/roleProvider';

interface SessionState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  // Computed role properties
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  isAgent: () => boolean;
  isClientUser: () => boolean;
  isInternalUser: () => boolean;
  isDashboardOnly: () => boolean;
  canAccessTasks: () => boolean;
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  // Computed role properties - these use RoleProvider for consistent logic
  isSuperAdmin: () => {
    const user = get().user;
    return RoleProvider.isSuperAdmin(user ? { ...user, role_id: Number(user.role_id) } : null);
  },
  
  isAdmin: () => {
    const user = get().user;
    return RoleProvider.isAdmin(user ? { ...user, role_id: Number(user.role_id) } : null);
  },
  
  isAgent: () => {
    const user = get().user;
    return RoleProvider.isAgent(user ? { ...user, role_id: Number(user.role_id) } : null);
  },
  
  isClientUser: () => {
    const user = get().user;
    return RoleProvider.isClientUser(user ? { ...user, role_id: Number(user.role_id) } : null);
  },
  
  isInternalUser: () => {
    const user = get().user;
    return RoleProvider.isInternalUser(user ? { ...user, role_id: Number(user.role_id) } : null);
  },
  
  isDashboardOnly: () => {
    const user = get().user;
    return RoleProvider.isDashboardOnly(user ? { ...user, role_id: Number(user.role_id) } : null);
  },
  
  canAccessTasks: () => {
    const user = get().user;
    return RoleProvider.canAccessTasks(user ? { ...user, role_id: Number(user.role_id) } : null);
  },
  
  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  clearSession: () => set({ user: null, token: null, isAuthenticated: false }),
}));
