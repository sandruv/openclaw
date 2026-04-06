'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { usePatchUpdateStore } from '@/stores/usePatchUpdateStore';
import { PatchUpdateCard } from './PatchUpdateCard';
import { PatchUpdatesListSkeleton } from './loaders/PatchUpdateSkeletons';
import { PatchUpdateListParams } from '@/services/patchUpdateService';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter,
  RefreshCw,
  CheckCircle2,
  Circle,
  AlertCircle,
  TriangleAlert,
  Info,
  Zap
} from 'lucide-react';

interface PatchUpdatesListProps {
  showFilters?: boolean;
  compact?: boolean;
  className?: string;
}

export function PatchUpdatesList({ 
  showFilters = true, 
  compact = false,
  className = '' 
}: PatchUpdatesListProps) {
  const {
    patchUpdates,
    pagination,
    loading,
    error,
    fetchPatchUpdates,
    markAllAsRead,
    markReadLoading,
  } = usePatchUpdateStore();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    setIsFirstLoad(false);
  }, []);

  // Fetch updates when filters change
  useEffect(() => {
    const params: PatchUpdateListParams = {
      page: currentPage,
      limit: 10,
    };

    if (selectedPriority !== 'all') {
      params.priority = selectedPriority;
    }

    if (showUnreadOnly) {
      params.unreadOnly = true;
    }

    fetchPatchUpdates(params);
  }, [currentPage, selectedPriority, showUnreadOnly, fetchPatchUpdates]);

  // Filter updates by search query (client-side)
  const filteredUpdates = patchUpdates.filter(update => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      update.title.toLowerCase().includes(query) ||
      update.content.toLowerCase().includes(query) ||
      update.creator.first_name?.toLowerCase().includes(query) ||
      update.creator.last_name?.toLowerCase().includes(query)
    );
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    fetchPatchUpdates({
      page: currentPage,
      limit: 10,
      priority: selectedPriority !== 'all' ? selectedPriority : undefined,
      unreadOnly: showUnreadOnly,
    });
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = patchUpdates
      .filter(update => !update.isRead)
      .map(update => update.id);
    
    if (unreadIds.length > 0) {
      await markAllAsRead(unreadIds);
    }
  };

  const unreadCount = patchUpdates.filter(update => !update.isRead).length;

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <TriangleAlert className="h-4 w-4 text-red-600" />;
      case 'high':
        return <Zap className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Failed to load patch updates
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error}
        </p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (isFirstLoad) {
    return <PatchUpdatesListSkeleton count={5} header />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Patch Updates
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Stay up to date with the latest changes and improvements
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markReadLoading}
            >
              {markReadLoading ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Mark all as read
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <Spinner size="sm" className="h-4 w-4" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 space-y-4">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search updates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Priority Filter */}
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="critical">
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon('critical')}
                    <span>Critical</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon('high')}
                    <span>High</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon('medium')}
                    <span>Medium</span>
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon('low')}
                    <span>Low</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Read Status Filter */}
            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className="justify-start"
            >
              {showUnreadOnly ? (
                <Circle className="h-4 w-4 mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {showUnreadOnly ? 'Unread only' : 'All updates'}
            </Button>

            {/* Stats */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Badge variant="secondary">
                {pagination.total} total
              </Badge>
              {unreadCount > 0 && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {(loading) && (
        <PatchUpdatesListSkeleton count={5} />
      )}
      
      {/* Updates List */}
      {!loading && (
        <>
          {filteredUpdates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Info className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No patch updates found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || selectedPriority !== 'all' || showUnreadOnly
                  ? 'Try adjusting your filters to see more results.'
                  : 'There are no patch updates available yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUpdates.map((update) => (
                <PatchUpdateCard
                  key={update.id}
                  update={update}
                  compact={compact}
                  showActions={true}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      const current = pagination.page;
                      return page === 1 || page === pagination.totalPages || 
                             (page >= current - 1 && page <= current + 1);
                    })
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <Button
                          variant={page === pagination.page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
