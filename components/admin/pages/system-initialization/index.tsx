'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { RoleProvider } from '@/lib/roleProvider';
import { useSystemStore } from '@/stores/useSystemStore';
import { IDETabStrip, TabItem } from './IDETabStrip';
import { StatusList } from './status';
import { SubcategoryList } from './subcategory';
import { EnvVariablesList } from './env-variables';
import { LoggerPane, LogEntry } from './LoggerPane';
import { AdminSkeleton } from './Skeleton';

export function SystemInitializationPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState('status');
  const router = useRouter();
  
  const { 
    statuses, 
    subcategories, 
    envVariables,
    fetchAll,
    fetchEnvVariables,
    statusesFetchedAt,
    subcategoriesFetchedAt,
    envVariablesFetchedAt
  } = useSystemStore();
  const { user } = useAuth();
  
  // Only allow access to admin users
  const isAdmin = user ? RoleProvider.isAdmin({
    ...user,
    role_id: typeof user.role_id === 'string' ? parseInt(user.role_id) : user.role_id
  }) : false;

  useEffect(() => {
    const initializeData = async () => {
      // Fetch data if not already fetched
      if (!statusesFetchedAt || !subcategoriesFetchedAt) {
        await fetchAll();
      }
      if (!envVariablesFetchedAt) {
        await fetchEnvVariables();
      }
      setLoading(false);
    };
    
    initializeData();
  }, [fetchAll, fetchEnvVariables, statusesFetchedAt, subcategoriesFetchedAt, envVariablesFetchedAt]);

  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/');
    }
  }, [user, isAdmin, router]);
  
  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setLogs(prev => [...prev, { message, timestamp: new Date().toISOString(), type }]);
  };

  const tabs: TabItem[] = [
    { id: 'status', label: 'Task Status', count: statuses.length || undefined },
    { id: 'subcategory', label: 'Subcategory Init', count: subcategories.length || undefined },
    { id: 'env-variables', label: 'Env Variables', count: envVariables.length || undefined },
  ];

  if (loading) {
    return <AdminSkeleton />;
  }

  if (!isAdmin) {
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
          onTabChange={setActiveTab}
        />
        
        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'status' && (
            <StatusList onAddLog={addLog} />
          )}
          {activeTab === 'subcategory' && (
            <SubcategoryList onAddLog={addLog} />
          )}
          {activeTab === 'env-variables' && (
            <EnvVariablesList onAddLog={addLog} />
          )}
        </div>
      </div>

      {/* Right Pane - Logger */}
      <div className="w-[45%] flex-shrink-0 min-w-[300px] flex flex-col">
        <LoggerPane logs={logs} title="Output" />
      </div>
    </div>
  );
}

export default SystemInitializationPage;
