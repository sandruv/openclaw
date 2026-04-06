'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAIUsageStore } from '@/stores/useAIUsageStore';
import { RoleConfig } from '@/services/aiUsageService';
import { cn } from '@/lib/utils';
import { Save, Settings } from 'lucide-react';

export function RoleSettingsPane() {
  const {
    roleConfigs,
    roleConfigsLoading,
    selectedRoleId,
    setSelectedRoleId,
    fetchRoleConfigs,
    updateRoleConfig,
  } = useAIUsageStore();

  const [editLimit, setEditLimit] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchRoleConfigs();
  }, [fetchRoleConfigs]);

  const selectedConfig = roleConfigs.find((c) => c.role_id === selectedRoleId);

  useEffect(() => {
    if (selectedConfig) {
      setEditLimit(selectedConfig.monthly_limit);
      setSaved(false);
    }
  }, [selectedConfig]);

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    const success = await updateRoleConfig(selectedRoleId, editLimit);
    setSaving(false);
    if (success) setSaved(true);
  };

  const formatTokens = (n: number) => n.toLocaleString();

  return (
    <div className="h-full flex">
      {/* Left: Role list */}
      <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-[#3c3c3c] min-w-0">
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-gray-200 dark:divide-[#3c3c3c]">
            {/* Header */}
            <div className="h-8 flex items-center px-3 bg-gray-50 dark:bg-[#252526] text-xs text-gray-500 dark:text-[#969696] uppercase tracking-wide sticky top-0 z-10">
              <span className="flex-1">Role</span>
              <span className="w-28 text-right">Monthly Limit</span>
            </div>

            {roleConfigsLoading ? (
              <div className="p-6 text-center text-sm text-gray-400">Loading...</div>
            ) : (
              roleConfigs.map((config) => (
                <div
                  key={config.role_id}
                  onClick={() => setSelectedRoleId(config.role_id)}
                  className={cn(
                    'h-9 flex items-center px-3 text-sm cursor-pointer transition-colors',
                    selectedRoleId === config.role_id
                      ? 'bg-blue-50 dark:bg-[#094771] text-gray-900 dark:text-white'
                      : 'text-gray-900 dark:text-[#cccccc] hover:bg-gray-50 dark:hover:bg-[#2a2d2e]'
                  )}
                >
                  <span className="flex-1 truncate">{config.role_name}</span>
                  <span className="w-28 text-right font-mono text-xs text-gray-500 dark:text-[#969696]">
                    {config.monthly_limit === 0 ? 'Unlimited' : formatTokens(config.monthly_limit)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right: Edit form */}
      <div className="w-[45%] flex-shrink-0 min-w-[250px] flex flex-col">
        <div className="h-[35px] border-b border-gray-200 dark:border-[#3c3c3c] bg-white dark:bg-[#252526] px-3 flex items-center">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            Role Settings
          </span>
        </div>

        {selectedConfig ? (
          <div className="flex-1 overflow-auto p-4 space-y-4">
            <div>
              <Label className="text-xs text-gray-500 dark:text-[#969696]">Role</Label>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedConfig.role_name}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Monthly Token Limit
              </Label>
              <Input
                type="number"
                min={0}
                value={editLimit}
                onChange={(e) => {
                  setEditLimit(Math.max(0, parseInt(e.target.value) || 0));
                  setSaved(false);
                }}
                className="h-8 text-sm font-mono"
              />
              <p className="text-[10px] text-gray-400 dark:text-[#969696]">
                Set to 0 for unlimited (exempt from limits)
              </p>
            </div>

            <Button
              size="sm"
              className="h-8"
              onClick={handleSave}
              disabled={saving || editLimit === selectedConfig.monthly_limit}
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400 dark:text-[#969696]">
            <div className="text-center">
              <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Select a role to edit limits</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
