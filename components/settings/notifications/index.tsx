'use client'

import { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export default function NotificationsSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [desktopNotifications, setDesktopNotifications] = useState(false)
  const [slackNotifications, setSlackNotifications] = useState(false)
  
  // Notification types
  const [newComments, setNewComments] = useState(true)
  const [mentions, setMentions] = useState(true)
  const [taskUpdates, setTaskUpdates] = useState(true)
  const [projectUpdates, setProjectUpdates] = useState(true)
  const [securityAlerts, setSecurityAlerts] = useState(true)

  return (
    <div className="grid grid-cols-[1fr,auto,1fr] gap-8 relative h-[calc(100vh-130px)] max-w-[1000px]">
      <div className="space-y-4 p-6">
        <h3 className="text-lg font-medium">Notification Channels</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="text-muted-foreground">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email (Not yet implemented)</p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
              disabled
              className="data-[state=checked]:bg-lime-600 opacity-50"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications" className="text-muted-foreground">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Get push notifications in your browser (Not yet implemented)</p>
            </div>
            <Switch
              id="push-notifications"
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
              disabled
              className="data-[state=checked]:bg-lime-600 opacity-50"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="desktop-notifications" className="text-muted-foreground">Desktop Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive desktop notifications when app is running (Not yet implemented)</p>
            </div>
            <Switch
              id="desktop-notifications"
              checked={desktopNotifications}
              onCheckedChange={setDesktopNotifications}
              disabled
              className="data-[state=checked]:bg-lime-600 opacity-50"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="slack-notifications" className="text-muted-foreground">Slack Integration</Label>
              <p className="text-sm text-muted-foreground">Send notifications to Slack (Not yet implemented)</p>
            </div>
            <Switch
              id="slack-notifications"
              checked={slackNotifications}
              onCheckedChange={setSlackNotifications}
              disabled
              className="data-[state=checked]:bg-lime-600 opacity-50"
            />
          </div>
        </div>
      </div>

      <Separator orientation="vertical" className="h-full min-h-[500px]" />

      <div className="space-y-4 p-6 pl-2">
        <h3 className="text-lg font-medium">Notification Types</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="comments" className="text-muted-foreground">Comments</Label>
              <p className="text-sm text-muted-foreground">Get notified when someone comments on your items (Not yet implemented)</p>
            </div>
            <Switch
              id="comments"
              checked={newComments}
              onCheckedChange={setNewComments}
              disabled
              className="data-[state=checked]:bg-lime-600 opacity-50"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mentions" className="text-muted-foreground">Mentions</Label>
              <p className="text-sm text-muted-foreground">Get notified when someone mentions you (Not yet implemented)</p>
            </div>
            <Switch
              id="mentions"
              checked={mentions}
              onCheckedChange={setMentions}
              disabled
              className="data-[state=checked]:bg-lime-600 opacity-50"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="task-updates" className="text-muted-foreground">Task Updates</Label>
              <p className="text-sm text-muted-foreground">Get notified about updates to your tasks (Not yet implemented)</p>
            </div>
            <Switch
              id="task-updates"
              checked={taskUpdates}
              onCheckedChange={setTaskUpdates}
              disabled
              className="data-[state=checked]:bg-lime-600 opacity-50"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="project-updates" className="text-muted-foreground">Project Updates</Label>
              <p className="text-sm text-muted-foreground">Get notified about major project changes (Not yet implemented)</p>
            </div>
            <Switch
              id="project-updates"
              checked={projectUpdates}
              onCheckedChange={setProjectUpdates}
              disabled
              className="data-[state=checked]:bg-lime-600 opacity-50"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="security-alerts" className="text-muted-foreground">Security Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified about security updates and alerts (Not yet implemented)</p>
            </div>
            <Switch
              id="security-alerts"
              checked={securityAlerts}
              onCheckedChange={setSecurityAlerts}
              disabled
              className="data-[state=checked]:bg-lime-600 opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
