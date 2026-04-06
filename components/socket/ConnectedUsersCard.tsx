'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSocket } from '@/services/socketService'

interface UserData {
  id?: string
  name?: string
  email?: string
  [key: string]: any
}

interface ConnectionInfo {
  address?: string
  time?: string
  url?: string
  headers?: Record<string, any>
  query?: Record<string, any>
}

interface ConnectedUser {
  id: string
  connected: boolean
  lastActive?: string
  user?: UserData | null
  connection?: ConnectionInfo
  rooms?: string[]
}

interface ConnectedUsersCardProps {
  onRefresh: () => Promise<void>
  loading: boolean
}

export function ConnectedUsersCard({ onRefresh, loading }: ConnectedUsersCardProps) {
  const [users, setUsers] = useState<ConnectedUser[]>([])
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true)
  const { isConnected } = useSocket()
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch connected users on mount and when isConnected changes
  useEffect(() => {
    if (isConnected) {
      fetchConnectedUsers()
    }
  }, [isConnected])

  // Set up auto-refresh interval
  useEffect(() => {
    if (autoRefresh && isConnected) {
      refreshIntervalRef.current = setInterval(() => {
        fetchConnectedUsers()
      }, 5000) // Refresh every 5 seconds
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
    }
  }, [autoRefresh, isConnected])

  const fetchConnectedUsers = async () => {
    try {
      // Use the API endpoint to fetch connected clients
      const response = await fetch('/api/socket-status/clients')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.clients) {
        setUsers(data.clients)
      }
    } catch (error) {
      console.error('Error fetching connected users:', error)
    }
  }

  // Function to get user display name
  const getUserDisplayName = (user: ConnectedUser) => {
    if (!user.user) return 'Anonymous User';
    return user.user.name || user.user.email || user.user.id || 'Unknown User';
  }

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Connected Users
        </CardTitle>
        <CardDescription>
          Users currently connected to the socket server
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <span className="text-sm font-medium">
            {users.length} user{users.length !== 1 ? 's' : ''} connected
          </span>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleAutoRefresh}
            >
              {autoRefresh ? 'Disable Auto-refresh' : 'Enable Auto-refresh'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={loading}
            >
              Refresh Now
            </Button>
          </div>
        </div>

        
        {users.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-auto">
            {users.map(user => (
              <div 
                key={user.id} 
                className="p-2 bg-gray-100 rounded flex justify-between items-center"
              >
                <div className="truncate flex-1">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{getUserDisplayName(user)}</span>
                    <span className="font-mono text-xs text-gray-500">{user.id}</span>
                    {user.rooms && user.rooms.length > 1 && (
                      <span className="text-xs text-gray-500">
                        Rooms: {user.rooms.filter(r => r !== user.id).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center ml-2">
                  <div className={`w-2 h-2 rounded-full ${user.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            {isConnected ? 'No users connected' : 'Socket disconnected'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
