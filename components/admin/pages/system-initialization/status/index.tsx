'use client';

import { cn } from '@/lib/utils';
import { RefreshCw, Plus, Check, X } from 'lucide-react';
import { initializeArchivedStatus, initializeAssignedStatus } from '@/services/initializationService';
import { useSystemStore } from '@/stores/useSystemStore';

interface StatusListProps {
  onAddLog: (message: string, type: 'info' | 'success' | 'error' | 'warning') => void;
}

export function StatusList({ onAddLog }: StatusListProps) {
  const { 
    statuses, 
    isLoadingStatuses: isLoading, 
    statusesError: error,
    fetchStatuses: storeFetchStatuses 
  } = useSystemStore();

  const fetchStatuses = async (): Promise<void> => {
    onAddLog('Retrieving task statuses...', 'info');
    await storeFetchStatuses();
    const { statuses: updatedStatuses, statusesError } = useSystemStore.getState();
    
    if (statusesError) {
      onAddLog(`Failed to retrieve statuses: ${statusesError}`, 'error');
    } else {
      onAddLog(`Retrieved ${updatedStatuses.length} task statuses successfully`, 'success');
    }
  };

  const addArchivedStatus = async (): Promise<void> => {
    onAddLog('Adding Archived status...', 'info');
    
    try {
      const response = await initializeArchivedStatus();
      
      if (response.status === 200) {
        onAddLog(response.message || 'Archived status added successfully', 'success');
        await fetchStatuses();
      } else {
        onAddLog(`Failed to add Archived status: ${response.message || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      onAddLog('Error adding Archived status: server connection failed', 'error');
      console.error(err);
    }
  };

  const addAssignedStatus = async (): Promise<void> => {
    onAddLog('Adding Assigned status...', 'info');
    
    try {
      const response = await initializeAssignedStatus();
      
      if (response.status === 200) {
        onAddLog(response.message || 'Assigned status added successfully', 'success');
        await fetchStatuses();
      } else {
        onAddLog(`Failed to add Assigned status: ${response.message || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      onAddLog('Error adding Assigned status: server connection failed', 'error');
      console.error(err);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#1e1e1e]">
      {/* Toolbar */}
      <div className="flex-shrink-0 h-9 bg-gray-50 dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center px-3 gap-2">
        <button
          onClick={fetchStatuses}
          disabled={isLoading}
          className="h-7 px-3 text-sm text-gray-700 dark:text-[#cccccc] hover:bg-gray-200 dark:hover:bg-[#3c3c3c] rounded flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          Refresh
        </button>
        <div className="w-px h-5 bg-gray-300 dark:bg-[#3c3c3c]" />
        <button
          onClick={addArchivedStatus}
          disabled={isLoading}
          className="h-7 px-3 text-sm text-gray-700 dark:text-[#cccccc] hover:bg-gray-200 dark:hover:bg-[#3c3c3c] rounded flex items-center gap-1.5 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Archived
        </button>
        <button
          onClick={addAssignedStatus}
          disabled={isLoading}
          className="h-7 px-3 text-sm text-gray-700 dark:text-[#cccccc] hover:bg-gray-200 dark:hover:bg-[#3c3c3c] rounded flex items-center gap-1.5 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Assigned
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex-shrink-0 px-3 py-2 bg-red-50 dark:bg-[#5a1d1d] border-b border-red-200 dark:border-[#be1100] text-sm text-red-600 dark:text-[#f48771]">
          {error}
        </div>
      )}

      {/* List Content */}
      <div className="flex-1 overflow-y-auto">
        {statuses.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-[#969696] text-sm">
            Click "Refresh" to load task statuses
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-[#3c3c3c]">
            {/* Header Row */}
            <div className="h-8 flex items-center px-3 bg-gray-50 dark:bg-[#252526] text-xs text-gray-500 dark:text-[#969696] uppercase tracking-wide">
              <span className="w-14">ID</span>
              <span className="flex-1">Name</span>
              <span className="w-20 text-right">Status</span>
            </div>
            
            {/* Data Rows */}
            {statuses.map((status) => (
              <div
                key={status.id}
                className="h-9 flex items-center px-3 text-sm text-gray-900 dark:text-[#cccccc] hover:bg-gray-50 dark:hover:bg-[#2a2d2e] transition-colors"
              >
                <span className="w-14 text-gray-500 dark:text-[#969696] font-mono">{status.id}</span>
                <span className="flex-1 truncate">{status.name}</span>
                <span className="w-20 flex justify-end">
                  {status.active ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-[#4ec9b0]">
                      <Check className="h-3.5 w-3.5" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-[#969696]">
                      <X className="h-3.5 w-3.5" />
                      Inactive
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
