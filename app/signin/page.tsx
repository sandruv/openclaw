'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/authService';
import { logger } from '@/lib/logger';
import { cn } from "@/lib/utils"
import { LoadingDots } from '@/components/custom/loading-dots';
import { AnimatedMicrosoftLogo } from '@/components/custom/animated-microsoft-logo';
import { getRedirectPathForRole } from '@/lib/auth';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams?.get('code');
  const [message, setMessage] = useState('Please wait');
  const [status, setStatus] = useState('loading'); // error, loading, success

  useEffect(() => {
    const handleSignIn = async () => {
      if (!code) {
        logger.error('Missing code parameter');
        setMessage('Something went wrong');
        setStatus('error');
        await new Promise(resolve => setTimeout(resolve, 3000))
        window.location.href = "/";
        return;
      }

      setStatus('loading');
      try {
        const response = await authService.handleMicrosoftCallback(code);
        
        if (response.message === "ok" && response.data?.userdata) {
          setMessage('Success');
          setStatus('success');
          
          // Get the appropriate redirect path based on user role
          const redirectPath = getRedirectPathForRole(response.data.userdata);
          
          logger.info('Microsoft sign-in successful, redirecting to:', redirectPath);
          
          // Wait briefly to show success message
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          // Direct redirect to role-based route
          // Using window.location.href ensures cookies/localStorage are properly set
          window.location.href = redirectPath+"?redirectpath="+redirectPath;
        } else {
          // Handle error response
          setMessage('Authentication failed');
          setStatus('error');
          logger.error('Microsoft callback failed:', response.message);
          
          await new Promise(resolve => setTimeout(resolve, 3000))
          window.location.href = "/";
        }
      } catch (error) {
        logger.error('Login error:', error);
        setMessage('Something went wrong');
        setStatus('error');
        
        await new Promise(resolve => setTimeout(resolve, 3000))
        window.location.href = "/";
      }
    };

    handleSignIn();
  }, [code]);

  const getLoaderColor = () => {
    switch (status) {
      case 'success':
        return 'text-white';
      case 'error':
        return 'text-white';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black transition-colors">
      <div className="flex flex-col items-center space-y-8">
        {/* Windows Logo */}
        <AnimatedMicrosoftLogo />
        {/* Message */}
        <div>
          <div className="flex items-end">
            
            <p className="text-black dark:text-white text-sm font-light tracking-wide">
              {message}
            </p>
            <LoadingDots className='translate-y-[-5px]'/>
          </div>
          
        </div>
        
      </div>
    </div>
  );
}
