'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Bot, AlertTriangle, RefreshCw } from 'lucide-react'
import { useDashboardSettingsStore } from '@/stores/useDashboardSettingsStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { PRESET_THEME_COLORS } from '@/constants/colors'
import { AIUsageService, UserUsageResponse } from '@/services/aiUsageService'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function SettingsPage() {
  const { settings, updateSetting } = useDashboardSettingsStore()
  const { darkMode, setDarkMode } = useSettingsStore()
  const [usage, setUsage] = useState<UserUsageResponse | null>(null)
  const [usageLoading, setUsageLoading] = useState(true)

  const fetchUsage = useCallback(async () => {
    try {
      setUsageLoading(true)
      const data = await AIUsageService.getUsage()
      setUsage(data)
    } catch {
      // Silently fail — user may not have AI access
    } finally {
      setUsageLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  const formatTokens = (n: number) => n.toLocaleString()

  const usagePercent = usage && usage.limit > 0
    ? Math.min(100, Math.round((usage.used / usage.limit) * 100))
    : 0

  const atLimit = usage ? usage.used >= usage.limit && !usage.unlimited : false

  const barColor = atLimit
    ? 'bg-red-500'
    : usagePercent >= 90
      ? 'bg-red-400'
      : usagePercent >= 75
        ? 'bg-yellow-500'
        : 'bg-green-500'

  // Next reset date (1st of next month)
  const now = new Date()
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const resetLabel = resetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Display Settings */}
        <Card>
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-blue-600 dark:text-blue-400 text-sm uppercase tracking-wider">
              General
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-5">
              <div className="space-y-1">
                <h2 className="text-sm text-gray-700 dark:text-gray-300">Display Settings</h2>
                <div className="pl-5 max-w-[400px] space-y-4">
                  {/* Theme Color Preference */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme-color" className="text-sm text-gray-700 dark:text-gray-300">
                      Theme Color Preference
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="p-1 flex items-center justify-center gap-2 rounded-full"
                        >
                          <span className="w-6 h-6 rounded-full" 
                          style={{ backgroundColor: settings.themeColor }}>
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-52 p-3">
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Select Theme Color
                          </p>
                          <div className="grid grid-cols-4 gap-2">
                            {PRESET_THEME_COLORS.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                className={`w-8 h-8 rounded-full transition-all ${
                                  settings.themeColor === color.value
                                    ? 'ring-2 ring-offset-2 ring-blue-500 scale-105'
                                    : 'hover:scale-105'
                                }`}
                                style={{ backgroundColor: color.value }}
                                onClick={() => updateSetting('themeColor', color.value)}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Dark Mode */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dark-mode" className="text-sm text-gray-700 dark:text-gray-300">
                        Dark Mode
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Toggle between light and dark theme
                      </p>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                    />
                  </div>

                  {/* High Contrast */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="high-contrast" className="text-sm text-gray-700 dark:text-gray-300">
                        High Contrast
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Increase color contrast
                      </p>
                    </div>
                    <Switch
                      id="high-contrast"
                      checked={settings.highContrast}
                      onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="text-sm text-gray-700 dark:text-gray-300">Preference</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-5" >
                  {/* Language */}
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-sm text-gray-700 dark:text-gray-300">
                      Language
                    </Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => updateSetting('language', value)}
                      disabled
                    >
                      <SelectTrigger id="language" disabled>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Timezone */}
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-sm text-gray-700 dark:text-gray-300">
                      Timezone
                    </Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) => updateSetting('timezone', value)}
                      disabled
                    >
                      <SelectTrigger id="timezone" disabled>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC (GMT+0)">UTC (GMT+0)</SelectItem>
                        <SelectItem value="EST (GMT-5)">EST (GMT-5)</SelectItem>
                        <SelectItem value="PST (GMT-8)">PST (GMT-8)</SelectItem>
                        <SelectItem value="CST (GMT-6)">CST (GMT-6)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Format */}
                  <div className="space-y-2">
                    <Label htmlFor="date-format" className="text-sm text-gray-700 dark:text-gray-300">
                      Date Format
                    </Label>
                    <Select
                      value={settings.dateFormat}
                      onValueChange={(value) => updateSetting('dateFormat', value)}
                      disabled
                    >
                      <SelectTrigger id="date-format" disabled>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Number Format */}
                  <div className="space-y-2">
                    <Label htmlFor="number-format" className="text-sm text-gray-700 dark:text-gray-300">
                      Number Format
                    </Label>
                    <Select
                      value={settings.numberFormat}
                      onValueChange={(value) => updateSetting('numberFormat', value)}
                      disabled
                    >
                      <SelectTrigger id="number-format" disabled>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1,234.5">1,234.5</SelectItem>
                        <SelectItem value="1.234,5">1.234,5</SelectItem>
                        <SelectItem value="1 234.5">1 234.5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
               
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Usage */}
        {usageLoading && (
          <Card>
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <CardTitle className="text-blue-600 dark:text-blue-400 text-sm uppercase tracking-wider flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-2.5 w-full rounded-full" />
                <Skeleton className="h-3 w-1/2" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                </div>
                <Skeleton className="h-3 w-1/3" />
              </div>
            </CardContent>
          </Card>
        )}
        {!usageLoading && usage && (
          <Card>
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-600 dark:text-blue-400 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI Usage
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchUsage}
                  disabled={usageLoading}
                  className="h-8"
                >
                  <RefreshCw className={cn('h-4 w-4', usageLoading && 'animate-spin')} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                {usage.unlimited && (
                  <p className="text-sm text-muted-foreground">
                    Your role has unlimited AI usage — no token limits apply.
                  </p>
                )}

                {/* Usage info */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      Monthly Usage
                    </span>
                    <span className="text-muted-foreground">
                      {formatTokens(usage.used)} {!usage.unlimited && `/ ${formatTokens(usage.limit)}`} tokens
                    </span>
                  </div>
                  {!usage.unlimited && (
                    <>
                      <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', barColor)}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                      {atLimit ? (
                        <div className="flex items-center gap-1.5 text-xs text-red-500">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Token limit reached. Resets on {resetLabel}.</span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {usagePercent}% used — resets on {resetLabel}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Breakdown */}
                <div className={cn('grid gap-4', usage.unlimited ? 'grid-cols-1 md:grid-cols-1 max-w-[200px]' : 'grid-cols-1 md:grid-cols-3')}>
                  {!usage.unlimited && (
                    <>
                      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                        <p className="text-xs text-muted-foreground">Role Limit</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatTokens(usage.role_limit)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                        <p className="text-xs text-muted-foreground">Extra Tokens</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {usage.extra_tokens > 0 ? `+${formatTokens(usage.extra_tokens)}` : '0'}
                        </p>
                      </div>
                    </>
                  )}
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <p className="text-xs text-muted-foreground">Tokens Used</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatTokens(usage.used)}
                    </p>
                  </div>
                </div>

                {/* Period */}
                <p className="text-xs text-muted-foreground">
                  Billing period: {usage.period}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
