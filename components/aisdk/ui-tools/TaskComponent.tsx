import { Task } from '@/types/tasks'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'
import { format } from 'date-fns'

interface TaskComponentProps {
  task: Task
}

export function TaskComponent({ task }: TaskComponentProps) {
  const lastActivity = task.activities[0]
  const lastActionDate = lastActivity ? new Date(lastActivity.created_at) : null
  const createdDate = new Date(task.created_at)

  return (
    <Card className="w-full">
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">#{task.id}</Badge>
              <p className="font-medium text-sm line-clamp-2">{task.summary}</p>
            </div>
            <Badge 
                variant="secondary" 
                className="text-xs"
            >
                {task.status.name}
            </Badge>
            <Badge 
                variant="secondary" 
                className="text-xs"
            >
                {task.priority.name}
            </Badge>
            <Badge 
                variant="secondary" 
                className="text-xs"
            >
                {task.ticket_type.name}
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            type="button"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pl-6 border-t">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1">Client</span>
            <span className="text-sm font-medium truncate">{task.client.name}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1">Created</span>
            <span className="text-sm">{format(createdDate, 'MMM d, yyyy')}</span>
          </div>
          {lastActionDate && (
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">Last Action</span>
              <span className="text-sm">{format(lastActionDate, 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}