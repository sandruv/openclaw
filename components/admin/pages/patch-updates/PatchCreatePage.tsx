'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PatchUpdateForm } from './PatchUpdateForm';
import { AdminPageSkeleton } from '../../../patch-updates/loaders/AdminPageSkeleton';
import { AdminBackButton } from './BackButton';
import { usePatchUpdateStore } from '@/stores/usePatchUpdateStore';
import { CreatePatchUpdateData } from '@/services/patchUpdateService';
import { useToast } from '@/components/ui/toast-provider';
import { FilePlus } from 'lucide-react';

export function AdminPatchCreatePage() {
  const router = useRouter();
  const { createPatchUpdate, createLoading } = usePatchUpdateStore();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading for consistency
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (data: CreatePatchUpdateData) => {
    setIsSubmitting(true);
    try {
      const result = await createPatchUpdate(data);
      
      if (result) {
        showToast({
          type: 'success',
          title: 'Success',
          description: 'Patch update created successfully!'
        });
        router.push('/admin/patch');
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          description: 'Failed to create patch update. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error creating patch update:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'An error occurred while creating the patch update.'
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

  // Show skeleton loader during initial loading
  if (isLoading) {
    return <AdminPageSkeleton />;
  }

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-[#1e1e1e]">
      {/* Toolbar */}
      <div className="flex-shrink-0 h-10 bg-white dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center px-3 gap-3">
        <AdminBackButton onClick={handleBack} />
        <div className="w-px h-5 bg-gray-300 dark:bg-[#3c3c3c]" />
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-[#cccccc]">
          <FilePlus className="h-4 w-4" />
          <span>New Patch Update</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <PatchUpdateForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={false}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
