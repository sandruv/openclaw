'use client'

import { useEffect } from 'react'
import { useDropdownStore } from '@/stores/useDropdownStore'

interface TasksNewLayoutProps {
  children: React.ReactNode
}

export default function TasksNewLayout({ children }: TasksNewLayoutProps) {
  const { fetchAllDropdowns } = useDropdownStore()

  useEffect(() => {
    fetchAllDropdowns()
  }, [fetchAllDropdowns])

  return <>{children}</>
}
