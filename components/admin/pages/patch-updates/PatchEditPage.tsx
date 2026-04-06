'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PatchUpdateForm } from './PatchUpdateForm';
import { AdminPageSkeleton } from '../../../patch-updates/loaders/AdminPageSkeleton';
import { AdminBackButton } from './BackButton';
import { AdminErrorState } from './ErrorState';
import { usePatchUpdateStore } from '@/stores/usePatchUpdateStore';
import { UpdatePatchUpdateData } from '@/services/patchUpdateService';
import { useToast } from '@/components/ui/toast-provider';
import { FileEdit } from 'lucide-react';

interface AdminPatchEditPageProps {
  patchUpdateId: number;
}

export function AdminPatchEditPage({ patchUpdateId }: AdminPatchEditPageProps) {
  const router = useRouter();
  const { 
    currentUpdate, 
    loading, 
    error,
    fetchPatchUpdateById, 
    updatePatchUpdate, 
    updateLoading,
    clearCurrentUpdate 
  } = usePatchUpdateStore();
  const { showToast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch patch update on mount
  useEffect(() => {
    if (!isNaN(patchUpdateId)) {
      fetchPatchUpdateById(patchUpdateId);
    }

    // Cleanup on unmount
    return () => {
      clearCurrentUpdate();
    };
  }, [patchUpdateId, fetchPatchUpdateById, clearCurrentUpdate]);

  const handleSubmit = async (data: UpdatePatchUpdateData) => {
    setIsSubmitting(true);
    try {
      const result = await updatePatchUpdate(patchUpdateId, data);
      
      if (result) {
        showToast({
          type: 'success',
          title: 'Success',
          description: 'Patch update updated successfully!'
        });
        router.push('/admin/patch');
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          description: 'Failed to update patch update. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error updating patch update:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'An error occurred while updating the patch update.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/patch');
  };

  const handleBack = () => {
    router.push('/admin/patch');
  };

  const handleRetry = () => {
    if (!isNaN(patchUpdateId)) {
      fetchPatchUpdateById(patchUpdateId);
    }
  };

  // Loading state
  if (loading) {
    return <AdminPageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <AdminErrorState
        title="Failed to load patch update"
        description={error}
        icon="error"
        onRetry={handleRetry}
      />
    );
  }

  // Not found state
  if (!currentUpdate) {
    return (
      <AdminErrorState
        title="Patch update not found"
        description="The patch update you're looking for doesn't exist or has been deleted."
        icon="info"
      />
    );
  }

  // Invalid ID state
  if (isNaN(patchUpdateId)) {
    return (
      <AdminErrorState
        title="Invalid patch update ID"
        description="The patch update ID provided is not valid."
        icon="error"
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-[#1e1e1e]">
      {/* Toolbar */}
      <div className="flex-shrink-0 h-10 bg-white dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center px-3 gap-3">
        <AdminBackButton onClick={handleBack} />
        <div className="w-px h-5 bg-gray-300 dark:bg-[#3c3c3c]" />
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-[#cccccc]">
          <FileEdit className="h-4 w-4" />
          <span>Edit: {currentUpdate.title}</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <PatchUpdateForm
          mode="edit"
          initialData={currentUpdate}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={false}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
