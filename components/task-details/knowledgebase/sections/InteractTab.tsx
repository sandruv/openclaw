'use client'

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Sparkles } from 'lucide-react'
import { useTaskDetailsStore } from "@/stores/useTaskDetailsStore"
import ReactMarkdown from 'react-markdown'
import { useSettingsStore } from "@/stores/useSettingsStore"
import { LoadingDots } from '@/components/ui/loading-dots'
import { TokenUsageBar } from '@/components/ai/TokenUsageBar'
import { Message } from '@/types/ai'

interface InteractTabProps {
    initialContext: string | null
}

export function InteractTab({ initialContext }: InteractTabProps) {
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [usageRefresh, setUsageRefresh] = useState(0)
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const { compactMode } = useSettingsStore()
    
    // Get all conversation state from useTaskDetailsStore
    const {
        task,
        interactMessages: messages,
        interactIsThinking: isThinking,
        interactIsStreaming: isStreaming,
        interactCurrentMessage: currentStreamingMessage,
        interactError,
        setInteractMessages,
        addInteractMessage,
        generateInteractResponse,
        loadInteractConversation
    } = useTaskDetailsStore()

    const isAtTokenLimit = interactError === 'TOKEN_LIMIT_REACHED'

    // Load conversation from localStorage on mount
    useEffect(() => {
        if (task?.id) {
            loadInteractConversation()
        }
    }, [task?.id, loadInteractConversation])

    // Initialize with context when provided (only if no saved conversation)
    useEffect(() => {
        if (initialContext && messages.length === 0) {
            setInteractMessages([{
                role: 'assistant',
                content: `I've analyzed the task. Here's what I found:\n\n${initialContext}\n\nHow can I help you further with this task?`
            }])
        }
    }, [initialContext, messages.length, setInteractMessages])

    // Auto-scroll to bottom - similar to ChatColumn
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    // Auto-scroll when messages change or during streaming
    useEffect(() => {
        scrollToBottom()
    }, [messages, isThinking, isStreaming, currentStreamingMessage, scrollToBottom])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!task || !input.trim() || isThinking) return
        setLoading(true)

        const userMessage = input.trim()
        setInput("")
        
        // Add user message to store (this will trigger thinking state)
        const userMsg: Message = { role: 'user', content: userMessage }
        addInteractMessage(userMsg)
        
        // Build messages array including the user message
        const newMessages: Message[] = [...messages, userMsg]
        
        // Generate AI response using store method
        // The store will set isThinking=true immediately (synchronously)
        generateInteractResponse(newMessages).then(() => {
          setUsageRefresh(prev => prev + 1)
        })
        setTimeout(() => setLoading(false), 1000)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    if (!task) return null

    return (
        <div className="flex flex-col h-[calc(100vh-80px)]">
            <ScrollArea ref={scrollAreaRef} className="flex-grow mb-1 px-2 border-b border-gray-200 dark:border-gray-800">
                {messages.length === 0 ? (
                    <Card className="border-dashed border-2 dark:border-gray-700">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Sparkles className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {compactMode ? 'Start Chat' : 'Start Interactive Analysis'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
                                Ask questions about this task, request clarifications, or get help with next steps.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4 pb-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[90%] rounded-lg px-4 py-2 ${
                                        message.role === 'user'
                                            ? 'bg-green-500 text-white dark:bg-green-600'
                                            : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    }`}
                                >
                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                        <ReactMarkdown>{message.content}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* Show streaming message in real-time */}
                        {isStreaming && currentStreamingMessage && (
                            <div className="flex gap-3 justify-start">
                                <div className="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-4 py-2 max-w-[80%]">
                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                        <ReactMarkdown>{currentStreamingMessage}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Show thinking indicator when not streaming yet */}
                        {loading && (
                            <div className="flex items-center gap-2">
                                <div className="w-[40px] border-b-2 border-gray-200"></div>
                                <div className="text-sm text-muted-foreground">thinking <LoadingDots /></div>
                            </div>
                        )}
                        {/* Invisible div for auto-scroll target */}
                        <div ref={messagesEndRef} style={{ height: '1px' }} />
                    </div>
                )}
            </ScrollArea>
            <TokenUsageBar refreshTrigger={usageRefresh} compact className="border-t border-gray-200 dark:border-gray-800" />
            <form onSubmit={handleSubmit} className="flex gap-2 px-2 pt-1">
                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question about this task... (Press Enter to send, Shift+Enter for new line)"
                    className="flex-grow resize-none min-h-[60px] max-h-[120px] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 styled-scrollbar"
                    disabled={isThinking || isAtTokenLimit}
                />
                <Button
                    type="submit"
                    className="h-[60px] px-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                    aria-label="Send message"
                    disabled={!input.trim() || isThinking || isAtTokenLimit}
                >
                    <Send className="h-5 w-5" />
                </Button>
            </form>
        </div>
    )
}