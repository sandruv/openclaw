'use client';

import { useState } from 'react';
import { useSystemStore } from '@/stores/useSystemStore';
import { makeUserOneSuperAdmin, updateUserRole } from '@/services/initializationService';
import { Toolbar } from './components/Toolbar';
import { ListHeader } from './components/ListHeader';
import { AdminUserRow } from './components/AdminUserRow';
import { CollapsibleFormRow } from './components/CollapsibleFormRow';
import { RoleAssignmentForm } from './components/RoleAssignmentForm';

interface SuperAdminsListProps {
  onAddLog: (message: string, type: 'info' | 'success' | 'error' | 'warning') => void;
}

export function SuperAdminsList({ onAddLog }: SuperAdminsListProps) {
  const [processing, setProcessing] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(true);
  
  const { 
    adminUsers, 
    isLoadingAdminUsers: isLoading, 
    adminUsersError: error,
    fetchAdminUsers: storeFetchAdminUsers 
  } = useSystemStore();

  const fetchAdminUsers = async (): Promise<void> => {
    onAddLog('Retrieving admin users...', 'info');
    await storeFetchAdminUsers();
    const { adminUsers: updatedUsers, adminUsersError } = useSystemStore.getState();
    
    if (adminUsersError) {
      onAddLog(`Failed to retrieve admin users: ${adminUsersError}`, 'error');
    } else {
      onAddLog(`Retrieved ${updatedUsers.length} admin users successfully`, 'success');
    }
  };

  const handleMakeUserOneSuperAdmin = async (): Promise<void> => {
    setProcessing(true);
    onAddLog('Making User #1 a SuperAdmin...', 'info');
    
    try {
      const response = await makeUserOneSuperAdmin();
      
      if (response.status === 200 && response.data) {
        onAddLog(`User #1 (${response.data.first_name} ${response.data.last_name}) is now a SuperAdmin`, 'success');
        await fetchAdminUsers();
      } else {
        onAddLog(`Failed to update User #1: ${response.message || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      onAddLog('Error updating User #1: server connection failed', 'error');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleAssignRole = async (userId: number, roleId: 3 | 5): Promise<void> => {
    setProcessing(true);
    const roleName = roleId === 5 ? 'SuperAdmin' : 'Admin';
    onAddLog(`Assigning ${roleName} role to user...`, 'info');
    
    try {
      const response = await updateUserRole(userId, roleId);
      
      if (response.status === 200 && response.data) {
        onAddLog(`${response.data.first_name} ${response.data.last_name} is now a ${roleName}`, 'success');
        await fetchAdminUsers();
        setIsFormExpanded(false);
      } else {
        onAddLog(`Failed to assign role: ${response.message || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      onAddLog('Error assigning role: server connection failed', 'error');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelForm = () => {
    setIsFormExpanded(false);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#1e1e1e]">
      <Toolbar
        onRefresh={fetchAdminUsers}
        onMakeUserOneSuperAdmin={handleMakeUserOneSuperAdmin}
        isLoading={isLoading}
        processing={processing}
      />

      {/* Error Banner */}
      {error && (
        <div className="flex-shrink-0 px-3 py-2 bg-red-50 dark:bg-[#5a1d1d] border-b border-red-200 dark:border-[#be1100] text-sm text-red-600 dark:text-[#f48771]">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {adminUsers.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-[#969696] text-sm">
            Click "Refresh" to load admin users
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-[#3c3c3c]">
            <ListHeader />
            
            {adminUsers.map((user) => (
              <AdminUserRow key={user.id} user={user} />
            ))}

            <CollapsibleFormRow
              isExpanded={isFormExpanded}
              onToggle={() => setIsFormExpanded(!isFormExpanded)}
            >
              <RoleAssignmentForm
                onAssign={handleAssignRole}
                onCancel={handleCancelForm}
                processing={processing}
              />
            </CollapsibleFormRow>
          </div>
        )}
      </div>
    </div>
  );
}
