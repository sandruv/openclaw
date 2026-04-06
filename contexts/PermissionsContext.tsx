'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePermissionsStore } from '@/stores/usePermissionsStore';
import { useAuth } from '@/contexts/AuthContext';
import { useViewAsRoleStore } from '@/stores/useViewAsRoleStore';

interface PermissionsContextType {
  permissions: string[];
  isLoading: boolean;
  error: string | null;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  refreshPermissions: () => Promise<void>;
  effectiveRoleId: number | null;
  isSimulatingRole: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const {
    permissions,
    isLoading,
    error,
    fetchPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    clearPermissions,
  } = usePermissionsStore();

  // Get simulation state
  const { simulatedRoleId, isSimulating, getEffectiveRoleId } = useViewAsRoleStore();

  const [initialized, setInitialized] = useState(false);
  const [lastFetchedRoleId, setLastFetchedRoleId] = useState<number | null>(null);

  // Calculate effective role ID
  const actualRoleId = user?.role_id ? Number(user.role_id) : null;
  const effectiveRoleId = actualRoleId ? getEffectiveRoleId(actualRoleId) : null;

  // Fetch permissions when user authenticates or simulated role changes
  useEffect(() => {
    if (isAuthenticated && effectiveRoleId) {
      // Only fetch if role changed or not initialized
      if (!initialized || lastFetchedRoleId !== effectiveRoleId) {
        // Force refresh when switching roles
        if (lastFetchedRoleId !== effectiveRoleId) {
          usePermissionsStore.setState({ fetchedAt: null });
        }
        fetchPermissions(effectiveRoleId);
        setLastFetchedRoleId(effectiveRoleId);
        setInitialized(true);
      }
    } else if (!isAuthenticated && initialized) {
      clearPermissions();
      setInitialized(false);
      setLastFetchedRoleId(null);
    }
  }, [isAuthenticated, effectiveRoleId, initialized, lastFetchedRoleId, fetchPermissions, clearPermissions]);

  const refreshPermissions = useCallback(async () => {
    if (effectiveRoleId) {
      // Force refresh by clearing fetchedAt
      usePermissionsStore.setState({ fetchedAt: null });
      await fetchPermissions(effectiveRoleId);
      setLastFetchedRoleId(effectiveRoleId);
    }
  }, [effectiveRoleId, fetchPermissions]);

  const value: PermissionsContextType = {
    permissions,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions,
    effectiveRoleId,
    isSimulatingRole: isSimulating,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

// HOC for components that require specific permissions
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission: string,
  FallbackComponent?: React.ComponentType
): React.FC<P> {
  return function PermissionGuardedComponent(props: P) {
    const { hasPermission, isLoading } = usePermissions();

    if (isLoading) {
      return null; // Or a loading spinner
    }

    if (!hasPermission(requiredPermission)) {
      return FallbackComponent ? <FallbackComponent /> : null;
    }

    return <WrappedComponent {...props} />;
  };
}

// Component for conditional rendering based on permissions
interface PermissionGateProps {
  permission: string | string[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  requireAll = false,
  children,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  
  const hasAccess = permissions.length === 1
    ? hasPermission(permissions[0])
    : requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
