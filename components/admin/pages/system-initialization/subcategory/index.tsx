'use client';

import { cn } from '@/lib/utils';
import { RefreshCw, Plus, FolderPlus, Check, X } from 'lucide-react';
import { seedRequestSubcategories, createRequestCategory } from '@/services/initializationService';
import { useSystemStore } from '@/stores/useSystemStore';

interface SubcategoryListProps {
  onAddLog: (message: string, type: 'info' | 'success' | 'error' | 'warning') => void;
}

export function SubcategoryList({ onAddLog }: SubcategoryListProps) {
  const { 
    subcategories, 
    isLoadingSubcategories: isLoading, 
    subcategoriesError: error,
    fetchSubcategories: storeFetchSubcategories 
  } = useSystemStore();

  const fetchSubcategories = async (): Promise<void> => {
    onAddLog('Retrieving Request subcategories...', 'info');
    await storeFetchSubcategories();
    const { subcategories: updatedSubcategories, subcategoriesError } = useSystemStore.getState();
    
    if (subcategoriesError) {
      onAddLog(`Failed to retrieve subcategories: ${subcategoriesError}`, 'error');
    } else {
      onAddLog(`Retrieved ${updatedSubcategories.length} Request subcategories successfully`, 'success');
    }
  };

  const createCategory = async (): Promise<void> => {
    onAddLog('Creating Request category...', 'info');
    
    try {
      const response = await createRequestCategory();
      
      if (response.status === 200) {
        onAddLog(response.message || 'Request category created successfully', 'success');
      } else {
        onAddLog(`Failed to create category: ${response.message || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      onAddLog('Error creating Request category: server connection failed', 'error');
      console.error(err);
    }
  };

  const seedSubcategories = async (): Promise<void> => {
    onAddLog('Seeding Request subcategories...', 'info');
    
    try {
      const response = await seedRequestSubcategories();
      
      if (response.status === 200) {
        onAddLog(response.message || 'Request subcategories seeded successfully', 'success');
        await fetchSubcategories();
      } else {
        onAddLog(`Failed to seed subcategories: ${response.message || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      onAddLog('Error seeding Request subcategories: server connection failed', 'error');
      console.error(err);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#1e1e1e]">
      {/* Toolbar */}
      <div className="flex-shrink-0 h-9 bg-gray-50 dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center px-3 gap-2">
        <button
          onClick={fetchSubcategories}
          disabled={isLoading}
          className="h-7 px-3 text-sm text-gray-700 dark:text-[#cccccc] hover:bg-gray-200 dark:hover:bg-[#3c3c3c] rounded flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          Refresh
        </button>
        <div className="w-px h-5 bg-gray-300 dark:bg-[#3c3c3c]" />
        <button
          onClick={createCategory}
          disabled={isLoading}
          className="h-7 px-3 text-sm text-gray-700 dark:text-[#cccccc] hover:bg-gray-200 dark:hover:bg-[#3c3c3c] rounded flex items-center gap-1.5 disabled:opacity-50"
        >
          <FolderPlus className="h-3.5 w-3.5" />
          Add Category
        </button>
        <button
          onClick={seedSubcategories}
          disabled={isLoading}
          className="h-7 px-3 text-sm text-gray-700 dark:text-[#cccccc] hover:bg-gray-200 dark:hover:bg-[#3c3c3c] rounded flex items-center gap-1.5 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Seed All
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
        {subcategories.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-[#969696] text-sm">
            Click "Refresh" to load subcategories
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
            {subcategories.map((subcategory) => (
              <div
                key={subcategory.id}
                className="h-9 flex items-center px-3 text-sm text-gray-900 dark:text-[#cccccc] hover:bg-gray-50 dark:hover:bg-[#2a2d2e] transition-colors"
              >
                <span className="w-14 text-gray-500 dark:text-[#969696] font-mono">{subcategory.id}</span>
                <span className="flex-1 truncate">{subcategory.name}</span>
                <span className="w-20 flex justify-end">
                  {subcategory.active ? (
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
