'use client';

import { useState } from 'react';
import { RefreshCw, Shield } from 'lucide-react';
import { ComboboxApi, ComboboxOption } from '@/components/ui/combobox-api';
import { useUserStore } from '@/stores/useUserStore';

interface RoleAssignmentFormProps {
  onAssign: (userId: number, roleId: 3 | 5) => Promise<void>;
  onCancel: () => void;
  processing: boolean;
}

export function RoleAssignmentForm({ onAssign, onCancel, processing }: RoleAssignmentFormProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<3 | 5>(3);
  const [hasSearched, setHasSearched] = useState(false);
  const { users, fetchUsers, isLoading: isSearching } = useUserStore();

  const handleSearch = async (query: string) => {
    setHasSearched(true);
    // Fetch users with search query - if query is empty, it will return all users
    await fetchUsers(1, 100, query);
  };

  // Filter out users who are already admin or super admin
  let availableUsers = users.filter(user => 
    user.role_id !== 3 && user.role_id !== 5
  );

  // If no search has been performed yet, default to showing yanceyworks.com users
  if (!hasSearched) {
    availableUsers = availableUsers.filter(user => 
      user.email.toLowerCase().includes('yanceyworks.com')
    );
  }

  const userOptions: ComboboxOption[] = availableUsers.map(user => ({
    value: user.id.toString(),
    label: `${user.first_name} ${user.last_name} (${user.email})${user.role?.name ? ` - ${user.role.name}` : ''}`
  }));

  const handleAssign = async () => {
    if (!selectedUserId) return;
    await onAssign(Number(selectedUserId), selectedRole);
    setSelectedUserId('');
  };

  return (
    <div className="px-3 py-4 bg-gray-50 dark:bg-[#252526] border-t border-gray-200 dark:border-[#3c3c3c]">
      <div className="space-y-3 max-w-2xl">
        {/* Select User */}
        <div className="flex gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-[#cccccc] mb-1">
              Select User
            </label>
            <ComboboxApi
              options={userOptions}
              placeholder="Search users by name or email..."
              emptyMessage={hasSearched ? "No users found matching your search." : "Start typing to search for users."}
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              onSearch={handleSearch}
              isSearchLoading={isSearching}
              disabled={processing}
              searchDebounce={300}
            />
            {!hasSearched && userOptions.length > 0 && (
              <p className="mt-1 text-xs text-gray-500 dark:text-[#969696]">
                Showing {userOptions.length} yanceyworks.com user{userOptions.length !== 1 ? 's' : ''}. Search to see all users.
              </p>
            )}
          </div>

          {/* Select Role */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-[#cccccc] mb-1">
              Assign Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(Number(e.target.value) as 3 | 5)}
              disabled={processing}
              className="w-full h-8 px-2 text-sm bg-white dark:bg-[#1e1e1e] border border-gray-300 dark:border-[#3c3c3c] rounded text-gray-900 dark:text-[#cccccc] disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={3}>Admin</option>
              <option value={5}>Super Admin</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleAssign}
            disabled={processing || !selectedUserId}
            className="h-8 px-4 text-sm bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded flex items-center gap-1.5 disabled:opacity-50"
          >
            {processing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <Shield className="h-3.5 w-3.5" />
                Assign Role
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
