'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TiptapEditorSkeleton } from '@/components/task-details/thread/loaders/TiptapEditorSkeleton'
import { TiptapEditorError } from '@/components/task-details/thread/loaders/TiptapEditorError'
import { Card, CardContent } from "@/components/ui/card"
import { useIssuesStore } from '@/stores/useIssuesStore'
import { useToast } from '@/hooks/useToast'
import { Loader2 } from 'lucide-react'
import { ReportIssuesLoader } from '@/components/report-issues/ReportIssuesLoader'

const TiptapEditor = dynamic(
  () => import('@/components/custom/TiptapEditor').then(mod => mod.TiptapEditor).catch(err => {
    console.error('Error loading TiptapEditor:', err)
    return () => <TiptapEditorError />
  }),
  { 
    ssr: false,
    loading: () => <TiptapEditorSkeleton />
  }
)

export default function ReportIssues() {
  const { 
    issue, 
    config,
    errors, 
    isSubmitting, 
    setSummary, 
    setDescription, 
    submitIssue,
    initializeConfig
  } = useIssuesStore()

  const { showToast } = useToast()

  // Initialize config when component mounts
  useEffect(() => {
    if (!config.isInitialized && !config.isInitializing) {
      initializeConfig().catch((error) => {
        showToast({
          title: "Initialization Error",
          description: error instanceof Error ? error.message : 'Failed to initialize form',
          type: "error"
        })
      })
    }
  }, [config.isInitialized, config.isInitializing, initializeConfig, showToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await submitIssue()
      showToast({
        title: "Success",
        description: "Issue submitted successfully!",
        type: "success"
      })
    } catch (error) {
      showToast({
        title: "Error", 
        description: error instanceof Error ? error.message : 'Failed to submit issue',
        type: "error"
      })
    }
  }

  if(config.isInitializing) {
    return <ReportIssuesLoader />
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Report Issues</h1>
        
        <Card className={isSubmitting ? "opacity-50 pointer-events-none" : ""}>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 mt-5">
                <Label htmlFor="subject">Summary</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Brief description of the issue"
                  value={issue.summary}
                  onChange={(e) => setSummary(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                {errors.summary && (
                  <p className="text-sm text-red-500 mt-1">{errors.summary}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <TiptapEditor
                  content={issue.description}
                  onChange={setDescription}
                  className="min-h-[200px]"
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 dark:text-white" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Issue'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
