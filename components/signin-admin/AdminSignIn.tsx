"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/stores/useSessionStore';
import { logger } from '@/lib/logger';
import { Loader2 } from "lucide-react";
import Image from "next/image";

export const AdminSignIn = () => {
  const router = useRouter();
  const [status, setStatus] = useState<'initial' | 'loading' | 'success' | 'error'>('initial');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  
  // Set mounted state to true when component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const signInAsAdmin = async () => {
    try {
      setStatus('loading');
      
      // Call the admin sign-in API
      const response = await fetch('/api/auth/signin-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (result.status !== 200 || !result.data) {
        setStatus('error');
        setErrorMessage(result.message || 'Failed to sign in as admin');
        return;
      }

      const { session, userdata } = result.data;

      // Store user data in localStorage and session store
      if (typeof window !== 'undefined') {
        localStorage.setItem('ywp_token', session.token);
        localStorage.setItem('ywp_user', JSON.stringify(userdata));
      }
      useSessionStore.getState().setUser(userdata);
      useSessionStore.getState().setToken(session.token);

      logger.debug('Admin sign-in successful:', userdata);
      
      setStatus('success');
      
      // Wait for cookies to be set and session to be ready before redirecting
      // This prevents race condition in production where AuthContext hasn't initialized yet
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Force a hard navigation to ensure AuthContext picks up the new session
      window.location.href = '/tasks';
    } catch (error) {
      console.error('Admin sign-in error:', error);
      setStatus('error');
      setErrorMessage('An unexpected error occurred');
    }
  };

  return (
    <div className="space-y-4">

      {status === 'success' && (
        <div className="">
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-400 p-4 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Sign in successful!</p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">Redirecting to tasks...</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {status === 'error' && (
        <div data-testid="error-message">
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Sign in failed</p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">{errorMessage}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setStatus('initial');
                setErrorMessage('');
              }}
              className="mt-3 w-full px-4 py-2 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 text-sm rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-0 dark:focus:ring-red-400 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Form inputs - always visible but disabled during non-initial states */}
      <form data-testid="admin-signin-form" onSubmit={(e) => {
        e.preventDefault();
        if (password.trim() && status === 'initial') {
          signInAsAdmin();
        }
      }} className="space-y-4">
        <div>
          <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Password</label>
          <input
            type="password"
            id="admin-password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-lime-500 dark:focus:ring-lime-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${status !== 'initial' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            placeholder="Enter Admin Password"
            disabled={status !== 'initial'}
            autoComplete="current-password"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Yanceyworks administrator access</p>
        </div>

        {/* Sign-in button - separate from input */}
        <div className="pt-2">
          <button
            type="submit"
            data-testid="admin-signin-button"
            disabled={!password.trim() || status !== 'initial'}
            className="w-full px-4 py-2 bg-lime-500 dark:bg-lime-600 text-white rounded-md hover:bg-lime-600 dark:hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-500 dark:focus:ring-lime-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <div className="flex items-center justify-center w-full">
              <span>Sign in as Admin</span>
              {status === 'loading' && (
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              )}
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};
