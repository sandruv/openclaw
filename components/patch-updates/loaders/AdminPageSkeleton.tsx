'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { PatchUpdateFormSkeleton } from './PatchUpdateSkeletons';

interface AdminPageSkeletonProps {
  className?: string;
}

export function AdminPageSkeleton({ className }: AdminPageSkeletonProps) {
  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Back button skeleton */}
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-6 w-32" />
      </div>
      <PatchUpdateFormSkeleton />
    </div>
  );
}
