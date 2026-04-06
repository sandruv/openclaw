'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useKanbanStore } from '@/stores/useKanbanStore'
import { KanbanCardProps, DragItem } from '@/types/kanban'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { CompactCard } from './CompactCard'
import { ExpandedCard } from './ExpandedCard'
import { KanbanCardHoverMenu } from './KanbanCardHoverMenu'
import { throttle } from 'lodash'
import { useRouter } from 'next/navigation'
import { useLoader } from '@/contexts/LoaderContext'

export function KanbanCard({ task, index, columnId, activeSeconds }: KanbanCardProps) {
  
  const router = useRouter()
  const { setIsLoading: setRouteLoading } = useLoader()
  const [showMenu, setShowMenu] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 200, y: 200 })
  
  const goToTaskDetails = () => {
    setRouteLoading(true) // Show loader immediately
    router.push(`/tasks/${task.id}`)
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    })
    setShouldRender(true)
    // Small delay to ensure element is rendered before animation
    setTimeout(() => setShowMenu(true), 100)
  }

  const handleMouseLeave = () => {
    setShowMenu(false)
    // Keep rendered during fade-out animation
    setTimeout(() => setShouldRender(false), 300)
  }
  // Get Kanban store actions
  const startDrag = useKanbanStore(state => state.startDrag)
  const updateDragPosition = useKanbanStore(state => state.updateDragPosition)
  const endDrag = useKanbanStore(state => state.endDrag)
  const cancelDrag = useKanbanStore(state => state.cancelDrag)
  const draggedTask = useKanbanStore(state => state.draggedTask)
  const isTaskLoading = useKanbanStore(state => state.isTaskLoading)
  const { compactMode } = useSettingsStore()
  
  // Ref for the card element
  const ref = useRef<HTMLDivElement | null>(null)
  const throttledUpdatePosition = useCallback(() => {
    // Create the throttled function
    const throttledFn = throttle((colId: number, idx: number) => {
      updateDragPosition(colId, idx)
    }, 10)
    
    // Return both the function and its cancel method
    return {
      fn: throttledFn,
      cancel: throttledFn.cancel
    }
  }, [updateDragPosition])()

  // Cleanup throttled function on unmount
  useEffect(() => {
    return () => {
      if (throttledUpdatePosition && throttledUpdatePosition.cancel) {
        throttledUpdatePosition.cancel()
      }
    }
  }, [throttledUpdatePosition])
  
  // Set up drag source with custom preview
  const [{ isDraggingThis }, drag, preview] = useDrag<DragItem, unknown, { isDraggingThis: boolean }>({
    type: 'KANBAN_CARD',
    item: () => {
      startDrag(task, Number(columnId), index)
      return { id: task.id.toString(), index, columnId: Number(columnId), type: 'KANBAN_CARD' }
    },
    end: (item, monitor) => {
      if (!monitor.didDrop()) {
        // If the drag was cancelled
        cancelDrag()
        return
      }
      
      // The drop was handled by the drop target
      endDrag()
    },
    collect: (monitor) => ({
      isDraggingThis: monitor.isDragging(),
    }),
  })
  
  // Set up drop target
  const [{ isOver, canDrop }, drop] = useDrop<DragItem, unknown, { isOver: boolean, canDrop: boolean }>({
    accept: 'KANBAN_CARD',
    canDrop: (item) => {
      // Allow dropping on itself - this makes the UX more intuitive
      return true
    },
    hover: (item, monitor) => {
      if (!ref.current) {
        return
      }   
      // Use throttled update to reduce performance impact
      if (throttledUpdatePosition && throttledUpdatePosition.fn) {
        throttledUpdatePosition.fn(Number(columnId), index)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })
  
  // Initialize drag and drop refs
  drag(drop(ref))
  
  // Use the empty image as preview to hide default drag preview
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])
  
  // Apply styles based on drag state
  const cardStyle = cn(
    "rounded-lg",
    isDraggingThis && "opacity-0", // Make the original card invisible while dragging
    isOver && canDrop && "ring-2 ring-green-500",
    draggedTask && draggedTask.id === task.id && "ring-2 ring-green-500 ring-opacity-90 shadow-lg"
  )

  return (
    <>
      <div 
        className={cn("py-1 px-2")} 
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={cn(isDraggingThis && "border-2 border-gray-400 border-dashed rounded-lg")}>
          <div className={cardStyle}>
            {compactMode ? (
              <CompactCard 
                task={task}
                onClick={goToTaskDetails}
                isProcessing={isTaskLoading(task.id.toString())}
                activeSeconds={activeSeconds}
              />
            ) : (
              <ExpandedCard 
                task={task}
                onClick={goToTaskDetails}
                isProcessing={isTaskLoading(task.id.toString())}
                activeSeconds={activeSeconds}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Hover Menu */}
      {shouldRender && (
        <KanbanCardHoverMenu 
          task={task}
          isVisible={showMenu && !isDraggingThis}
          position={menuPosition}
        />
      )}
    </>
  )
}