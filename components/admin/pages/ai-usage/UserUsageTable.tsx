'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIUsageStore } from '@/stores/useAIUsageStore';
import { AdminUserUsage } from '@/services/aiUsageService';

interface UserUsageTableProps {
  onSelectUser: (user: AdminUserUsage) => void;
  selectedUserId: number | null;
}

export function UserUsageTable({ onSelectUser, selectedUserId }: UserUsageTableProps) {
  const {
    users,
    systemTokens,
    pagination,
    selectedMonth,
    search,
    loading,
    setMonth,
    setPage,
    setSearch,
  } = useAIUsageStore();

  const [searchInput, setSearchInput] = useState(search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleMonthNav = (delta: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const d = new Date(year, month - 1 + delta, 1);
    const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setMonth(newMonth);
  };

  const monthLabel = (() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  })();

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  const getUsageColor = (used: number, limit: number) => {
    if (limit === 0) return 'text-gray-500 dark:text-[#969696]';
    const pct = (used / limit) * 100;
    if (pct >= 90) return 'text-red-500 dark:text-red-400';
    if (pct >= 75) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-green-600 dark:text-[#4ec9b0]';
  };

  const formatTokens = (n: number) => n.toLocaleString();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* System usage summary */}
      <div className="flex-shrink-0 px-3 py-2 border-b border-gray-200 dark:border-[#3c3c3c] bg-gray-50 dark:bg-[#252526]">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#969696]">
          <Cpu className="h-3.5 w-3.5" />
          <span>System (Analysis): <strong className="text-gray-700 dark:text-gray-300">{formatTokens(systemTokens)}</strong> tokens this month</span>
        </div>
      </div>

      {/* Month nav + search */}
      <div className="flex-shrink-0 px-3 py-2 border-b border-gray-200 dark:border-[#3c3c3c] space-y-2">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMonthNav(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{monthLabel}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMonthNav(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email..."
            className="h-8 pl-8 text-sm"
          />
        </form>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto styled-scrollbar">
        <div className="divide-y divide-gray-200 dark:divide-[#3c3c3c]">
          {/* Header */}
          <div className="h-8 flex items-center px-3 bg-gray-50 dark:bg-[#252526] text-xs text-gray-500 dark:text-[#969696] uppercase tracking-wide sticky top-0 z-10">
            <span className="flex-1">User</span>
            <span className="w-20 text-right">Role</span>
            <span className="w-24 text-right">Used</span>
            <span className="w-24 text-right">Limit</span>
            <span className="w-16 text-right">%</span>
          </div>

          {loading ? (
            <div className="p-6 text-center text-sm text-gray-400">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">No users found</div>
          ) : (
            users.map((user) => {
              const pct = user.effective_limit > 0
                ? Math.min(100, Math.round((user.tokens_used / user.effective_limit) * 100))
                : 0;
              const isUnlimited = user.effective_limit === 0;

              return (
                <div
                  key={user.user_id}
                  onClick={() => onSelectUser(user)}
                  className={cn(
                    'h-9 flex items-center px-3 text-sm cursor-pointer transition-colors',
                    selectedUserId === user.user_id
                      ? 'bg-blue-50 dark:bg-[#094771] text-gray-900 dark:text-white'
                      : 'text-gray-900 dark:text-[#cccccc] hover:bg-gray-50 dark:hover:bg-[#2a2d2e]'
                  )}
                >
                  <span className="flex-1 truncate">{user.name}</span>
                  <span className="w-20 text-right text-xs text-gray-500 dark:text-[#969696] truncate">{user.role_name}</span>
                  <span className={cn('w-24 text-right font-mono text-xs', getUsageColor(user.tokens_used, user.effective_limit))}>
                    {formatTokens(user.tokens_used)}
                  </span>
                  <span className="w-24 text-right font-mono text-xs text-gray-500 dark:text-[#969696]">
                    {isUnlimited ? '∞' : formatTokens(user.effective_limit)}
                  </span>
                  <span className={cn('w-16 text-right font-mono text-xs', getUsageColor(user.tokens_used, user.effective_limit))}>
                    {isUnlimited ? '—' : `${pct}%`}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 h-9 flex items-center justify-between px-3 border-t border-gray-200 dark:border-[#3c3c3c] bg-gray-50 dark:bg-[#252526] text-xs text-gray-500 dark:text-[#969696]">
          <span>Page {pagination.page} of {totalPages}</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              disabled={pagination.page <= 1}
              onClick={() => setPage(pagination.page - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              disabled={pagination.page >= totalPages}
              onClick={() => setPage(pagination.page + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
