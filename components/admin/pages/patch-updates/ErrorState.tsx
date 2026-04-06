'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle, AlertTriangle, Info, RefreshCw, ArrowLeft } from 'lucide-react';
import { AdminBackButton } from './BackButton';

interface AdminErrorStateProps {
  title: string;
  description: string;
  icon?: 'error' | 'warning' | 'info';
  className?: string;
  onRetry?: () => void;
  showBackButton?: boolean;
}

export function AdminErrorState({ 
  title, 
  description, 
  icon = 'error',
  className,
  onRetry,
  showBackButton = true
}: AdminErrorStateProps) {
  const router = useRouter();

  const getIconElement = () => {
    switch (icon) {
      case 'error':
        return <AlertCircle className="h-10 w-10 text-red-500 dark:text-[#f48771]" />;
      case 'warning':
        return <AlertTriangle className="h-10 w-10 text-yellow-500 dark:text-[#cca700]" />;
      case 'info':
        return <Info className="h-10 w-10 text-gray-400 dark:text-[#969696]" />;
      default:
        return <AlertCircle className="h-10 w-10 text-red-500 dark:text-[#f48771]" />;
    }
  };

  const getBgColor = () => {
    switch (icon) {
      case 'error':
        return 'bg-red-50 dark:bg-[#5a1d1d]/30 border-red-200 dark:border-[#be1100]/50';
      case 'warning':
        return 'bg-yellow-50 dark:bg-[#5a4a00]/30 border-yellow-200 dark:border-[#cca700]/50';
      case 'info':
        return 'bg-gray-50 dark:bg-[#252526] border-gray-200 dark:border-[#3c3c3c]';
      default:
        return 'bg-red-50 dark:bg-[#5a1d1d]/30 border-red-200 dark:border-[#be1100]/50';
    }
  };

  return (
    <div className={`h-full flex flex-col bg-gray-100 dark:bg-[#1e1e1e] ${className || ''}`}>
      {/* Toolbar */}
      <div className="flex-shrink-0 h-10 bg-white dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center px-3">
        {showBackButton && <AdminBackButton />}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className={`max-w-md w-full p-6 rounded-lg border ${getBgColor()}`}>
          <div className="flex flex-col items-center text-center">
            {getIconElement()}
            
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-[#969696]">
              {description}
            </p>
            
            <div className="mt-6 flex items-center gap-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="h-8 px-4 text-sm rounded flex items-center gap-2 text-gray-700 dark:text-[#cccccc] hover:bg-gray-100 dark:hover:bg-[#3c3c3c] border border-gray-200 dark:border-[#3c3c3c] bg-white dark:bg-[#252526] transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try Again
                </button>
              )}
              <button
                onClick={() => router.push('/admin/patch')}
                className="h-8 px-4 text-sm rounded flex items-center gap-2 text-gray-700 dark:text-[#cccccc] hover:bg-gray-100 dark:hover:bg-[#3c3c3c] border border-gray-200 dark:border-[#3c3c3c] bg-white dark:bg-[#252526] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Updates
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
