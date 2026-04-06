'use client';

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSessionStore } from '@/stores/useSessionStore'
import { SystemInitializationPage } from '@/components/admin/pages/system-initialization'

export default function AdminSystemPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { isSuperAdmin } = useSessionStore();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // If user is not a super admin, redirect to /admin/patch
    if (user && !isSuperAdmin()) {
      router.replace('/admin/patch');
    }
  }, [user, isLoading, router, isSuperAdmin]);

  // Show loading or nothing while checking/redirecting for non-super admins
  if (isLoading || (user && !isSuperAdmin())) {
    return null;
  }

  return <SystemInitializationPage />
}