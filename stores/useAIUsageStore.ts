import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { AIUsageService, AdminUserUsage, RoleConfig } from '@/services/aiUsageService'

interface AIUsageState {
  // Admin usage data
  users: AdminUserUsage[]
  systemTokens: number
  pagination: { page: number; limit: number; total: number }
  selectedMonth: string // "2026-03"
  search: string
  selectedUser: AdminUserUsage | null
  loading: boolean
  error: string | null

  // Role configs (settings tab)
  roleConfigs: RoleConfig[]
  roleConfigsLoading: boolean
  selectedRoleId: number | null
}

interface AIUsageActions {
  fetchUsage: () => Promise<void>
  fetchRoleConfigs: () => Promise<void>
  updateRoleConfig: (roleId: number, monthlyLimit: number) => Promise<boolean>
  updateUserAllocation: (userId: number, extraTokens: number) => Promise<boolean>
  setSelectedUser: (user: AdminUserUsage | null) => void
  setSelectedRoleId: (roleId: number | null) => void
  setMonth: (month: string) => void
  setPage: (page: number) => void
  setSearch: (search: string) => void
}

const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export const useAIUsageStore = create<AIUsageState & AIUsageActions>()(
  devtools((set, get) => ({
    users: [],
    systemTokens: 0,
    pagination: { page: 1, limit: 20, total: 0 },
    selectedMonth: getCurrentMonth(),
    search: '',
    selectedUser: null,
    loading: false,
    error: null,

    roleConfigs: [],
    roleConfigsLoading: false,
    selectedRoleId: null,

    fetchUsage: async () => {
      const { selectedMonth, pagination, search } = get()
      set({ loading: true, error: null })
      try {
        const data = await AIUsageService.getAdminUsage(
          selectedMonth,
          pagination.page,
          pagination.limit,
          search
        )
        set({
          users: data.users,
          systemTokens: data.system_tokens,
          pagination: data.pagination,
          loading: false,
        })
      } catch (error) {
        set({ error: (error as Error).message, loading: false })
      }
    },

    fetchRoleConfigs: async () => {
      set({ roleConfigsLoading: true })
      try {
        const data = await AIUsageService.getRoleConfigs()
        set({ roleConfigs: data.configs, roleConfigsLoading: false })
      } catch (error) {
        set({ error: (error as Error).message, roleConfigsLoading: false })
      }
    },

    updateRoleConfig: async (roleId, monthlyLimit) => {
      try {
        await AIUsageService.updateRoleConfig(roleId, monthlyLimit)
        // Refresh configs
        const data = await AIUsageService.getRoleConfigs()
        set({ roleConfigs: data.configs })
        return true
      } catch (error) {
        set({ error: (error as Error).message })
        return false
      }
    },

    updateUserAllocation: async (userId, extraTokens) => {
      try {
        await AIUsageService.updateUserAllocation(userId, extraTokens)
        // Refresh usage to reflect new effective limit
        await get().fetchUsage()
        // Update selectedUser if it matches
        const { selectedUser, users } = get()
        if (selectedUser?.user_id === userId) {
          const updated = users.find(u => u.user_id === userId)
          if (updated) set({ selectedUser: updated })
        }
        return true
      } catch (error) {
        set({ error: (error as Error).message })
        return false
      }
    },

    setSelectedUser: (user) => set({ selectedUser: user }),
    setSelectedRoleId: (roleId) => set({ selectedRoleId: roleId }),

    setMonth: (month) => {
      set({ selectedMonth: month, pagination: { ...get().pagination, page: 1 } })
      get().fetchUsage()
    },

    setPage: (page) => {
      set({ pagination: { ...get().pagination, page } })
      get().fetchUsage()
    },

    setSearch: (search) => {
      set({ search, pagination: { ...get().pagination, page: 1 } })
      get().fetchUsage()
    },
  }), { name: 'ai-usage-store' })
)
