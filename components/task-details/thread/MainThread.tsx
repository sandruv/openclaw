'use client'

import { useState } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTaskDetailsStore } from "@/stores/useTaskDetailsStore"
import { Header as TaskHeader } from './sections/Header'
import { Thread as ActivityThread } from './sections/ThreadBubble'
import { VipButton } from './sections/VipButton'
import { ButtonsForms, FormType } from './sections/ButtonsForms'
import { EmailForm } from './forms/EmailForm'
import { PrivateNoteForm } from './forms/PrivateForm'
import { ReassignForm } from './forms/ReassignForm'
import { ResolveTaskForm } from './forms/ResolveForm'
import { MergeTasksDialog } from './forms/dialogs/MergeTasksDialog'
import { ChatSmsForm } from './forms/ChatSmsForm'
import { ThreadColumnSkeleton } from './loaders/ThreadColumnSkeleton'
import { ThreadSkeleton } from './loaders/ThreadSkeleton'
import { Task, TaskAction } from '@/types/tasks'
import { useTaskSelectionStore } from '@/stores/useTaskSelectionStore'

export function MainThread() {
  const { task, isLoading, currentAction, setCurrentAction, isNavigating } = useTaskDetailsStore()
  const [activeForm, setActiveForm] = useState<FormType>(null)
  const [isFormCollapsed, setIsFormCollapsed] = useState(true)
  const { clearSelection } = useTaskSelectionStore()
  
  if (!task) {
    return <ThreadColumnSkeleton />
  }

  const closeForm = () => {
    setActiveForm(null)
    clearSelection()
  }

  function handleActionChange(action: TaskAction) {
    setCurrentAction(action)
  }

  const handleChatSmsSubmit = (data: { message: string; isChat: boolean; phoneNumber: string }) => {
    // TODO: Handle chat/sms submission
    console.log('Chat/SMS Form submitted:', data)
  }

  return (
    <div>
      <div className="border-b p-4">
        <div className="grid grid-cols-6">
          <div className="col-span-5">
            <ButtonsForms onFormChange={setActiveForm} activeForm={activeForm} />
          </div>
          <div className="col-span-1 flex justify-end">
            {task.client && (
              <VipButton client={{
                ...task.client, 
                is_client_vip: task.client.is_client_vip ?? false,
                user: task.user
              }} />
            )}
          </div>
        </div>

        <TaskHeader />
      </div>

      <div className="flex flex-col bg-gray-100 dark:bg-black/90 h-[calc(100vh-230px)]">
        {activeForm && activeForm !== 'merge' && (
          <div className="border-b bg-white dark:bg-black/90 p-4 max-h-[50%] overflow-auto styled-scrollbar shrink-0">
            {activeForm === 'email' && <EmailForm onClose={closeForm} />}
            {activeForm === 'privateNote' && <PrivateNoteForm onClose={closeForm} />}
            {activeForm === 'reassign' && <ReassignForm onClose={closeForm} />}
            {activeForm === 'resolve' && <ResolveTaskForm onClose={closeForm} />}
          </div>
        )}

        <ScrollArea className="px-2 flex-1 min-h-0">
          {isNavigating ? <ThreadSkeleton /> : <ActivityThread />}
        </ScrollArea>
        
        {activeForm === 'merge' && (
          <MergeTasksDialog
            isOpen={activeForm === 'merge'}
            onClose={closeForm}
            onSuccess={() => {
              // Refresh task data after successful merge
              if (task) {
                useTaskDetailsStore.getState().getTaskById(task.id.toString())
              }
            }}
            currentTaskId={task?.id || 0}
          />
        )}

        {/* <ChatSmsForm 
          onSubmit={handleChatSmsSubmit}
          isCollapsed={isFormCollapsed}
          onCollapsedChange={setIsFormCollapsed}
        /> */}
      </div>
    </div>
  )
}