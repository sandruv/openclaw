'use client'

import { useEffect } from 'react'
import { useTaskDetailsStore } from '@/stores/useTaskDetailsStore'
import { TaskDetails } from '@/components/task-details'
import { EmptyDetailsState } from '@/components/tasks-new/sections/EmptyDetailsState'
import { InvalidTaskState } from '@/components/tasks-new/sections/InvalidTaskState'
import { DetailsSkeleton } from '@/components/task-details/details/loaders/DetailsSkeleton'
import DetailsPage from '@/app/(auth)/tasks/[id]/details/page'
import ThreadPage from '@/app/(auth)/tasks/[id]/thread/page'
import KnowledgebasePage from '@/app/(auth)/tasks/[id]/knowledgebase/page'

interface TaskDetailsPanelProps {
  selectedId?: string
}

export function TaskDetailsPanel({ selectedId }: TaskDetailsPanelProps) {
  const { task, getTaskById, isLoading, error } = useTaskDetailsStore()

  useEffect(() => {
    if (selectedId) {
      getTaskById(selectedId)
    }
  }, [selectedId, getTaskById])

  if (!selectedId) {
    return <EmptyDetailsState />
  }

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-70px)]">
        <DetailsSkeleton />
      </div>
    )
  }

  if (!task && !isLoading) {
    return <InvalidTaskState />
  }

  if (!task) {
    return <EmptyDetailsState />
  }

  return (
    <TaskDetails
      taskId={selectedId}
      thread={<ThreadPage />}
      details={<DetailsPage />}
      knowledgebase={<KnowledgebasePage />}
    />
  )
}
