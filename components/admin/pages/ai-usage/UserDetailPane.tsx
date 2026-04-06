'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAIUsageStore } from '@/stores/useAIUsageStore';
import { AdminUserUsage } from '@/services/aiUsageService';
import { cn } from '@/lib/utils';
import { Save, User } from 'lucide-react';

interface UserDetailPaneProps {
  user: AdminUserUsage | null;
}

export function UserDetailPane({ user }: UserDetailPaneProps) {
  const { updateUserAllocation } = useAIUsageStore();
  const [extraTokens, setExtraTokens] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setExtraTokens(user.extra_tokens);
      setSaved(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-400 dark:text-[#969696]">
        <div className="text-center">
          <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Select a user to view details</p>
        </div>
      </div>
    );
  }

  const isUnlimited = user.effective_limit === 0;
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((user.tokens_used / user.effective_limit) * 100));
  const formatTokens = (n: number) => n.toLocaleString();

  const barColor = isUnlimited
    ? 'bg-gray-300 dark:bg-gray-600'
    : pct >= 90
      ? 'bg-red-500'
      : pct >= 75
        ? 'bg-yellow-500'
        : 'bg-green-500';

  const handleSave = async () => {
    setSaving(true);
    const success = await updateUserAllocation(user.user_id, extraTokens);
    setSaving(false);
    if (success) setSaved(true);
  };

  return (
    <div className="flex-1 overflow-auto p-4 space-y-5">
      {/* User info */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</h3>
        <p className="text-xs text-gray-500 dark:text-[#969696]">{user.email}</p>
        <p className="text-xs text-gray-500 dark:text-[#969696] mt-0.5">Role: {user.role_name}</p>
      </div>

      {/* Usage bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-gray-500 dark:text-[#969696]">
          <span>
            {isUnlimited ? 'Unlimited' : `${formatTokens(user.tokens_used)} / ${formatTokens(user.effective_limit)}`}
          </span>
          {!isUnlimited && <span>{pct}%</span>}
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', barColor)}
            style={{ width: isUnlimited ? '0%' : `${pct}%` }}
          />
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-[#969696]">Tokens used this month</span>
          <span className="font-mono text-gray-900 dark:text-white">{formatTokens(user.tokens_used)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-[#969696]">Role default limit</span>
          <span className="font-mono text-gray-900 dark:text-white">
            {user.role_limit === 0 ? 'Unlimited' : formatTokens(user.role_limit)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-[#969696]">Extra tokens</span>
          <span className="font-mono text-gray-900 dark:text-white">{formatTokens(user.extra_tokens)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-200 dark:border-[#3c3c3c] pt-2">
          <span className="text-gray-700 dark:text-gray-300 font-medium">Effective limit</span>
          <span className="font-mono font-medium text-gray-900 dark:text-white">
            {user.effective_limit === 0 ? 'Unlimited' : formatTokens(user.effective_limit)}
          </span>
        </div>
      </div>

      {/* Extra tokens editor */}
      {user.role_limit > 0 && (
        <div className="space-y-2 border-t border-gray-200 dark:border-[#3c3c3c] pt-4">
          <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Set Extra Tokens
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              value={extraTokens}
              onChange={(e) => {
                setExtraTokens(Math.max(0, parseInt(e.target.value) || 0));
                setSaved(false);
              }}
              className="h-8 text-sm font-mono"
            />
            <Button
              size="sm"
              className="h-8 px-3"
              onClick={handleSave}
              disabled={saving || extraTokens === user.extra_tokens}
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
            </Button>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-[#969696]">
            New effective limit: {formatTokens(user.role_limit + extraTokens)}
          </p>
        </div>
      )}
    </div>
  );
}
