import { TaskComponent } from '@/components/aisdk/ui-tools/TaskComponent'
import { Task } from '@/types/tasks'

const mockTask: Task = {
  id: 1,
  title: 'Preview Task',
  description: 'Mock task data for frontend prototype preview.',
  active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as unknown as Task

const mockTasks: Task[] = [mockTask]

export async function getTask(prompt: string) {
  const text = prompt.toLowerCase()

  if (text.includes('latest') || text.includes('recent')) {
    return <TaskComponent task={mockTask} />
  }

  if (text.includes('priority') || text.includes('open') || text.includes('task')) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Preview Tasks</h2>
        {mockTasks.map((task) => (
          <TaskComponent key={task.id} task={task} />
        ))}
      </div>
    )
  }

  return (
    <div className="text-sm text-muted-foreground">
      Preview mode: no live AI or backend task lookup is connected yet.
    </div>
  )
}
