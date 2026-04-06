import { create } from 'zustand'

interface ToastState {
  isVisible: boolean
  message: string
  undoAction: (() => void) | undefined
  showUndoToast: (message: string, undoAction?: () => void) => void
  hideUndoToast: () => void
}

export const useGlobalStore = create<ToastState>((set) => ({
  isVisible: false,
  message: '',
  undoAction: undefined,
  
  showUndoToast: (message: string, undoAction?: () => void) => {
    set({ 
      isVisible: true, 
      message,
      undoAction
    })
  },
  
  hideUndoToast: () => {
    set({ 
      isVisible: false,
      undoAction: undefined
    })
  }
}))
