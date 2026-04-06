'use client';

import { Role } from '@/services/rolesPermissionsService';
import { cn } from '@/lib/utils';
import { Shield, Check } from 'lucide-react';

interface RolesListProps {
  roles: Role[];
  selectedRole: Role | null;
  onRoleSelect: (role: Role) => void;
}

export function RolesList({ roles, selectedRole, onRoleSelect }: RolesListProps) {
  if (roles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-[#969696] text-sm">
        <Shield className="h-4 w-4 mr-2 opacity-50" />
        No roles found
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="divide-y divide-gray-200 dark:divide-[#3c3c3c]">
        {/* Header Row */}
        <div className="h-8 flex items-center px-3 bg-gray-50 dark:bg-[#252526] text-xs text-gray-500 dark:text-[#969696] uppercase tracking-wide sticky top-0">
          <span className="w-12">ID</span>
          <span className="flex-1">Role Name</span>
          <span className="w-16">Priority</span>
          <span className="w-20 text-right">Status</span>
        </div>
        
        {/* Data Rows */}
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => onRoleSelect(role)}
            className={cn(
              'w-full h-9 flex items-center px-3 text-sm transition-colors text-left',
              selectedRole?.id === role.id
                ? 'bg-blue-50 dark:bg-[#094771] text-blue-700 dark:text-[#9cdcfe]'
                : 'text-gray-900 dark:text-[#cccccc] hover:bg-gray-50 dark:hover:bg-[#2a2d2e]'
            )}
          >
            <span className="w-12 text-gray-500 dark:text-[#969696] font-mono">{role.id}</span>
            <span className="flex-1 truncate font-medium">{role.name}</span>
            <span className="w-16 text-gray-500 dark:text-[#969696]">{role.priority}</span>
            <span className="w-20 flex justify-end">
              {role.active ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-[#4ec9b0]">
                  <Check className="h-3.5 w-3.5" />
                </span>
              ) : (
                <span className="text-xs text-gray-400 dark:text-[#969696]">Inactive</span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
