'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface AdminBackButtonProps {
  className?: string;
  onClick?: () => void;
}

export function AdminBackButton({ className, onClick }: AdminBackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/admin/patch');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        h-8 px-3 text-sm rounded
        flex items-center gap-2
        text-gray-700 dark:text-[#cccccc]
        hover:bg-gray-100 dark:hover:bg-[#3c3c3c]
        border border-gray-200 dark:border-[#3c3c3c]
        bg-white dark:bg-[#252526]
        transition-colors
        ${className || ''}
      `}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      <span>Back to Updates</span>
    </button>
  );
}
