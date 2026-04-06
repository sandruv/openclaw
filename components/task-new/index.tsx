import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClientInfo } from "./sections/ClientInfo"
import TaskDetails from "./sections/TaskDetails"
import { AdditionalInfo } from "./sections/AdditionalInfo"
import { useRouter } from "next/navigation"
import { ValidationErrors } from "@/types/newTask"

interface NewTaskFormProps {
  errors: ValidationErrors
  isLoading: boolean
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  handleAttachment: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function NewTaskForm({
  errors,
  isLoading,
  isSubmitting,
  onSubmit,
  handleAttachment,
}: NewTaskFormProps) {
  const router = useRouter()
  return (
    <form onSubmit={onSubmit} className="container max-w-full relative" data-testid="new-task-form">
      <div className="flex flex-col md:flex-row gap-0 min-h-[calc(100vh-61px)] pb-[72px]">
        <Card className="w-full md:w-[300px] lg:w-[450px] border-0 border-r rounded-none dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">End-user Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ClientInfo errors={errors} />
          </CardContent>
        </Card>

        <Card className="flex-1 border-0 rounded-none w-full max-w-[1200px]">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Task Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <TaskDetails errors={errors} />
            <AdditionalInfo handleAttachment={handleAttachment} errors={errors} />
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t dark:border-gray-700 shadow-lg p-4">
        <div className="container max-w-full flex justify-end">
          <div className="flex w-full max-w-[500px]">
            <Button
              variant="outline"
              className="h-12 mr-2 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button 
              type="submit" 
              className="bg-blue-500 hover:bg-blue-600 dark:text-white dark:bg-blue-600 dark:hover:bg-blue-700 w-[500px] h-12" 
              disabled={isLoading || isSubmitting}
              data-testid="submit-task-button"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Task'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
