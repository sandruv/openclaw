'use client'

import React, { useEffect, useRef } from 'react'
import { useParams, notFound } from 'next/navigation'
import { useTaskDetailsStore } from '@/stores/useTaskDetailsStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useAISdkStore } from '@/stores/useAISdkStore'
import { ThreadColumnSkeleton } from '@/components/task-details/thread/loaders/ThreadColumnSkeleton'
import { DetailsSkeleton } from '@/components/task-details/details/loaders/DetailsSkeleton'
import { KnowledgeBaseSkeleton } from '@/components/task-details/knowledgebase/loaders/KnowledgeBaseSkeleton'
import { logger } from "@/lib/logger"
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Maximize2, Minimize2 } from 'lucide-react'
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"
import { pusherClient } from '@/lib/pusher-client'
import { useToast } from '@/components/ui/toast-provider'

interface TaskDetailsProps {
  children?: React.ReactNode
  thread: React.ReactNode
  details: React.ReactNode
  knowledgebase: React.ReactNode
  taskId: string
}

export function TaskDetails({ 
  children, 
  thread, 
  details, 
  knowledgebase,
  taskId
}: TaskDetailsProps) {
  const { task, getTaskById, isLoading } = useTaskDetailsStore()
  const { compactMode, setCompactMode } = useSettingsStore()
  const { updateAnalysisIncremental, analysis } = useAISdkStore()
  const { showToast } = useToast()
  const channelRef = useRef<any>(null)

  useEffect(() => {
    const fetchTicket = async () => {
      if (!taskId) {
        logger.warn("[TaskDetails]: No taskId provided")
        return
      }
      
      const startTime = Date.now()
      logger.info("[TaskDetails]: Starting to fetch task with ID", taskId)
      
      try {
        const response = await getTaskById(taskId)
        const duration = Date.now() - startTime
        logger.info(`[TaskDetails]: Successfully fetched task ${taskId} in ${duration}ms`, response)
      } catch (error) {
        logger.error(`[TaskDetails]: Failed to fetch task ${taskId}`, error)
      }
    }

    fetchTicket()
    
    // Clean up any resources if component unmounts
    return () => {
      // Any cleanup code if needed
    }
  }, [taskId, getTaskById])

  // Listen for task updates from other clients using Pusher
  useEffect(() => {
    if (!taskId) return
    // Subscribe to Pusher channels for this task
    // Subscribe to both the general tasks channel and the specific task channel
    const tasksChannelName = 'tasks-channel';
    const taskSpecificChannelName = `task-${taskId}-channel`;
    const ticketChannelName = `ticket-${taskId}`;
     
    const tasksChannel = pusherClient.subscribe(tasksChannelName);
    const taskSpecificChannel = pusherClient.subscribe(taskSpecificChannelName);
    const ticketChannel = pusherClient.subscribe(ticketChannelName);
    
    // Store reference to the channels for cleanup
    channelRef.current = {
      tasksChannel,
      taskSpecificChannel,
      ticketChannel
    };
    
    // Listen for task update events from both channels
    // Pass isUpdate=true to skip skeleton loading for Pusher-triggered refreshes
    const handleTaskUpdate = async (data: any) => {
      // Only update if the event is for this task
      if (data.taskId === Number(taskId) || data.task?.id === Number(taskId)) {
        getTaskById(taskId, true);
        
        // Trigger incremental analysis update when a new activity is added
        // Only if analysis already exists (user has viewed AI tab before)
        const currentAnalysis = useAISdkStore.getState().analysis;
        if (data.action === 'activity_created' && currentAnalysis) {
          logger.info(`[TaskDetails] New activity detected, triggering incremental analysis for task #${taskId}`);
          try {
            await updateAnalysisIncremental(Number(taskId));
          } catch (error) {
            logger.error('[TaskDetails] Incremental analysis update failed:', error);
            showToast({
              title: 'Analysis update failed',
              description: 'Could not update AI analysis with new activity',
              type: 'warning'
            });
          }
        }
      } 
    };
    
    // Bind to events on both channels
    tasksChannel.bind('task:update', handleTaskUpdate);
    tasksChannel.bind('task:create', handleTaskUpdate);
    tasksChannel.bind('task:delete', handleTaskUpdate);
    tasksChannel.bind('tasks:update', handleTaskUpdate);
    
    // The task-specific channel will always be for this task
    taskSpecificChannel.bind('task:update', (data: any) => {
      getTaskById(taskId, true);
    });

    // Timer events are emitted on the ticket-{id} channel (manual stop, view-based timers, etc.)
    const handleTimerUpdate = (data: any) => {
      if (data?.ticketId === Number(taskId) || data?.taskId === Number(taskId)) {
        getTaskById(taskId, true);
      }
    };

    ticketChannel.bind('timer-update', handleTimerUpdate);
    ticketChannel.bind('ticket:timer', handleTimerUpdate);

    return () => {
      // Unbind all events and unsubscribe from channels
      tasksChannel.unbind('task:update', handleTaskUpdate);
      tasksChannel.unbind('task:create', handleTaskUpdate);
      tasksChannel.unbind('task:delete', handleTaskUpdate);
      tasksChannel.unbind('tasks:update', handleTaskUpdate);
      taskSpecificChannel.unbind_all();
      ticketChannel.unbind('timer-update', handleTimerUpdate);
      ticketChannel.unbind('ticket:timer', handleTimerUpdate);
      
      // Unsubscribe from channels
      pusherClient.unsubscribe(tasksChannelName);
      pusherClient.unsubscribe(taskSpecificChannelName);
      pusherClient.unsubscribe(ticketChannelName);
    };
  }, [taskId, getTaskById, updateAnalysisIncremental, showToast]);

  return (
    <div data-testid="task-details-page" className="w-full relative">
      <PanelGroup direction="horizontal" className="min-h-[calc(100vh-70px)]">
        <Panel key="thread" defaultSize={50} minSize={40}>
          {isLoading && !task ? 
            <ThreadColumnSkeleton /> : 
            React.cloneElement(thread as React.ReactElement, { compact: compactMode })
          }
        </Panel>

        <PanelResizeHandle key="thread-resize-handle" className="w-1.5 bg-border hover:bg-primary/50 transition-colors" />

        <Panel 
          key="knowledgebase"
          defaultSize={30} 
          minSize={20}
          collapsible
          collapsedSize={0.1}
          className="relative"
        >
          {isLoading && !task ? <KnowledgeBaseSkeleton /> : knowledgebase}
        </Panel>

        <PanelResizeHandle key="knowledgebase-resize-handle" className="w-1.5 bg-border hover:bg-primary/50 transition-colors" />

        <Panel 
          key="details"
          defaultSize={20} 
          minSize={15}
          collapsible
          collapsedSize={0.1}
          className={cn(
            "relative",
          )}
        >
          <div>
            {isLoading && !task ? 
              <DetailsSkeleton /> : 
              React.cloneElement(details as React.ReactElement, { compact: compactMode })
            }
          </div>
        </Panel>
      </PanelGroup>

      <div className="hidden">{children}</div>
    </div>
  )
}
