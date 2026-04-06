"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/stores/useSessionStore';
import { logger } from '@/lib/logger';
import { Loader2 } from "lucide-react";
import Image from "next/image";

// Simple interface for user data returned from API
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  client?: {
    name: string;
  };
}

export const ClientSignIn = () => {
  const router = useRouter();
  const [status, setStatus] = useState<'initial' | 'loading' | 'success' | 'error'>('initial');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  
  // Set mounted state to true when component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const signInAsClient = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password');
      setStatus('error');
      return;
    }

    // Make sure it's not a yanceyworks.com email
    if (email.toLowerCase().endsWith('@yanceyworks.com')) {
      setErrorMessage('Please use the Admin sign-in tab for Yanceyworks email addresses');
      setStatus('error');
      return;
    }

    try {
      setStatus('loading');
      
      // First verify password using admin sign-in API
      const adminVerifyResponse = await fetch('/api/auth/signin-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const adminResult = await adminVerifyResponse.json();
      
      if (adminResult.status !== 200) {
        setStatus('error');
        setErrorMessage('Invalid password');
        return;
      }

      // Create a session for the user with the provided email
      const clientSignInResponse = await fetch('/api/auth/signin-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email,
          adminVerified: true, // Password was already verified
        }),
      });

      const clientResult = await clientSignInResponse.json();

      if (clientResult.status !== 200 || !clientResult.data) {
        setStatus('error');
        setErrorMessage(clientResult.message || 'Failed to sign in as client');
        return;
      }

      const { session, userdata } = clientResult.data;

      // Store user data in localStorage and session store
      if (typeof window !== 'undefined') {
        localStorage.setItem('ywp_token', session.token);
        localStorage.setItem('ywp_user', JSON.stringify(userdata));
      }
      useSessionStore.getState().setUser(userdata);
      useSessionStore.getState().setToken(session.token);

      logger.debug('Client sign-in successful:', userdata);
      
      setStatus('success');
      
      // Wait for cookies to be set and session to be ready before redirecting
      // This prevents race condition in production where AuthContext hasn't initialized yet
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Force a hard navigation to ensure AuthContext picks up the new session
      window.location.href = '/';
    } catch (error) {
      console.error('Client sign-in error:', error);
      setStatus('error');
      setErrorMessage('An unexpected error occurred');
    }
  };

  const handleTryAgain = () => {
    setStatus('initial');
    setErrorMessage('');
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
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">Redirecting to dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {status === 'error' && (
        <div className="">
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Sign in failed</p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={handleTryAgain}
              className="ml-auto flex-shrink-0 bg-red-100 dark:bg-red-800/30 hover:bg-red-200 dark:hover:bg-red-700/40 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      {/* Form inputs - always visible but disabled during non-initial states */}
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-colors"
            placeholder="Enter your email"
            required
            disabled={status !== 'initial'}
          />
          <p className="text-xs text-gray-500 mt-1">Non-yanceyworks.com email addresses only</p>
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-colors"
            placeholder="Enter your password"
            required
            disabled={status !== 'initial'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && password.trim() && email.trim() && status === 'initial') {
                signInAsClient();
              }
            }}
          />
        </div>
        
        {/* Sign-in button - separate from inputs */}
        <div className="pt-2">
          <button
            onClick={signInAsClient}
            disabled={!password.trim() || !email.trim() || status !== 'initial'}
            className="w-full px-4 py-2 bg-lime-500 text-white rounded-md hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <div className="flex items-center justify-center w-full">
              <span>Sign in as Client</span>
              {status === 'loading' && (
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              )}
            </div>
          </button>
        </div>
      </div>
      
    </div>
  );
};
