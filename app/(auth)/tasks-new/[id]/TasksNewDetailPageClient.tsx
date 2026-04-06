'use client'

import { TasksNewShell } from '@/components/tasks-new/'

interface TasksNewDetailPageClientProps {
  taskId: string
}

export default function TasksNewDetailPageClient({ taskId }: TasksNewDetailPageClientProps) {
  return <TasksNewShell selectedId={taskId} />
}
