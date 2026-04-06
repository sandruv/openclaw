'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionStore } from '@/stores/useSessionStore';
import { useAIUsageStore } from '@/stores/useAIUsageStore';
import { IDETabStrip } from '../system-initialization/IDETabStrip';
import { UserUsageTable } from './UserUsageTable';
import { UserDetailPane } from './UserDetailPane';
import { RoleSettingsPane } from './RoleSettingsPane';
import { AIUsageSkeleton } from './Skeleton';

type TabType = 'usage' | 'settings';

export function AIUsagePage() {
  const [activeTab, setActiveTab] = useState<TabType>('usage');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin } = useSessionStore();

  const {
    selectedUser,
    setSelectedUser,
    loading,
    fetchUsage,
  } = useAIUsageStore();

  const hasAccess = isAdmin();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user && !hasAccess) {
      router.push('/');
    }
  }, [mounted, user, hasAccess, router]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const tabs = [
    { id: 'usage' as TabType, label: 'Usage' },
    { id: 'settings' as TabType, label: 'Settings' },
  ];

  if (!mounted) return <AIUsageSkeleton />;
  if (!hasAccess) return null;
  if (loading && !useAIUsageStore.getState().users.length) return <AIUsageSkeleton />;

  return (
    <div className="h-full flex bg-gray-100 dark:bg-[#1e1e1e]">
      {activeTab === 'usage' ? (
        <>
          {/* Left Pane - User Usage Table */}
          <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-[#3c3c3c] min-w-0">
            <IDETabStrip
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(id) => setActiveTab(id as TabType)}
            />
            <UserUsageTable
              onSelectUser={setSelectedUser}
              selectedUserId={selectedUser?.user_id ?? null}
            />
          </div>

          {/* Right Pane - User Detail */}
          <div className="w-[45%] flex-shrink-0 min-w-[300px] flex flex-col">
            <div className="h-[35px] border-b border-gray-200 dark:border-[#3c3c3c] bg-white dark:bg-[#252526] px-3 flex items-center">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                User Details
              </span>
            </div>
            <UserDetailPane user={selectedUser} />
          </div>
        </>
      ) : (
        <>
          {/* Settings tab uses its own two-pane layout */}
          <div className="flex-1 flex flex-col min-w-0">
            <IDETabStrip
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(id) => setActiveTab(id as TabType)}
            />
            <RoleSettingsPane />
          </div>
        </>
      )}
    </div>
  );
}

export default AIUsagePage;
