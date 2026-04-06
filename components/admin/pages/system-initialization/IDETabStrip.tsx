'use client';

import { cn } from '@/lib/utils';
import { useLoader } from '@/contexts/LoaderContext';
import { useCallback } from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface IDETabStripProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  /**
   * If true, shows loader when switching tabs
   * @default true
   */
  showLoader?: boolean;
}

export function IDETabStrip({ tabs, activeTab, onTabChange, showLoader = true }: IDETabStripProps) {
  const { setIsLoading } = useLoader();

  const handleTabClick = useCallback((tabId: string) => {
    // Don't show loader if clicking the same tab
    if (tabId === activeTab) {
      return;
    }

    // Show loader immediately on click
    if (showLoader) {
      setIsLoading(true);
    }

    // Call the tab change handler
    onTabChange(tabId);

    // Hide loader after a short delay to allow content to render
    if (showLoader) {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [activeTab, onTabChange, setIsLoading, showLoader]);

  return (
    <div className="flex-shrink-0 h-9 bg-gray-50 dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] flex items-end">
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              'h-9 px-4 text-sm font-medium flex items-center gap-2 border-r border-gray-200 dark:border-[#3c3c3c] transition-colors',
              isActive
                ? 'bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white border-t-2 border-t-blue-500 dark:border-t-[#007acc]'
                : 'text-gray-500 dark:text-[#969696] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2a2d2e]'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded',
                isActive ? 'bg-blue-500 dark:bg-[#007acc] text-white' : 'bg-gray-200 dark:bg-[#3c3c3c] text-gray-600 dark:text-[#969696]'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
