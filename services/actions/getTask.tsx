'use server'

import { streamUI } from 'ai/rsc'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { TaskComponent } from '@/components/aisdk/ui-tools/TaskComponent'
import { Task } from '@/types/tasks'

// Mock task data for frontend prototype
const mockTask: Task = {
  id: 1,
  title: 'Sample Task',
  description: 'This is a mock task for prototype purposes.',
  active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as unknown as Task

const mockTasks: Task[] = [mockTask]

export async function getTask(prompt: string) {
  const result = await streamUI({
    model: openai('gpt-4o'),
    messages: [{ role: 'user', content: prompt }],
    text: ({ content }) => (
      <div className="text-sm text-muted-foreground">{content}</div>
    ),
    tools: {
      showLatestTask: {
        description: 'Show the most recent task',
        parameters: z.object({}),
        generate: async function* () {
          yield <div className="animate-pulse">Fetching latest task...</div>
          return <TaskComponent task={mockTask} />
        }
      },
      showTasksByPriority: {
        description: 'Show tasks with a specific priority level',
        parameters: z.object({
          priority: z.enum(['high', 'medium', 'low']).describe('Priority level of tasks to show')
        }),
        generate: async function* ({ priority }) {
          yield <div className="animate-pulse">Fetching {priority} priority tasks...</div>
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-bold capitalize">{priority} Priority Tasks</h2>
              {mockTasks.map(task => (
                <TaskComponent key={task.id} task={task} />
              ))}
            </div>
          )
        }
      },
      showTasksByStatus: {
        description: 'Show tasks filtered by status',
        parameters: z.object({
          status: z.enum(['open', 'in_progress', 'closed'])
        }),
        generate: async function* ({ status }) {
          yield <div className="animate-pulse">Fetching {status} tasks...</div>
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-bold capitalize">{status} Tasks</h2>
              {mockTasks.map(task => (
                <TaskComponent key={task.id} task={task} />
              ))}
            </div>
          )
        }
      },
      getTaskById: {
        description: 'Get a specific task by its ID',
        parameters: z.object({
          id: z.string().describe('The ID of the task to fetch')
        }),
        generate: async function* ({ id }) {
          yield <div className="animate-pulse">Fetching task #{id}...</div>
          return <TaskComponent task={mockTask} />
        }
      }
    }
  })

  return result.value
}
