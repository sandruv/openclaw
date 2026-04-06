'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useGlobalStore } from '@/stores/useGlobalStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ToastExample() {
  const { showUndoToast } = useGlobalStore()
  const [counter, setCounter] = useState(0)
  
  // Example function to demonstrate toast with undo
  const handleIncrementWithUndo = () => {
    const previousValue = counter
    setCounter(prev => prev + 1)
    
    showUndoToast(
      `Counter incremented to ${counter + 1}`,
      () => {
        // Undo function
        setCounter(previousValue)
      }
    )
  }
  
  // Example function to demonstrate toast without undo
  const handleReset = () => {
    setCounter(0)
    showUndoToast('Counter reset to 0')
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Toast Notification Example</CardTitle>
        <CardDescription>
          Demonstrates how to use the bottom toast component
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="text-center py-4 text-4xl font-bold">{counter}</div>
        <div className="flex gap-2 justify-center">
          <Button onClick={handleIncrementWithUndo}>
            Increment with Undo
          </Button>
          <Button variant="destructive" onClick={handleReset}>
            Reset
          </Button>
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          <p>The toast notification will appear at the bottom of the screen.</p>
          <p>The "Increment with Undo" button will show a toast with an undo option.</p>
          <p>The "Reset" button will show a toast without an undo option.</p>
        </div>
      </CardContent>
    </Card>
  )
}
