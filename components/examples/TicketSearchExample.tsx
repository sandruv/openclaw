'use client'

import { useState, useEffect } from 'react'
import { searchTasks } from '@/services/taskService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Task } from '@/types/tasks'
import { Loader2 } from 'lucide-react'

interface SearchParams {
  client_id?: string;
  agent_id?: string;
  category_id?: string;
  impact_id?: string;
  priority_id?: string;
  status_id?: string;
  subcategory_id?: string;
  ticket_source_id?: string;
  ticket_type_id?: string;
  urgency_id?: string;
  user_id?: string;
}

export function TicketSearchExample() {
  const [searchParams, setSearchParams] = useState<SearchParams>({})
  const [results, setResults] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState(0)

  // Handle input change
  const handleChange = (field: keyof SearchParams, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle search submission
  const handleSearch = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Filter out empty values
      const filteredParams = Object.fromEntries(
        Object.entries(searchParams).filter(([_, value]) => value !== '')
      )
      
      const response = await searchTasks(filteredParams)
      
      if (response.status === 200) {
        setResults(response.data)
        setCount(response.data.length)
      } else {
        setError(response.message || 'An error occurred while searching')
        setResults([])
        setCount(0)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching')
      setResults([])
      setCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Clear search parameters and results
  const handleClear = () => {
    setSearchParams({})
    setResults([])
    setCount(0)
    setError(null)
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Ticket Search</CardTitle>
          <CardDescription>
            Search for tickets using multiple filter criteria. All fields are optional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Client ID */}
            <div className="space-y-2">
              <Label htmlFor="client_id">Client</Label>
              <Input
                id="client_id"
                value={searchParams.client_id || ''}
                onChange={(e) => handleChange('client_id', e.target.value)}
                placeholder="Client ID"
              />
            </div>
            
            {/* Agent ID */}
            <div className="space-y-2">
              <Label htmlFor="agent_id">Agent</Label>
              <Input
                id="agent_id"
                value={searchParams.agent_id || ''}
                onChange={(e) => handleChange('agent_id', e.target.value)}
                placeholder="Agent ID"
              />
            </div>
            
            {/* User ID */}
            <div className="space-y-2">
              <Label htmlFor="user_id">End User</Label>
              <Input
                id="user_id"
                value={searchParams.user_id || ''}
                onChange={(e) => handleChange('user_id', e.target.value)}
                placeholder="User ID"
              />
            </div>
            
            {/* Status ID */}
            <div className="space-y-2">
              <Label htmlFor="status_id">Status</Label>
              <Input
                id="status_id"
                value={searchParams.status_id || ''}
                onChange={(e) => handleChange('status_id', e.target.value)}
                placeholder="Status ID"
              />
            </div>
            
            {/* Priority ID */}
            <div className="space-y-2">
              <Label htmlFor="priority_id">Priority</Label>
              <Input
                id="priority_id"
                value={searchParams.priority_id || ''}
                onChange={(e) => handleChange('priority_id', e.target.value)}
                placeholder="Priority ID"
              />
            </div>
            
            {/* Category ID */}
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Input
                id="category_id"
                value={searchParams.category_id || ''}
                onChange={(e) => handleChange('category_id', e.target.value)}
                placeholder="Category ID"
              />
            </div>
            
            {/* Subcategory ID */}
            <div className="space-y-2">
              <Label htmlFor="subcategory_id">Subcategory</Label>
              <Input
                id="subcategory_id"
                value={searchParams.subcategory_id || ''}
                onChange={(e) => handleChange('subcategory_id', e.target.value)}
                placeholder="Subcategory ID"
              />
            </div>
            
            {/* Impact ID */}
            <div className="space-y-2">
              <Label htmlFor="impact_id">Impact</Label>
              <Input
                id="impact_id"
                value={searchParams.impact_id || ''}
                onChange={(e) => handleChange('impact_id', e.target.value)}
                placeholder="Impact ID"
              />
            </div>
            
            {/* Urgency ID */}
            <div className="space-y-2">
              <Label htmlFor="urgency_id">Urgency</Label>
              <Input
                id="urgency_id"
                value={searchParams.urgency_id || ''}
                onChange={(e) => handleChange('urgency_id', e.target.value)}
                placeholder="Urgency ID"
              />
            </div>
            
            {/* Ticket Type ID */}
            <div className="space-y-2">
              <Label htmlFor="ticket_type_id">Ticket Type</Label>
              <Input
                id="ticket_type_id"
                value={searchParams.ticket_type_id || ''}
                onChange={(e) => handleChange('ticket_type_id', e.target.value)}
                placeholder="Ticket Type ID"
              />
            </div>
            
            {/* Ticket Source ID */}
            <div className="space-y-2">
              <Label htmlFor="ticket_source_id">Ticket Source</Label>
              <Input
                id="ticket_source_id"
                value={searchParams.ticket_source_id || ''}
                onChange={(e) => handleChange('ticket_source_id', e.target.value)}
                placeholder="Ticket Source ID"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Results Section */}
      {(results.length > 0 || error) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            {!error && <CardDescription>Found {count} tickets matching your criteria</CardDescription>}
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="space-y-4">
                {results.map((ticket) => (
                  <div key={ticket.id} className="border p-4 rounded-md">
                    <div className="font-semibold">{ticket.summary}</div>
                    <div className="text-sm text-gray-500">
                      <span>ID: {ticket.id}</span>
                      <span className="mx-2">•</span>
                      <span>Status: {ticket.status?.name || 'Unknown'}</span>
                      <span className="mx-2">•</span>
                      <span>Priority: {ticket.priority?.name || 'Unknown'}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span>Client: {ticket.client?.name || 'Unknown'}</span>
                      <span className="mx-2">•</span>
                      <span>Agent: {ticket.agent?.first_name} {ticket.agent?.last_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
