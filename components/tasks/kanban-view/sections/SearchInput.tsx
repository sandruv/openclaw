'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useState, useRef, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { useTasksStore } from '@/stores/useTasksStore'

interface SearchInputProps {
  search: string
  setSearch: (value: string) => void
  viewType: 'status' | 'assignee' | 'client'
}

export function SearchInput({ search, setSearch, viewType }: SearchInputProps) {
  const { isLoading } = useTasksStore()
  const [inputValue, setInputValue] = useState(search)
  // Get placeholder text based on view type
  const getPlaceholder = () => {
    switch (viewType) {
      case 'status':
        return 'Search by task name or status...'
      case 'assignee':
        return 'Search by task name or assignee...'
      case 'client':
        return 'Search by task name or client...'
      default:
        return 'Search tasks...'
    }
  }

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Clear search on Escape key
    if (e.key === 'Escape') {
      setSearch('')
    }
  }

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        setSearch(value);
      }, 500);
    },
    [setSearch]
  );

  return (
    <div className="flex items-center relative">
      <Input
        placeholder={getPlaceholder()}
        value={inputValue}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
        className="w-64"
        autoComplete="off"
        disabled={isLoading}
      />

      {isLoading && (
        <div className="absolute right-2">
          <Loader2 className="animate-spin" />
        </div>
      )}
    </div>
  )
}
