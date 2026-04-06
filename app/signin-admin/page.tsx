"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { TabSection } from '@/components/signin-admin/TabSection';
import { AdminSignIn } from '@/components/signin-admin/AdminSignIn';
import { ClientSignIn } from '@/components/signin-admin/ClientSignIn';

export default function ManualSignInPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Only redirect if already authenticated
    if (isAuthenticated && user) {
      // Redirect based on email domain
      const emailDomain = user.email?.split('@')[1];
      if (emailDomain === 'yanceyworks.com') {
        router.replace('/tasks');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, router, user]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl border-gray-100 dark:border-gray-700 border-2 transition-colors">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manual Sign In</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Access the system as an administrator or client</p>
        </div>
        
        <TabSection tabNames={["Sign in as Admin", "Sign in as Client"]}>
          <AdminSignIn />
          <ClientSignIn />
        </TabSection>
      </div>
    </div>
  );
}
