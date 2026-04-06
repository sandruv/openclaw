'use client';

import { Permission } from '@/services/rolesPermissionsService';
import { Key, Check } from 'lucide-react';

interface PermissionsListViewProps {
  permissions: Permission[];
}

export function PermissionsListView({ permissions }: PermissionsListViewProps) {
  if (permissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-[#969696] text-sm">
        <Key className="h-4 w-4 mr-2 opacity-50" />
        No permissions found
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="divide-y divide-gray-200 dark:divide-[#3c3c3c]">
        {/* Header Row */}
        <div className="h-8 flex items-center px-3 bg-gray-50 dark:bg-[#252526] text-xs text-gray-500 dark:text-[#969696] uppercase tracking-wide sticky top-0">
          <span className="w-12">ID</span>
          <span className="flex-1">Permission Name</span>
          <span className="w-64">Description</span>
          <span className="w-20 text-right">Status</span>
        </div>
        
        {/* Data Rows */}
        {permissions.map((permission) => (
          <div
            key={permission.id}
            className="h-9 flex items-center px-3 text-sm text-gray-900 dark:text-[#cccccc] hover:bg-gray-50 dark:hover:bg-[#2a2d2e] transition-colors"
          >
            <span className="w-12 text-gray-500 dark:text-[#969696] font-mono">{permission.id}</span>
            <span className="flex-1 truncate font-medium">{permission.name}</span>
            <span className="w-64 truncate text-gray-500 dark:text-[#969696] text-xs">
              {permission.description || '-'}
            </span>
            <span className="w-20 flex justify-end">
              {permission.active ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-[#4ec9b0]">
                  <Check className="h-3.5 w-3.5" />
                </span>
              ) : (
                <span className="text-xs text-gray-400 dark:text-[#969696]">Inactive</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
