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
      thread={<ThreadPage params={Promise.resolve({ id: taskId })} />}
      details={<DetailsPage params={Promise.resolve({ id: taskId })} />}
      knowledgebase={<KnowledgebasePage params={Promise.resolve({ id: taskId })} />}
      taskId={taskId}
    >
      {children}
    </TaskDetails>
  )
}