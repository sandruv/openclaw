'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw, Eye, Check, X } from 'lucide-react';
import { useSystemStore } from '@/stores/useSystemStore';
import { getEnvVariableValue } from '@/services/initializationService';

interface EnvVariablesListProps {
  onAddLog: (message: string, type: 'info' | 'success' | 'error' | 'warning') => void;
}

export function EnvVariablesList({ onAddLog }: EnvVariablesListProps) {
  const [loadingVar, setLoadingVar] = useState<string | null>(null);
  
  const { 
    envVariables, 
    isLoadingEnvVariables: isLoading, 
    envVariablesError: error,
    fetchEnvVariables: storeFetchEnvVariables 
  } = useSystemStore();

  const fetchEnvVariables = async (): Promise<void> => {
    onAddLog('Retrieving environment variables...', 'info');
    await storeFetchEnvVariables();
    const { envVariables: updatedVars, envVariablesError } = useSystemStore.getState();
    
    if (envVariablesError) {
      onAddLog(`Failed to retrieve environment variables: ${envVariablesError}`, 'error');
    } else {
      onAddLog(`Retrieved ${updatedVars.length} environment variables successfully`, 'success');
    }
  };

  const showVariableValue = async (name: string): Promise<void> => {
    setLoadingVar(name);
    onAddLog(`Fetching value for ${name}...`, 'info');
    
    try {
      const response = await getEnvVariableValue(name);
      
      if (response.status === 200 && response.data) {
        const { value, category } = response.data;
        onAddLog(`[${category}] ${name} = ${value}`, 'success');
      } else {
        onAddLog(`Failed to get value for ${name}: ${response.message || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      onAddLog(`Error fetching value for ${name}: server connection failed`, 'error');
      console.error(err);
    } finally {
      setLoadingVar(null);
    }
  };

  // Group variables by category
  const groupedVariables = envVariables.reduce((acc, variable) => {
    if (!acc[variable.category]) {
      acc[variable.category] = [];
    }
    acc[variable.category].push(variable);
    return acc;
  }, {} as Record<string, typeof envVariables>);

  const categories = Object.keys(groupedVariables).sort();

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#1e1e1e]">
      {/* Toolbar */}
      <div className="flex-shrink-0 h-9 bg-gray-50 dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center px-3 gap-2">
        <button
          onClick={fetchEnvVariables}
          disabled={isLoading}
          className="h-7 px-3 text-sm text-gray-700 dark:text-[#cccccc] hover:bg-gray-200 dark:hover:bg-[#3c3c3c] rounded flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          Refresh
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
        {envVariables.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-[#969696] text-sm">
            Click "Refresh" to load environment variables
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-[#3c3c3c]">
            {categories.map((category) => (
              <div key={category}>
                {/* Category Header */}
                <div className="h-8 flex items-center px-3 bg-gray-100 dark:bg-[#2d2d2d] text-xs text-gray-600 dark:text-[#969696] uppercase tracking-wide font-medium">
                  {category}
                  <span className="ml-2 text-gray-400 dark:text-[#6e6e6e]">
                    ({groupedVariables[category].length})
                  </span>
                </div>
                
                {/* Variables in Category */}
                {groupedVariables[category].map((variable) => (
                  <div
                    key={variable.name}
                    className="h-9 flex items-center px-3 text-sm text-gray-900 dark:text-[#cccccc] hover:bg-gray-50 dark:hover:bg-[#2a2d2e] transition-colors"
                  >
                    <span className="flex-1 font-mono text-xs truncate">{variable.name}</span>
                    <span className="w-20 flex justify-center">
                      {variable.hasValue ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-[#4ec9b0]">
                          <Check className="h-3.5 w-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-[#969696]">
                          <X className="h-3.5 w-3.5" />
                          Empty
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => showVariableValue(variable.name)}
                      disabled={loadingVar === variable.name}
                      className="ml-2 h-6 w-6 flex items-center justify-center text-gray-500 dark:text-[#969696] hover:text-blue-600 dark:hover:text-[#569cd6] hover:bg-gray-200 dark:hover:bg-[#3c3c3c] rounded disabled:opacity-50"
                      title="Show value"
                    >
                      <Eye className={cn('h-3.5 w-3.5', loadingVar === variable.name && 'animate-pulse')} />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
