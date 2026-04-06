'use client'

import { useSettingsStore } from '@/stores/useSettingsStore'
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export default function FormsSettings() {
  const { 
    userFormSettings,
    setSkipConfirmationDialogs,
    setAutoSaveFormData
  } = useSettingsStore()

  return (
    <div className="grid grid-cols-[1fr,auto,1fr] gap-8 relative h-[calc(100vh-130px)] max-w-[1000px]">
      <div className="space-y-4 p-6">
        <h3 className="text-lg font-medium">Form Behavior</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="skip-confirmation-dialogs">Skip Confirmation Dialogs</Label>
              <p className="text-sm text-muted-foreground">
                Skip confirmation dialogs when performing form actions (default: enabled)
              </p>
            </div>
            <Switch
              id="skip-confirmation-dialogs"
              checked={userFormSettings.skipConfirmationDialogs}
              onCheckedChange={setSkipConfirmationDialogs}
              className="data-[state=checked]:bg-lime-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-save-form-data">Auto-save Form Data</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save form data as you type (coming soon)
              </p>
            </div>
            <Switch
              id="auto-save-form-data"
              checked={userFormSettings.autoSaveFormData}
              onCheckedChange={setAutoSaveFormData}
              disabled
              className="data-[state=checked]:bg-lime-600"
            />
          </div>
        </div>
      </div>

      <Separator orientation="vertical" className="h-full min-h-[500px]" />

      <div className="space-y-4 p-6 pl-2">
        <h3 className="text-lg font-medium">Additional Form Settings</h3>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>More form settings will be added here in future updates.</p>
            <p className="mt-2">Planned settings:</p>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Auto-save form data (currently disabled)</li>
              <li>Form validation preferences (coming soon)</li>
              <li>Default form values (coming soon)</li>
              <li>Form field auto-completion (coming soon)</li>
              <li>Form submission behavior (coming soon)</li>
            </ul>
            
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-xs font-medium">Note:</p>
              <p className="text-xs">
                These settings are stored locally in your browser session and will persist across page reloads.
                Settings are user-specific and won't affect other users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
