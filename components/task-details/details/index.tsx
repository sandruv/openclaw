"use client"

import { MoreInfo } from "./sections/more-info"
import { EndUserInfo } from "./sections/enduser-info"
import { ActivityInfo } from "./sections/activity-info"
import { Timer } from "./sections/timer"
import { TaskViewersPusher } from "@/components/task-details/subcomponents/TaskViewersPusher"
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTaskDetailsStore } from "@/stores/useTaskDetailsStore"
import { DetailsSkeleton } from "./loaders/DetailsSkeleton"

export function TaskDetails() {
  const { task } = useTaskDetailsStore()

  if (!task) {
    return <DetailsSkeleton />
  }

  return (
    <div className="relative">
      {/* Task viewers toast at the top */}
      {task && <TaskViewersPusher taskId={task.id} />}
      
      <ScrollArea className="h-[calc(100vh-70px)]">
        <div className="">
          <div className="pt-4 px-4">  
            <Timer />
          </div>

          <Tabs defaultValue="taskinfo" className="mt-4">
            <TabsList className="grid w-full grid-cols-3 rounded-none px-3">
              <TabsTrigger value="taskinfo">Details</TabsTrigger>
              <TabsTrigger value="enduserinfo">End User</TabsTrigger>
              <TabsTrigger value="activityinfo">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="taskinfo">
              <MoreInfo />
            </TabsContent>
            <TabsContent value="enduserinfo">
              <EndUserInfo />
            </TabsContent>
            <TabsContent value="activityinfo">
              <ActivityInfo />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  )
}