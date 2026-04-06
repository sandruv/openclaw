'use client'

import { useEffect, useState } from 'react'
import { useSocket } from '@/services/socketService'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function SocketEvent() {
  const { isConnected, socket, on, emit } = useSocket()
  const [messages, setMessages] = useState<string[]>([])
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    // Listen for messages from the server
    const unsubscribeMessage = on('message', (data) => {
      setMessages(prev => [...prev, `Received: ${data.text}`])
    })

    // Listen for notifications
    const unsubscribeNotification = on('notification', (data) => {
      setNotification(data.message)
      
      // Auto-clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    })

    // Listen for task updates
    const unsubscribeTaskUpdate = on('task:update', (data) => {
      console.log('Task updated:', data)
      setMessages(prev => [...prev, `Task updated: ${data.id}`])
    })

    // Clean up listeners when component unmounts
    return () => {
      unsubscribeMessage()
      unsubscribeNotification()
      unsubscribeTaskUpdate()
    }
  }, [on])

  // Send a test message to the server
  const sendTestMessage = () => {
    emit('message', { text: 'Hello from client!', timestamp: new Date().toISOString() })
    setMessages(prev => [...prev, 'Sent: Hello from client!'])
  }

  // Manually reconnect socket
  const handleReconnect = () => {
    socket.reconnect()
  }

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Socket Events</h2>
        <Badge className={isConnected ? "bg-green-500" : "bg-red-500"}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>

      {notification && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded">
          {notification}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={sendTestMessage} disabled={!isConnected}>
          Send Test Event
        </Button>
        <Button variant="outline" onClick={handleReconnect} disabled={isConnected}>
          Reconnect
        </Button>
      </div>

      <div className="border rounded p-2 h-40 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">No events yet</p>
        ) : (
          <ul className="space-y-1">
            {messages.map((msg, index) => (
              <li key={index} className="text-sm">
                {msg}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
