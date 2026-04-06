'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { RoleType } from '@/lib/roleProvider';
import { useSessionStore } from '@/stores/useSessionStore';
import { useRolesPermissionsStore } from '@/stores/useRolesPermissionsStore';
import { useToast } from '@/components/ui/toast-provider';
import { IDETabStrip } from '../system-initialization/IDETabStrip';
import { SuperAdminsList } from './super-admins/SuperAdminsList';
import { RolesList } from './RolesList';
import { PermissionsPane } from './PermissionsPane';
import { PermissionsListView } from './PermissionsListView';
import { RolesPermissionsSkeleton } from './Skeleton';

type TabType = 'super-admins' | 'roles' | 'permissions';

export function RolesPermissionsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('roles');
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isAdmin, isSuperAdmin } = useSessionStore();

  const {
    roles,
    permissions,
    selectedRole,
    rolesLoading,
    permissionsLoading,
    updatePermissionLoading,
    rolesFetchedAt,
    permissionsFetchedAt,
    fetchAll,
    setSelectedRole,
    updateRolePermissions,
    getRolePermissions,
    hasPermission,
  } = useRolesPermissionsStore();

  // Check admin access - using computed property from session store
  const hasAdminAccess = isAdmin();

  useEffect(() => {
    const initializeData = async () => {
      // Fetch data if not already fetched
      if (!rolesFetchedAt || !permissionsFetchedAt) {
        await fetchAll();
      }
      setLoading(false);
    };

    initializeData();
  }, [fetchAll, rolesFetchedAt, permissionsFetchedAt]);

  useEffect(() => {
    if (user && !hasAdminAccess) {
      router.push('/');
    }
  }, [user, hasAdminAccess, router]);

  const handlePermissionToggle = async (permissionId: number, checked: boolean) => {
    if (!selectedRole) return;

    const success = await updateRolePermissions(selectedRole.id, {
      permission_id: permissionId,
      action: checked ? 'add' : 'remove',
    });

    if (success) {
      showToast({
        type: 'success',
        title: 'Success',
        description: `Permission ${checked ? 'added to' : 'removed from'} role`,
      });
    } else {
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to update permission',
      });
    }
  };

  // Build tabs array - only show Admins tab to super-admins
  const tabs = [
    ...(isSuperAdmin() ? [{ id: 'super-admins' as TabType, label: 'Admins' }] : []),
    { id: 'roles' as TabType, label: 'Roles', count: roles.length || undefined },
    { id: 'permissions' as TabType, label: 'Permissions', count: permissions.length || undefined },
  ];

  if (loading || rolesLoading || permissionsLoading) {
    return <RolesPermissionsSkeleton />;
  }

  if (!hasAdminAccess) {
    return null;
  }

  return (
    <div className="h-full flex bg-gray-100 dark:bg-[#1e1e1e]">
      {/* Left Pane - Tabbed Content */}
      <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-[#3c3c3c] min-w-0">
        {/* IDE Tab Strip */}
        <IDETabStrip
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as TabType)}
        />

        {/* Tab Content */}
        {activeTab === 'super-admins' && isSuperAdmin() && (
          <SuperAdminsList onAddLog={(msg) => console.log(msg)} />
        )}
        {activeTab === 'roles' && (
          <RolesList
            roles={roles}
            selectedRole={selectedRole}
            onRoleSelect={setSelectedRole}
          />
        )}
        {activeTab === 'permissions' && <PermissionsListView permissions={permissions} />}
      </div>

      {/* Right Pane - Permissions Management */}
      <div className="w-[45%] flex-shrink-0 min-w-[300px] flex flex-col">
        {/* Header */}
        <div className="h-[35px] border-b border-gray-200 dark:border-[#3c3c3c] bg-white dark:bg-[#252526] px-3 flex items-center">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            {activeTab === 'super-admins' ? 'Super Admin Details' : activeTab === 'roles' ? 'Manage Permissions' : 'Permission Details'}
          </span>
        </div>

        {/* Content */}
        {activeTab === 'super-admins' ? (
          <div className="flex-1 overflow-auto p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-4">
                Super Admins have full system access and can manage all aspects of the application.
              </p>
              <p>
                Use the list on the left to view and manage super admin assignments.
              </p>
            </div>
          </div>
        ) : activeTab === 'roles' ? (
          <PermissionsPane
            selectedRole={selectedRole}
            permissions={permissions}
            hasPermission={(permId) =>
              selectedRole ? hasPermission(selectedRole.id, permId) : false
            }
            onPermissionToggle={handlePermissionToggle}
            updating={updatePermissionLoading}
          />
        ) : (
          <div className="flex-1 overflow-auto p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-4">
                Permissions control access to different parts of the application. They are
                assigned to roles, which are then assigned to users.
              </p>
              <p>
                Select the <strong>Roles</strong> tab to manage which permissions each role has.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RolesPermissionsPage;
