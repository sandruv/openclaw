'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePatchUpdateStore } from '@/stores/usePatchUpdateStore';
import { PatchUpdate } from '@/services/patchUpdateService';
import { patchUpdateHelpers } from '@/constants/colors';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  RefreshCw,
  AlertCircle,
  Calendar,
  User,
  FileText,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/components/ui/toast-provider';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FormattedContent } from '@/components/patch-updates/helpers/FormattedContent';

interface AdminPatchUpdatesListProps {
  className?: string;
}

export function AdminPatchUpdatesList({ className = '' }: AdminPatchUpdatesListProps) {
  const {
    patchUpdates,
    pagination,
    loading,
    error,
    fetchPatchUpdates,
    deletePatchUpdate,
    updatePatchUpdate,
    deleteLoading,
  } = usePatchUpdateStore();
  const { showToast } = useToast();
  const router = useRouter();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateToDelete, setUpdateToDelete] = useState<PatchUpdate | null>(null);
  const [processingAction, setProcessingAction] = useState<{id: number, action: 'edit' | 'publish' | 'delete'} | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<PatchUpdate | null>(null);

  // Fetch patch updates on component mount
  useEffect(() => {
    fetchPatchUpdates({ page: 1, limit: 10 });
  }, [fetchPatchUpdates]);

  const handleDeleteClick = (update: PatchUpdate) => {
    setUpdateToDelete(update);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!updateToDelete) return;

    setProcessingAction({ id: updateToDelete.id, action: 'delete' });
    try {
      const success = await deletePatchUpdate(updateToDelete.id);
      if (success) {
        showToast({
          type: 'success',
          title: 'Success',
          description: 'Patch update deleted successfully'
        });
        setDeleteDialogOpen(false);
        setUpdateToDelete(null);
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          description: 'Failed to delete patch update'
        });
      }
    } catch (error) {
      console.error('Error deleting patch update:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'An error occurred while deleting the patch update'
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleTogglePublished = async (update: PatchUpdate) => {
    setProcessingAction({ id: update.id, action: 'publish' });
    try {
      const result = await updatePatchUpdate(update.id, {
        published: !update.published
      });
      
      if (result) {
        showToast({
          type: 'success',
          title: 'Success',
          description: update.published 
            ? 'Patch update unpublished successfully' 
            : 'Patch update published successfully'
        });
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          description: 'Failed to update patch update'
        });
      }
    } catch (error) {
      console.error('Error updating patch update:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'An error occurred while updating the patch update'
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleEditClick = (update: PatchUpdate) => {
    setProcessingAction({ id: update.id, action: 'edit' });
    router.push(`/admin/patch/${update.id}/edit`);
  };

  const handleCreateClick = () => {
    setIsNavigating(true);
    router.push('/admin/patch/create');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchPatchUpdates({ page: 1, limit: 10 });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-select first update when list loads
  useEffect(() => {
    if (patchUpdates.length > 0 && !selectedUpdate) {
      setSelectedUpdate(patchUpdates[0]);
    }
  }, [patchUpdates, selectedUpdate]);

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`h-full flex bg-gray-100 dark:bg-[#1e1e1e] ${className}`}>
      {/* Left Pane - List */}
      <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-[#3c3c3c] min-w-0">
        {/* Toolbar */}
        <div className="flex-shrink-0 h-10 bg-white dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center px-3 gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="h-7 px-3 text-sm text-gray-700 dark:text-[#cccccc] hover:bg-gray-100 dark:hover:bg-[#3c3c3c] rounded flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', (loading || isRefreshing) && 'animate-spin')} />
            Refresh
          </button>
          <div className="w-px h-5 bg-gray-300 dark:bg-[#3c3c3c]" />
          <button
            onClick={handleCreateClick}
            disabled={isNavigating || processingAction !== null}
            className="h-7 px-3 text-sm text-white bg-green-600 hover:bg-green-700 rounded flex items-center gap-1.5 disabled:opacity-50"
          >
            {isNavigating ? (
              <Spinner size="sm" className="h-3.5 w-3.5" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            New Update
          </button>
          <div className="flex-1" />
          <span className="text-xs text-gray-500 dark:text-[#969696]">
            {patchUpdates.length} updates
          </span>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex-shrink-0 px-3 py-2 bg-red-50 dark:bg-[#5a1d1d] border-b border-red-200 dark:border-[#be1100] text-sm text-red-600 dark:text-[#f48771]">
            {error}
          </div>
        )}

        {/* List Header */}
        <div className="h-9 flex items-center px-3 bg-gray-50 dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] text-xs text-gray-500 dark:text-[#969696] uppercase tracking-wide">
          <span className="w-6"></span>
          <span className="flex-1">Title</span>
          <span className="w-20 text-center">Priority</span>
          <span className="w-20 text-center">Status</span>
          <span className="w-24 text-right">Date</span>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-[#1e1e1e]">
          {loading ? (
            <div className="divide-y divide-gray-200 dark:divide-[#3c3c3c]">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 flex items-center px-3 animate-pulse">
                  <div className="w-6"><div className="w-2 h-2 bg-gray-200 dark:bg-[#3c3c3c] rounded-full" /></div>
                  <div className="flex-1"><div className="h-4 bg-gray-200 dark:bg-[#3c3c3c] rounded w-3/4" /></div>
                  <div className="w-20"><div className="h-4 bg-gray-200 dark:bg-[#3c3c3c] rounded mx-auto w-12" /></div>
                  <div className="w-20"><div className="h-4 bg-gray-200 dark:bg-[#3c3c3c] rounded mx-auto w-14" /></div>
                  <div className="w-24 text-right"><div className="h-4 bg-gray-200 dark:bg-[#3c3c3c] rounded ml-auto w-16" /></div>
                </div>
              ))}
            </div>
          ) : patchUpdates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-[#969696]">
              <FileText className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">No patch updates yet</p>
              <button
                onClick={handleCreateClick}
                className="mt-3 text-sm text-blue-600 dark:text-[#007acc] hover:underline"
              >
                Create your first update
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-[#3c3c3c]">
              {patchUpdates.map((update) => (
                <div
                  key={update.id}
                  onClick={() => setSelectedUpdate(update)}
                  className={cn(
                    'h-12 flex items-center px-3 cursor-pointer transition-colors',
                    selectedUpdate?.id === update.id
                      ? 'bg-blue-50 dark:bg-[#094771] border-l-2 border-l-blue-500 dark:border-l-[#007acc]'
                      : 'hover:bg-gray-50 dark:hover:bg-[#2a2d2e]'
                  )}
                >
                  {/* Priority Indicator */}
                  <div className="w-6 flex justify-center">
                    <div className={cn('w-2 h-2 rounded-full', getPriorityIndicator(update.priority))} />
                  </div>
                  
                  {/* Title */}
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      'text-sm truncate block',
                      selectedUpdate?.id === update.id
                        ? 'text-gray-900 dark:text-white font-medium'
                        : 'text-gray-700 dark:text-[#cccccc]'
                    )}>
                      {update.title}
                    </span>
                  </div>
                  
                  {/* Priority Badge */}
                  <div className="w-20 text-center">
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      patchUpdateHelpers.getPriorityColor(update.priority)
                    )}>
                      {update.priority}
                    </span>
                  </div>
                  
                  {/* Status */}
                  <div className="w-20 text-center">
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      update.published
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    )}>
                      {update.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  
                  {/* Date */}
                  <div className="w-24 text-right">
                    <span className="text-xs text-gray-500 dark:text-[#969696]">
                      {new Date(update.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Preview/Details */}
      <div className="w-[60%] flex-shrink-0 min-w-[350px] flex flex-col bg-gray-50 dark:bg-[#1e1e1e]">
        {/* Preview Header */}
        <div className="flex-shrink-0 h-10 bg-white dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center justify-between px-3">
          <span className="text-xs text-gray-700 dark:text-[#cccccc] uppercase tracking-wide">Preview</span>
          {selectedUpdate && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleEditClick(selectedUpdate)}
                disabled={processingAction !== null}
                className="h-6 px-2 text-xs text-gray-700 dark:text-[#cccccc] hover:bg-gray-100 dark:hover:bg-[#3c3c3c] rounded flex items-center gap-1 disabled:opacity-50"
              >
                {processingAction?.id === selectedUpdate.id && processingAction?.action === 'edit' ? (
                  <Spinner size="sm" className="h-3 w-3" />
                ) : (
                  <Edit className="h-3 w-3" />
                )}
                Edit
              </button>
              <button
                onClick={() => handleTogglePublished(selectedUpdate)}
                disabled={processingAction !== null}
                className="h-6 px-2 text-xs text-gray-700 dark:text-[#cccccc] hover:bg-gray-100 dark:hover:bg-[#3c3c3c] rounded flex items-center gap-1 disabled:opacity-50"
              >
                {processingAction?.id === selectedUpdate.id && processingAction?.action === 'publish' ? (
                  <Spinner size="sm" className="h-3 w-3" />
                ) : selectedUpdate.published ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
                {selectedUpdate.published ? 'Unpublish' : 'Publish'}
              </button>
              <button
                onClick={() => handleDeleteClick(selectedUpdate)}
                disabled={processingAction !== null}
                className="h-6 px-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex items-center gap-1 disabled:opacity-50"
              >
                {processingAction?.id === selectedUpdate.id && processingAction?.action === 'delete' ? (
                  <Spinner size="sm" className="h-3 w-3" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-[#1e1e1e] styled-scrollbar">
          {selectedUpdate ? (
            <div className="space-y-4">
              {/* Title & Meta */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedUpdate.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge className={patchUpdateHelpers.getPriorityColor(selectedUpdate.priority)}>
                    {patchUpdateHelpers.formatPriority(selectedUpdate.priority)}
                  </Badge>
                  {selectedUpdate.version && (
                    <Badge variant="secondary">v{selectedUpdate.version}</Badge>
                  )}
                  <Badge variant={selectedUpdate.published ? "default" : "secondary"}
                    className={selectedUpdate.published ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}>
                    {selectedUpdate.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>

              {/* Author & Date */}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-[#969696] border-b border-gray-200 dark:border-[#3c3c3c] pb-4">
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>{selectedUpdate.creator?.first_name} {selectedUpdate.creator?.last_name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(selectedUpdate.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-sm max-w-none text-gray-700 dark:text-[#cccccc]">
                <FormattedContent content={selectedUpdate.content} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-[#969696]">
              <ChevronRight className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Select an update to preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patch Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{updateToDelete?.title}"? This action cannot be undone.
              {updateToDelete?.published && (
                <span className="block mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    This patch update is currently published and visible to users.
                  </span>
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteLoading || (processingAction?.id === updateToDelete?.id && processingAction?.action === 'delete')}
            >
              {deleteLoading || (processingAction?.id === updateToDelete?.id && processingAction?.action === 'delete') ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
