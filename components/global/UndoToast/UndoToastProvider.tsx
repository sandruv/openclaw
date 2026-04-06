'use client'

import { useGlobalStore } from '@/stores/useGlobalStore'
import { UndoToast } from '.'

export function UndoToastProvider() {
  const { isVisible, message, undoAction, hideUndoToast } = useGlobalStore()

  return (
    <UndoToast
      message={message}
      isVisible={isVisible}
      onClose={hideUndoToast}
      onUndo={undoAction}
      duration={5000}
    />
  )
}
