'use client';

import { Permission, Role } from '@/services/rolesPermissionsService';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { Shield, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RoleType } from '@/lib/roleProvider';
import { useSessionStore } from '@/stores/useSessionStore';

interface PermissionsPaneProps {
  selectedRole: Role | null;
  permissions: Permission[];
  hasPermission: (permissionId: number) => boolean;
  onPermissionToggle: (permissionId: number, checked: boolean) => void;
  updating: boolean;
}

export function PermissionsPane({
  selectedRole,
  permissions,
  hasPermission,
  onPermissionToggle,
  updating,
}: PermissionsPaneProps) {
  const { user } = useAuth();
  const { isSuperAdmin } = useSessionStore();
  
  // Check if selected role is Admin or Super Admin
  const isAdminLevelRole = selectedRole ? 
    (selectedRole.id === RoleType.Admin || selectedRole.id === RoleType.SuperAdmin) : false;
  
  // Only super-admins can edit permissions for Admin and Super Admin roles
  const canEditPermissions = !isAdminLevelRole || isSuperAdmin();
  
  if (!selectedRole) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-6">
        <Shield className="h-16 w-16 mb-4 opacity-30" />
        <p className="text-sm font-medium mb-2">No Role Selected</p>
        <p className="text-xs text-center">
          Select a role from the left to manage its permissions
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedRole.name}
            </h2>
          </div>
          {selectedRole.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedRole.description}
            </p>
          )}
        </div>

        {/* Info message for restricted editing */}
        {!canEditPermissions && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
            <p className="text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span>Only Super Admins can modify permissions for Admin and Super Admin roles.</span>
            </p>
          </div>
        )}

        {/* Permissions List */}
        {permissions.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-[#969696] text-sm">
            <p>No permissions available</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-[#3c3c3c]">
            {/* Header Row */}
            <div className="h-8 flex items-center px-3 bg-gray-50 dark:bg-[#252526] text-xs text-gray-500 dark:text-[#969696] uppercase tracking-wide sticky top-0">
              <span className="w-10"></span>
              <span className="w-12">ID</span>
              <span className="flex-1">Permission Name</span>
              <span className="w-48">Description</span>
            </div>
            
            {/* Data Rows */}
            {permissions.map((permission) => (
              <label
                key={permission.id}
                htmlFor={`perm-${permission.id}`}
                className="h-9 flex items-center px-3 text-sm text-gray-900 dark:text-[#cccccc] hover:bg-gray-50 dark:hover:bg-[#2a2d2e] transition-colors cursor-pointer"
              >
                <span className="w-10 flex items-center">
                  <Checkbox
                    id={`perm-${permission.id}`}
                    checked={hasPermission(permission.id)}
                    onCheckedChange={(checked) =>
                      onPermissionToggle(permission.id, checked as boolean)
                    }
                    disabled={updating || !canEditPermissions}
                  />
                </span>
                <span className="w-12 text-gray-500 dark:text-[#969696] font-mono">{permission.id}</span>
                <span className="flex-1 truncate font-medium">{permission.name}</span>
                <span className="w-48 truncate text-gray-500 dark:text-[#969696] text-xs">
                  {permission.description || '-'}
                </span>
              </label>
            ))}
          </div>
        )}

        {/* Updating indicator */}
        {updating && (
          <div className="h-8 flex items-center px-3 gap-2 text-xs text-gray-500 dark:text-[#969696] bg-gray-50 dark:bg-[#252526] border-t border-gray-200 dark:border-[#3c3c3c]">
            <Spinner size="sm" />
            <span>Updating permissions...</span>
          </div>
        )}
      </div>
    </div>
  );
}
