'use client'

import { useDragLayer, XYCoord } from 'react-dnd'
import { useKanbanStore } from '@/stores/useKanbanStore'
import { CompactCard } from './KanbanCard/CompactCard'
import { ExpandedCard } from './KanbanCard/ExpandedCard'
import { useSettingsStore } from '@/stores/useSettingsStore'

const layerStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  transform: 'rotate(1.5deg)'
}

function getItemStyles(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none'
    }
  }

  const { x, y } = currentOffset

  const transform = `translate(${x}px, ${y}px)`
  return {
    transform,
    WebkitTransform: transform,
    width: '320px', // Match the width of your cards
  }
}

export function CustomDragLayer() {
  const { compactMode } = useSettingsStore()
  const { isDragging, draggedTask } = useKanbanStore()
  
  const {
    itemType,
    initialOffset,
    currentOffset,
  } = useDragLayer((monitor) => ({
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }))

  // Only render when dragging a card
  if (!isDragging || itemType !== 'KANBAN_CARD' || !draggedTask) {
    return null
  }

  // Render a preview of the dragged card
  return (
    <div style={layerStyles}>
      <div 
        className="shadow-xl"
        style={getItemStyles(initialOffset, currentOffset)}
      >
        {compactMode ? (
          <CompactCard 
            task={draggedTask}
            onClick={() => {}} // No-op function since this is just a preview
          />
        ) : (
          <ExpandedCard 
            task={draggedTask}
            onClick={() => {}} // No-op function since this is just a preview
          />
        )}
      </div>
    </div>
  )
}
