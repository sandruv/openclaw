'use client'

import { useParams } from 'next/navigation'
import { TasksNewShell } from '@/components/tasks-new/'

export default function TasksNewDetailPage() {
  const params = useParams()
  const taskId = params.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : undefined

  return <TasksNewShell selectedId={taskId} />
}
