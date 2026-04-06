import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react'

interface TicketProps {
  id: number
  title: string
  status: string
  priority: string
  created_at: string
}

export function SimpleTaskComponent({ title, status, priority, created_at }: TicketProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        <Badge 
          variant={priority === 'high' ? 'destructive' : 'secondary'}
          className="capitalize"
        >
          {priority}
        </Badge>
      </CardHeader>
      <CardContent className="flex gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <CalendarIcon className="h-4 w-4" />
          {new Date(created_at).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1">
          {status === 'closed' ? (
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircleIcon className="h-4 w-4 text-orange-500" />
          )}
          <span className="capitalize">{status}</span>
        </div>
      </CardContent>
    </Card>
  )
}