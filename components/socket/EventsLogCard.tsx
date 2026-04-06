'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function EventsLogCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Socket Events Log</CardTitle>
        <CardDescription>
          Open your browser console to see all socket events (F12 → Console)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          This page is listening for the following events:
        </p>
        <ul className="list-disc pl-5 mt-2 text-sm">
          <li>connect - When socket connection is established</li>
          <li>disconnect - When socket connection is lost</li>
          <li>notification - For system notifications</li>
          <li>message - For chat or general messages</li>
          <li>task:update - When a task is updated</li>
          <li>task:create - When a new task is created</li>
          <li>room:message - Messages sent to specific rooms</li>
        </ul>
        <p className="mt-4 text-sm">
          All events are logged to the console. Try sending different events and check the console output.
        </p>
        
      </CardContent>
    </Card>
  )
}
