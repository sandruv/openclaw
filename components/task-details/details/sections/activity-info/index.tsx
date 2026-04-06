'use client'

import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Mail, User, FileText, PauseCircle, Ticket, Paperclip } from "lucide-react"
import { useTaskDetailsStore } from "@/stores/useTaskDetailsStore"
import { TaskActivity } from "@/types/tasks"
import { useSettingsStore } from "@/stores/useSettingsStore"

// Interface for parsed email data
interface EmailData {
  to?: string[];
  cc?: string[];
}

export function ActivityInfo() {
  const { task } = useTaskDetailsStore()
  const [displayedActivities, setDisplayedActivities] = useState<TaskActivity[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 10
  const { compactMode } = useSettingsStore()

  useEffect(() => {
    if (task?.activities) {
      const start = 0
      const end = page * PAGE_SIZE
      const slicedActivities = task.activities.slice(start, end)
      setDisplayedActivities(slicedActivities)
      setHasMore(end < task.activities.length)
    }
  }, [task?.activities, page])

  const loadMore = () => {
    setPage(prev => prev + 1)
  }

  const getIcon = (type: TaskActivity['activity_type']['name']) => {
    switch (type) {
      case "Time":
        return <Clock className="h-4 w-4" />
      case "Email":
      case "User Email":
        return <Mail className="h-4 w-4" />
      case "Open":
      case "Response":
        return <User className="h-4 w-4" />
      case "Note":
        return <FileText className="h-4 w-4" />
      case "Hold":
        return <PauseCircle className="h-4 w-4" />
      default:
        return <Ticket className="h-4 w-4" />
    }
  }

  // Extract email data from activity content
  const extractEmailData = (activity: TaskActivity): EmailData => {
    // Check if email_to and email_cc properties exist directly on the activity object
    if ('email_to' in activity || 'email_cc' in activity) {
      const to = parseEmailField(activity.email_to);
      const cc = parseEmailField(activity.email_cc);
      return { to, cc };
    }
    
    return { to: [], cc: [] };
  }

  // Helper function to parse email fields which could be in various formats
  const parseEmailField = (field: any): string[] => {
    if (!field) return [];
    
    // If it's already an array, return it
    if (Array.isArray(field)) return field;
    
    // If it's a string that looks like JSON, try to parse it
    if (typeof field === 'string' && (field.startsWith('[') || field.startsWith('{'))) {
      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) return parsed;
        if (parsed.email_to) return Array.isArray(parsed.email_to) ? parsed.email_to : [parsed.email_to];
        if (parsed.email_cc) return Array.isArray(parsed.email_cc) ? parsed.email_cc : [parsed.email_cc];
        return [];
      } catch (e) {
        // If parsing fails, treat it as a single email
        return [field];
      }
    }
    
    // If it's a simple string, treat it as a single email
    if (typeof field === 'string') return [field];
    
    return [];
  }

  // Format email addresses for display
  const formatEmails = (emails: string[]): string => {
    if (!emails || !emails.length) return '';
    return emails.join(", ");
  }

  if (!task) {
    return null
  }

  return (
    <div>
      <button className="flex items-center justify-between w-full text-left px-4">
        <h2 className="text-base font-medium my-3">Activities</h2>
      </button>

      <ScrollArea className="h-[calc(100vh-465px)] px-4 pb-2 border-b">
        <ul className="space-y-4">
          {displayedActivities.map((activity, index) => {
            const isEmailActivity = activity.activity_type.name === "Email" || activity.activity_type.name === "User Email";
            const emailData = isEmailActivity ? extractEmailData(activity) : { to: [], cc: [] };
            const attachmentsCount = activity.files?.length || 0;
            
            return (
              <li key={activity.id || index} className="flex items-start space-x-2">
                <div className="mt-0.5 text-muted-foreground">
                  {getIcon(activity.activity_type.name)}
                </div>
                <div className="w-full">
                  <p className="text-xs">{activity.activity_type.name}</p>
                  <p className="text-xs text-muted-foreground">{activity.created_at}</p>
                  
                  {isEmailActivity && (
                    <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                      {emailData.to && emailData.to.length > 0 && (
                        <p className="text-xs">
                          <span className="font-semibold">To:</span> {formatEmails(emailData.to)}
                        </p>
                      )}
                      
                      {emailData.cc && emailData.cc.length > 0 && (
                        <p className="text-xs">
                          <span className="font-semibold">Cc:</span> {formatEmails(emailData.cc)}
                        </p>
                      )}
                      
                      {attachmentsCount > 0 && (
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="text-xs flex items-center gap-1 text-muted-foreground">
                            <Paperclip className="h-3 w-3" />
                            Attachments: ({attachmentsCount})
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {hasMore && (
          <div className={`${compactMode ? 'pt-2' : 'pt-4'} text-center`}>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMore}
              className={compactMode ? 'text-xs h-7 py-0' : ''}
            >
              {compactMode ? "More" : "Load More"}
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}