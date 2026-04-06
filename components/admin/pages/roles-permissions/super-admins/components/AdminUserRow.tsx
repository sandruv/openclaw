'use client';

import { Shield, Crown } from 'lucide-react';
import { AdminUser } from '@/services/initializationService';

interface AdminUserRowProps {
  user: AdminUser;
}

export function AdminUserRow({ user }: AdminUserRowProps) {
  return (
    <div className="h-9 flex items-center px-3 text-sm text-gray-900 dark:text-[#cccccc] hover:bg-gray-50 dark:hover:bg-[#2a2d2e] transition-colors">
      <span className="w-12 text-gray-500 dark:text-[#969696] font-mono">{user.id}</span>
      <span className="flex-1 truncate font-medium">
        {user.first_name} {user.last_name}
      </span>
      <span className="w-48 truncate text-gray-600 dark:text-[#969696] font-mono text-xs">
        {user.email}
      </span>
      <span className="w-24 flex justify-end">
        {user.role_id === 5 ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium ">
            <Crown className="h-3 w-3" />
            <span className="whitespace-nowrap">Super Admin</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
            <Shield className="h-3 w-3" />
            <span className="whitespace-nowrap">Admin</span>
          </span>
        )}
      </span>
    </div>
  );
}
