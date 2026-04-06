'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { IDETabStrip, TabItem } from '@/components/admin/pages/system-initialization/IDETabStrip'
import { Check, Code2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import packageJson from '@/package.json'
import { API_ENDPOINTS } from './constants'

export default function ApiReference() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedMethod, setSelectedMethod] = useState<{
    endpointIndex: number
    methodIndex: number
  } | null>(null)

  // SHA-256 hash function
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Get password hash from environment variable
    // Hash of "ywportalAPI2026" = 7be0b726c52889fe70147d81699bb37e7c0ccbb2a3b1a3eee62feaf5fa26d1a3
    const correctPasswordHash = process.env.NEXT_PUBLIC_API_REFERENCE_PASSWORD_HASH || 
      '7be0b726c52889fe70147d81699bb37e7c0ccbb2a3b1a3eee62feaf5fa26d1a3' // fallback hash for 'ywportalAPI2026'
    
    // Hash the entered password
    const enteredPasswordHash = await hashPassword(password)
    
    if (enteredPasswordHash === correctPasswordHash) {
      setIsAuthorized(true)
      setError('')
      setPassword('')
    } else {
      setError('Invalid password')
      setPassword('')
    }
  }

  // Group endpoints by category
  const categories = ['All', 'Tasks', 'Users', 'System']
  const tabs: TabItem[] = categories.map(cat => ({
    id: cat.toLowerCase(),
    label: cat,
    count: cat === 'All' ? API_ENDPOINTS.reduce((acc, ep) => acc + ep.methods.length, 0) : undefined
  }))

  // Filter endpoints based on active tab
  const filteredEndpoints = activeTab === 'all' 
    ? API_ENDPOINTS 
    : API_ENDPOINTS.filter(ep => {
        if (activeTab === 'tasks') return ep.name.toLowerCase().includes('task') || ep.name.toLowerCase().includes('ticket') || ep.name.toLowerCase().includes('activities')
        if (activeTab === 'users') return ep.name.toLowerCase().includes('user') || ep.name.toLowerCase().includes('client') || ep.name.toLowerCase().includes('site')
        if (activeTab === 'system') return ep.name.toLowerCase().includes('auth') || ep.name.toLowerCase().includes('priority') || ep.name.toLowerCase().includes('status') || ep.name.toLowerCase().includes('impact') || ep.name.toLowerCase().includes('urgenc') || ep.name.toLowerCase().includes('categor') || ep.name.toLowerCase().includes('tier') || ep.name.toLowerCase().includes('source')
        return true
      })

  const handleMethodClick = (endpointIndex: number, methodIndex: number) => {
    setSelectedMethod({ endpointIndex, methodIndex })
  }

  const selectedEndpoint = selectedMethod !== null ? API_ENDPOINTS[selectedMethod.endpointIndex] : null
  const selectedMethodData = selectedEndpoint && selectedMethod !== null 
    ? selectedEndpoint.methods[selectedMethod.methodIndex] 
    : null

  // Get sample JSON for console
  const sampleJson = selectedMethodData?.returns.find(r => r.example)?.example

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-[#1e1e1e] relative">
      {/* Password Overlay */}
      {!isAuthorized && (
        <div className="absolute inset-0 z-50 bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-md p-8">
            <div className="bg-white dark:bg-[#252526] border border-gray-200 dark:border-[#3c3c3c] rounded-lg shadow-xl p-8">
              <div className="flex flex-col items-center mb-6">
                <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">API Reference</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Enter password to view API documentation</p>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    autoFocus
                  />
                  {error && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full">
                  Unlock
                </Button>
              </form>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-[#3c3c3c]">
                <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                  Version {packageJson.version}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane */}
        <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-[#3c3c3c] min-w-0">
          <IDETabStrip tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} showLoader={false} />
          
          {/* Compact List */}
          <div className={`flex-1 overflow-y-auto ${ !isAuthorized ? 'pointer-events-none select-none opacity-30 blur-sm' : ''}`}>
            <div className="divide-y divide-gray-200 dark:divide-[#3c3c3c]">
              {/* Header Row (Sticky) */}
              <div className="h-8 flex items-center px-3 bg-gray-50 dark:bg-[#252526] text-xs text-gray-500 dark:text-[#969696] uppercase tracking-wide sticky top-0 z-10">
                <span className="w-16">Method</span>
                <span className="flex-1">Endpoint</span>
                <span className="w-32">Path</span>
              </div>
              
              {/* Data Rows */}
              {filteredEndpoints.map((endpoint, endpointIndex) => (
                endpoint.methods.map((method, methodIndex) => {
                  const isSelected = selectedMethod?.endpointIndex === endpointIndex && 
                                    selectedMethod?.methodIndex === methodIndex
                  
                  return (
                    <button
                      key={`${endpoint.path}-${method.type}-${methodIndex}`}
                      onClick={() => handleMethodClick(endpointIndex, methodIndex)}
                      className={`h-9 w-full flex items-center px-3 text-sm transition-colors ${
                        isSelected
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-gray-900 dark:text-white'
                          : 'text-gray-900 dark:text-[#cccccc] hover:bg-gray-50 dark:hover:bg-[#2a2d2e]'
                      }`}
                    >
                      <span className="w-16">
                        <Badge variant={
                          method.type === 'GET' ? 'get' :
                          method.type === 'POST' ? 'post' :
                          method.type === 'PUT' ? 'update' :
                          method.type === 'DELETE' ? 'delete' :
                          'outline'
                        } className="text-[10px] px-1.5 py-0.5">
                          {method.type}
                        </Badge>
                      </span>
                      <span className="flex-1 truncate text-left">{endpoint.name}</span>
                      <span className="w-32 truncate text-xs text-gray-500 dark:text-[#969696] font-mono">{endpoint.path.split('/').pop()}</span>
                    </button>
                  )
                })
              ))}
            </div>
          </div>
        </div>

        {/* Right Pane */}
        <div className={`w-[45%] flex-shrink-0 min-w-[300px] flex flex-col ${!isAuthorized ? 'pointer-events-none select-none opacity-30 blur-sm' : ''}`}>
          {selectedEndpoint && selectedMethodData ? (
            <>
              {/* Details Section */}
              <div className="flex-1 flex flex-col border-b border-gray-200 dark:border-[#3c3c3c]">
                {/* Header */}
                <div className="h-[35px] border-b border-gray-200 dark:border-[#3c3c3c] bg-white dark:bg-[#252526] px-3 flex items-center text-xs text-gray-600 dark:text-[#969696] font-medium">
                  Details
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-white dark:bg-[#1e1e1e] p-4">
                  {/* Endpoint Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={
                        selectedMethodData.type === 'GET' ? 'get' :
                        selectedMethodData.type === 'POST' ? 'post' :
                        selectedMethodData.type === 'PUT' ? 'update' :
                        selectedMethodData.type === 'DELETE' ? 'delete' :
                        'outline'
                      }>{selectedMethodData.type}</Badge>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedEndpoint.name}</h3>
                    </div>
                    <p className="font-mono text-sm text-blue-600 dark:text-[#9cdcfe] mb-1">{selectedEndpoint.path}</p>
                    <p className="text-sm text-gray-600 dark:text-[#cccccc]">{selectedMethodData.description}</p>
                  </div>

                  {/* Parameters */}
                  {selectedMethodData.params && selectedMethodData.params.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-[#969696] uppercase tracking-wide mb-2">Parameters</h4>
                      <div className="border border-gray-200 dark:border-[#3c3c3c] rounded">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-[#252526]">
                              <th className="px-2 py-1.5 text-left text-xs text-gray-500 dark:text-[#969696] font-medium">Name</th>
                              <th className="px-2 py-1.5 text-left text-xs text-gray-500 dark:text-[#969696] font-medium">Type</th>
                              <th className="px-2 py-1.5 text-left text-xs text-gray-500 dark:text-[#969696] font-medium">Required</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-[#3c3c3c]">
                            {selectedMethodData.params.map((param, idx) => (
                              <tr key={idx} className="text-gray-900 dark:text-[#cccccc]">
                                <td className="px-2 py-1.5 font-mono text-xs">{param.name}</td>
                                <td className="px-2 py-1.5 text-xs">{param.type}</td>
                                <td className="px-2 py-1.5">
                                  {param.required ? (
                                    <Check className="h-3.5 w-3.5 text-green-600 dark:text-[#4ec9b0]" />
                                  ) : (
                                    <span className="text-xs text-gray-400 dark:text-[#969696]">No</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Returns */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-[#969696] uppercase tracking-wide mb-2">Response Codes</h4>
                    <div className="border border-gray-200 dark:border-[#3c3c3c] rounded">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-[#252526]">
                            <th className="px-2 py-1.5 text-left text-xs text-gray-500 dark:text-[#969696] font-medium">Status</th>
                            <th className="px-2 py-1.5 text-left text-xs text-gray-500 dark:text-[#969696] font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-[#3c3c3c]">
                          {selectedMethodData.returns.map((ret, idx) => (
                            <tr key={idx} className="text-gray-900 dark:text-[#cccccc]">
                              <td className="px-2 py-1.5 font-mono text-xs">{ret.status}</td>
                              <td className="px-2 py-1.5 text-xs">{ret.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Console Section */}
              <div className="h-[40%] flex flex-col">
                {/* Header */}
                <div className="h-[35px] border-b border-gray-200 dark:border-[#3c3c3c] bg-white dark:bg-[#252526] px-3 flex items-center gap-2 text-xs text-gray-600 dark:text-[#969696] font-medium">
                  <Code2 className="h-3.5 w-3.5" />
                  Sample Response
                </div>
                
                {/* Console Output */}
                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#1e1e1e] p-4">
                  {sampleJson ? (
                    <pre className="text-xs font-mono text-gray-800 dark:text-[#cccccc] whitespace-pre-wrap">
                      {JSON.stringify(sampleJson, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-xs text-gray-500 dark:text-[#969696] italic">
                      No sample response available for this endpoint
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-[#969696]">
              <div className="text-center">
                <Code2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select an API endpoint to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="h-8 bg-white dark:bg-[#252526] border-t border-gray-200 dark:border-[#3c3c3c] px-4 flex items-center justify-between text-xs text-gray-600 dark:text-[#969696]">
        <div className="flex items-center gap-4">
          <span>YanceyWorks Portal API Reference</span>
          <span className="text-gray-400 dark:text-gray-600">•</span>
          <span>Version {packageJson.version}</span>
        </div>
        <div>
          Build Date: March 5, 2026
        </div>
      </div>
    </div>
  )
}
