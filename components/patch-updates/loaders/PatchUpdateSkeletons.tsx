'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

// Skeleton for individual patch update card
export function PatchUpdateCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <Card className="transition-all duration-200">
      <CardHeader className={compact ? 'pb-3' : 'pb-4'}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Priority Icon & Badge */}
            <div className="p-2 rounded-full">
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-16 rounded" /> {/* Priority badge */}
                <Skeleton className="h-5 w-12 rounded" /> {/* Version badge */}
              </div>
            </div>
          </div>

          {/* Actions skeleton */}
          <Skeleton className="h-8 w-24 rounded" />
        </div>
      </CardHeader>

      <CardContent className={compact ? 'pt-0' : ''}>
        {/* Title */}
        <Skeleton className={`mb-3 ${compact ? 'h-5' : 'h-6'}`} />

        {/* Content */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          {!compact && (
            <>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-4">
            {/* Author */}
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>

            {/* Date */}
            <div className="flex items-center space-x-1">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* Relative time */}
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton for patch update list
export function PatchUpdatesListSkeleton({ count = 3, header = false }: { count?: number, header?: boolean }) {
  return (
    <div className="space-y-6">
      {header && (
        <>  
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Filters skeleton */}
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton className="h-10 w-64" /> {/* Search */}
            <Skeleton className="h-10 w-32" /> {/* Priority filter */}
            <Skeleton className="h-10 w-32" /> {/* Status filter */}
            <Skeleton className="h-10 w-24" /> {/* Refresh button */}
          </div>
        </>
      )}

      {/* List items skeleton */}
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <PatchUpdateCardSkeleton key={i} />
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for admin patch updates list (table format)
export function AdminPatchUpdatesListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Table skeleton */}
      <div className="border rounded-lg">
        {/* Table header skeleton */}
        <div className="border-b p-4">
          <div className="grid grid-cols-7 gap-4">
            <Skeleton className="h-4 w-16" /> {/* Title */}
            <Skeleton className="h-4 w-16" /> {/* Priority */}
            <Skeleton className="h-4 w-16" /> {/* Version */}
            <Skeleton className="h-4 w-16" /> {/* Status */}
            <Skeleton className="h-4 w-16" /> {/* Author */}
            <Skeleton className="h-4 w-16" /> {/* Created */}
            <div className="flex justify-end">
              <Skeleton className="h-4 w-16" /> {/* Actions */}
            </div>
          </div>
        </div>

        {/* Table rows skeleton */}
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="border-b last:border-b-0 p-4">
            <div className="grid grid-cols-7 gap-4 items-center">
              {/* Title column */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              
              {/* Priority column */}
              <Skeleton className="h-5 w-16 rounded" />
              
              {/* Version column */}
              <Skeleton className="h-5 w-12 rounded" />
              
              {/* Status column */}
              <Skeleton className="h-5 w-20 rounded" />
              
              {/* Author column */}
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
              
              {/* Created column */}
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
              
              {/* Actions column */}
              <div className="flex justify-end space-x-2">
                <Skeleton className="h-8 w-8 rounded" /> {/* Edit button */}
                <Skeleton className="h-8 w-8 rounded" /> {/* Publish/Unpublish button */}
                <Skeleton className="h-8 w-8 rounded" /> {/* Delete button */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton for patch update dialog
export function PatchUpdateDialogSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="">
      {/* Dialog content skeleton */}
      <div className="max-h-96 overflow-y-auto styled-scrollbar p-5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i}>
            <div className="rounded-lg p-4 border border-[1px] border-gray-200 border-l-4 border-l-gray-300 mb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-3/4" /> {/* Title */}
                  <div className="flex items-center space-x-2 ml-3">
                    <Skeleton className="h-5 w-12 rounded" /> {/* Version badge */}
                    <Skeleton className="h-5 w-16 rounded" /> {/* Priority badge */}
                  </div>
                </div>
                <Skeleton className="h-3 w-24" /> {/* Date */}
              </div>
              
              <div className="text-sm space-y-2 pl-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" /> 
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between p-5 border-t">
        <div></div>
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

// Skeleton for empty state (when no updates found)
export function PatchUpdateEmptySkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-10 w-32 rounded" />
    </div>
  );
}

// Skeleton for stats cards
export function PatchUpdateStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Skeleton for patch update form
export function PatchUpdateFormSkeleton() {
  return (
    <div className="rounded-lg border-none">
      <div className="pb-20">
        {/* Header skeleton - matches actual form header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" /> {/* Title */}
            <Skeleton className="h-4 w-80" /> {/* Description */}
          </div>
          
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-24" /> {/* Preview button */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
          {/* Main content skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic info skeleton */}
            <div className="flex space-x-4">
              <div className="w-full space-y-2">
                <Skeleton className="h-4 w-16" /> {/* Title label */}
                <Skeleton className="h-10 w-full" /> {/* Title input */}
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" /> {/* Version label */}
                <Skeleton className="h-10 w-32" /> {/* Version input */}
              </div>
            </div>

            {/* Content editor skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-20" /> {/* Content label */}
              </CardHeader>
              <CardContent>
                {/* Toolbar skeleton */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
                  <div className="flex flex-wrap items-center gap-1">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-8 rounded" />
                    ))}
                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={`sep-${i}`} className="h-8 w-8 rounded" />
                    ))}
                  </div>
                </div>
                {/* Editor area skeleton */}
                <div className="min-h-[300px] prose prose-sm max-w-none dark:prose-invert space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-6">
            {/* Settings skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-20" /> {/* Settings title */}
              </CardHeader>
              <CardContent style={{ paddingTop: '0px' }}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" /> {/* Priority label */}
                    <Skeleton className="h-10 w-full" /> {/* Priority select */}
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" /> {/* Published label */}
                    <Skeleton className="h-6 w-12 rounded-full" /> {/* Published switch */}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-16" /> {/* Preview title */}
              </CardHeader>
              <CardContent style={{ paddingTop: '0px' }}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-16 rounded" /> {/* Priority badge */}
                    <Skeleton className="h-5 w-20 rounded" /> {/* Status badge */}
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" /> {/* Title preview */}
                    <Skeleton className="h-3 w-24" /> {/* Character count */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Fixed bottom actions skeleton */}
      <div className="fixed bottom-0 right-0 w-full bg-background border-t p-4 flex justify-end gap-4">
        <Skeleton className="h-10 w-20" /> {/* Cancel button */}
        <Skeleton className="h-10 w-48" /> {/* Submit button */}
      </div>
    </div>
  );
}

// Skeleton for individual loading states
export function PatchUpdateInlineSkeleton() {
  return (
    <div className="flex items-center space-x-2">
      <Skeleton className="h-4 w-4 rounded-full" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

// Skeleton for pagination
export function PatchUpdatePaginationSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-32" />
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  );
}
