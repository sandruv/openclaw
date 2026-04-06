"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useTaskDetailsStore } from "@/stores/useTaskDetailsStore"
import { useAISdkStore } from "@/stores/useAISdkStore"
import { Bot, ArrowRight, RefreshCw, Loader2, BotMessageSquare } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { logger } from "@/lib/logger"
import { AITabLoader } from "../loaders/AITabLoader"
import { AIContentLoader } from "../loaders/AIContentLoader"
import { AITabError } from "../components/AITabError"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { cn } from "@/lib/utils"

interface AITabProps {
    onSwitchToInteract: (context: string) => void
}

export const AITab = ({ onSwitchToInteract }: AITabProps) => {
	const { task, isNavigating } = useTaskDetailsStore()
	const { analyzeTicket, updateAnalysisIncremental, analysis, error, isLoading } = useAISdkStore()
	const { compactMode } = useSettingsStore()

	const [loading, setLoading] = useState(false)
	const [prevTaskId, setPrevTaskId] = useState<number | undefined>()
	const staleCheckDoneRef = useRef<number | null>(null)

	// Fetch analysis - now just passes taskId to backend
	const fetchAnalysis = useCallback(async (forceRefresh = false) => {
		if (!task?.id) return
		try {
			await analyzeTicket(task.id, forceRefresh)
		} catch (error) {
			logger.error('Error analyzing task:', error)
		}
	}, [task?.id, analyzeTicket])

	// Trigger analysis when task changes
	useEffect(() => {
		if (task?.id && (!analysis || task.id !== prevTaskId)) {
			fetchAnalysis(false)
		}

        if (task?.id) {
            setPrevTaskId(task.id)
        }
    }, [task?.id, analysis, fetchAnalysis, prevTaskId])

    // Check for stale analysis - if latest activity is newer than what analysis was built with
    useEffect(() => {
        if (!task?.id || isLoading) return
        
        // Only check once per task
        if (staleCheckDoneRef.current === task.id) return
        
        // Get latest activity ID from task
        const latestActivityId = task.activities?.[0]?.id
        if (!latestActivityId) {
            staleCheckDoneRef.current = task.id
            return
        }
        
        // Parse task.analysis from DB (this is always correct for the current task)
        let storedAnalysis: any = null
        if (task.analysis) {
            try {
                storedAnalysis = typeof task.analysis === 'string' 
                    ? JSON.parse(task.analysis) 
                    : task.analysis
            } catch {
                // Invalid JSON, treat as no analysis
            }
        }
        
        // If no stored analysis or no lastActivityId, skip (will be set on next analysis)
        if (!storedAnalysis?.lastActivityId) {
            staleCheckDoneRef.current = task.id
            return
        }
        
        // Compare stored analysis lastActivityId with current latest activity
        if (storedAnalysis.lastActivityId !== latestActivityId) {
            logger.info(`[AITab] Analysis stale - lastActivityId: ${storedAnalysis.lastActivityId}, latest: ${latestActivityId}. Triggering incremental update.`)
            staleCheckDoneRef.current = task.id
            updateAnalysisIncremental(task.id).catch(err => {
                logger.error('[AITab] Incremental update failed:', err)
            })
        } else {
            // Mark as checked even if not stale
            staleCheckDoneRef.current = task.id
        }
    }, [task?.id, task?.activities, task?.analysis, isLoading, updateAnalysisIncremental])

	const handleContinueAnalysis = async () => {
		setLoading(true)
		try {
			// Build comprehensive context from analysis
			let context = ''

			if (task) {
				context += `## Task Summary\n${task.summary || ''}\n\n`
			}

			if (analysis?.analysis) {
				context += `## AI Analysis\n${analysis.analysis}\n\n`
			}

			if (analysis?.steps) {
				context += `## Recommended Next Steps\n${analysis.steps}\n\n`
			}

			// Switch to interact tab with context
			onSwitchToInteract(context.trim())
			logger.info('Switched to interact tab with analysis context')
		} catch (error) {
			logger.error('Error switching to interact tab:', error)
		} finally {
			setLoading(false)
		}
	}

	if (isLoading && !analysis) {
		return <AITabLoader />
	}

	if (error) {
		return (
			<AITabError
				error={error}
				onRefresh={() => fetchAnalysis(true)}
				isThinking={isLoading}
			/>
		)
	}

	if (!analysis) {
		return (
			<AITabError
				error="Analysis not found"
				onRefresh={() => fetchAnalysis(true)}
				isThinking={isLoading}
			/>
		)
	}

	return (
		<div className="w-full">
			<div className="">
				<div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700">
					<div className="flex items-center space-x-2">
						<Bot className="h-5 w-5 text-blue-500 dark:text-blue-400" />
						<h2 className="text-lg font-semibold dark:text-gray-100"></h2>
					</div>

					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleContinueAnalysis}
							className="text-sm dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
							disabled={loading}
						>
							<BotMessageSquare className={cn('h-4 w-4', compactMode ? 'mr-0' : 'mr-1')} />
							{compactMode ? '' : 'Chat'}
						</Button>

						<Button
							variant="outline"
							size="sm"
							onClick={() => fetchAnalysis(true)}
							disabled={isLoading || isNavigating}
							className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
						>
							<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
							{compactMode ? '' : 'Refresh'}
						</Button>
					</div>
				</div>

				{isNavigating ? <AIContentLoader /> : (
					<ScrollArea className="h-[calc(100vh-120px)] px-4 pr-3">
						{analysis.analysis && (
							<Card className="border-blue-200 bg-blue-50 mb-2 mt-2 dark:border-blue-900/50 dark:bg-blue-950/50">
								<CardHeader className="!pb-0">
									<CardTitle className="text-sm font-medium flex items-center dark:text-blue-300">
										<Bot className="h-5 w-5 mr-2 pb-1 text-blue-500 dark:text-blue-400" />
										<span className="text-blue-900 dark:text-blue-200">{compactMode ? '' : 'Analysis'}</span>
									</CardTitle>
								</CardHeader>
								<CardContent className="!pt-2">
									<div className="prose prose-sm max-w-none text-blue-900 dark:text-blue-200 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 dark:prose-headings:text-blue-200 dark:prose-strong:text-blue-200">
										<ReactMarkdown>
											{analysis.analysis}
										</ReactMarkdown>
									</div>
								</CardContent>
							</Card>
						)}

						{analysis.steps && (
							<Card className="border-green-200 bg-green-50 mb-2 dark:border-green-900/50 dark:bg-green-950/50">
								<CardHeader className="!pb-0">
									<CardTitle className="text-sm font-medium flex items-center dark:text-green-300">
										<ArrowRight className="h-4 w-4 mr-2 text-green-500 dark:text-green-400" />
										<span className="text-green-900 dark:text-green-200">{compactMode ? '' : 'Next Steps'}</span>
									</CardTitle>
								</CardHeader>
								<CardContent className="!pt-2">
									<div className="prose prose-sm max-w-none text-green-900 dark:text-green-200 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 dark:prose-headings:text-green-200 dark:prose-strong:text-green-200">
										<ReactMarkdown>
											{analysis.steps}
										</ReactMarkdown>
									</div>
								</CardContent>
							</Card>
						)}

						{(analysis?.analysis || analysis?.steps) && (
							<div className="mt-4 flex justify-end">
								<Button
									variant="outline"
									onClick={handleContinueAnalysis}
									className="text-sm dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
									disabled={loading}
								>
									{loading ? (
										<>
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											Processing
										</>
									) : (
										<>
											{compactMode ? 'Chat' : 'Continue Analysis'}
											<ArrowRight className="h-4 w-4 ml-1" />
										</>
									)}
								</Button>
							</div>
						)}
					</ScrollArea>
				)}


			</div>
		</div>
	)
}