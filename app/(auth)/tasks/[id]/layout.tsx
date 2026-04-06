'use client'

import { useParams } from 'next/navigation'
import { TaskDetails } from '@/components/task-details'
import DetailsPage from './details/page'
import ThreadPage from './thread/page'
import KnowledgebasePage from './knowledgebase/page'

export default function TaskLayout({ children }: {
  children: React.ReactNode
}) {
  const params = useParams()
  
  // Ensure taskId is always a string
  const taskId = params.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : ''
  
  // Don't render the component if we don't have a valid taskId
  if (!taskId) {
    return null;
  }
  
  return (
    <TaskDetails
      thread={<ThreadPage />}
      details={ <DetailsPage />}
      knowledgebase={<KnowledgebasePage />}
      taskId={taskId}
    >
      {children}
    </TaskDetails>
  )
}