'use client'

import { useSettingsStore } from '@/stores/useSettingsStore'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function GeneralSettings() {
  const { 
    darkMode, 
    compactMode, 
    animationMode, 
    highContrastMode, 
    autoSave, 
    showGuidelines,
    setDarkMode,
    setCompactMode,
    setAnimationMode,
    setHighContrastMode,
    setAutoSave,
    setShowGuidelines
  } = useSettingsStore()

  return (
    <div className="grid grid-cols-[1fr,auto,1fr] gap-8 relative h-[calc(100vh-130px)] max-w-[1000px]">
      <div className="space-y-4 p-6">
        <h3 className="text-lg font-medium">Display Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle dark mode theme</p>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
              className="data-[state=checked]:bg-lime-600"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compact-mode">Compact Mode</Label>
              <p className="text-sm text-muted-foreground">Reduce spacing between elements</p>
            </div>
            <Switch
              id="compact-mode"
              checked={compactMode}
              onCheckedChange={setCompactMode}
              className="data-[state=checked]:bg-lime-600"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animation-mode">Animations</Label>
              <p className="text-sm text-muted-foreground">Enable interface animations</p>
            </div>
            <Switch
              id="animation-mode"
              checked={animationMode}
              onCheckedChange={setAnimationMode}
              className="data-[state=checked]:bg-lime-600"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast">High Contrast</Label>
              <p className="text-sm text-muted-foreground">Increase color contrast</p>
            </div>
            <Switch
              id="high-contrast"
              checked={highContrastMode}
              disabled
              onCheckedChange={setHighContrastMode}
              className="data-[state=checked]:bg-lime-600"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-save">Auto Save</Label>
              <p className="text-sm text-muted-foreground">Automatically save changes</p>
            </div>
            <Switch
              id="auto-save"
              checked={autoSave}
              disabled
              onCheckedChange={setAutoSave}
              className="data-[state=checked]:bg-lime-600"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-guidelines">Show Guidelines</Label>
              <p className="text-sm text-muted-foreground">Display layout guidelines</p>
            </div>
            <Switch
              id="show-guidelines"
              disabled
              checked={showGuidelines}
              onCheckedChange={setShowGuidelines}
              className="data-[state=checked]:bg-lime-600"
            />
          </div>
        </div>
      </div>

      <Separator orientation="vertical" className="h-full min-h-[500px]" />

      <div className="space-y-4 p-6 pl-2">
        <h3 className="text-lg font-medium">Preferences</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="language" className="text-muted-foreground">Language</Label>
            <p className="text-sm text-muted-foreground mb-2">Select your preferred language (Not yet implemented)</p>
            <Select defaultValue="en" disabled>
              <SelectTrigger id="language" className="opacity-50 cursor-not-allowed">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="timezone" className="text-muted-foreground">Timezone</Label>
            <p className="text-sm text-muted-foreground mb-2">Set your local timezone (Not yet implemented)</p>
            <Select defaultValue="utc" disabled>
              <SelectTrigger id="timezone" className="opacity-50 cursor-not-allowed">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                <SelectItem value="est">EST (GMT-5)</SelectItem>
                <SelectItem value="pst">PST (GMT-8)</SelectItem>
                <SelectItem value="ist">IST (GMT+5:30)</SelectItem>
                <SelectItem value="jst">JST (GMT+9)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="date-format" className="text-muted-foreground">Date Format</Label>
            <p className="text-sm text-muted-foreground mb-2">Choose your preferred date format (Not yet implemented)</p>
            <Select defaultValue="mdy" disabled>
              <SelectTrigger id="date-format" className="opacity-50 cursor-not-allowed">
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="number-format" className="text-muted-foreground">Number Format</Label>
            <p className="text-sm text-muted-foreground mb-2">Set your preferred number format (Not yet implemented)</p>
            <Select defaultValue="us" disabled>
              <SelectTrigger id="number-format" className="opacity-50 cursor-not-allowed">
                <SelectValue placeholder="Select number format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">1,234.56</SelectItem>
                <SelectItem value="eu">1.234,56</SelectItem>
                <SelectItem value="in">1,23,456.78</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="start-page" className="text-muted-foreground">Start Page</Label>
            <p className="text-sm text-muted-foreground mb-2">Choose your default landing page (Not yet implemented)</p>
            <Select defaultValue="dashboard" disabled>
              <SelectTrigger id="start-page" className="opacity-50 cursor-not-allowed">
                <SelectValue placeholder="Select start page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="projects">Projects</SelectItem>
                <SelectItem value="tasks">Tasks</SelectItem>
                <SelectItem value="calendar">Calendar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
