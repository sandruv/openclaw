'use client';

export function ListHeader() {
  return (
    <div className="h-8 flex items-center px-3 bg-gray-50 dark:bg-[#252526] text-xs text-gray-500 dark:text-[#969696] uppercase tracking-wide sticky top-0">
      <span className="w-12">ID</span>
      <span className="flex-1">Name</span>
      <span className="w-48 truncate">Email</span>
      <span className="w-24 text-center">Role</span>
    </div>
  );
}
