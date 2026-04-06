import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PRESET_THEME_COLORS } from '@/constants/colors'

export interface DashboardSettings {
  themeColor: string
  highContrast: boolean
  language: string
  timezone: string
  dateFormat: string
  numberFormat: string
  chatOpen: boolean
  chatExpanded: boolean
  chatHistoryOpen: boolean
}

interface DashboardSettingsStore {
  settings: DashboardSettings
  updateSetting: <K extends keyof DashboardSettings>(key: K, value: DashboardSettings[K]) => void
  resetSettings: () => void
}

const defaultSettings: DashboardSettings = {
  themeColor: PRESET_THEME_COLORS[0].value,
  highContrast: false,
  language: 'English',
  timezone: 'UTC (GMT+0)',
  dateFormat: 'MM/DD/YYYY',
  numberFormat: '1,234.5',
  chatOpen: false,
  chatExpanded: false,
  chatHistoryOpen: false,
}

export const useDashboardSettingsStore = create<DashboardSettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      
      updateSetting: (key, value) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [key]: value,
          },
        })),
      
      resetSettings: () =>
        set({ settings: defaultSettings }),
    }),
    {
      name: 'dashboard-settings-storage',
    }
  )
)
