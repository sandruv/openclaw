'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleFormRowProps {
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function CollapsibleFormRow({ isExpanded, onToggle, children }: CollapsibleFormRowProps) {
  return (
    <div className="border-t-2 border-gray-300 dark:border-[#4c4c4c]">
      <button
        onClick={onToggle}
        className="w-full h-9 flex items-center px-3 text-sm text-gray-700 dark:text-[#cccccc] hover:bg-gray-100 dark:hover:bg-[#2a2d2e] transition-colors"
      >
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 mr-2" />
        ) : (
          <ChevronDown className="h-4 w-4 mr-2" />
        )}
        <span className="font-medium">Assign Admin Role</span>
      </button>

      {isExpanded && children}
    </div>
  );
}
