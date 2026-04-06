export interface UserUsageResponse {
  used: number
  limit: number
  unlimited: boolean
  role_limit: number
  extra_tokens: number
  period: string
}

export interface AdminUserUsage {
  user_id: number
  name: string
  email: string
  role_id: number
  role_name: string
  tokens_used: number
  role_limit: number
  extra_tokens: number
  effective_limit: number
}

export interface AdminUsageResponse {
  period: string
  system_tokens: number
  pagination: { page: number; limit: number; total: number }
  users: AdminUserUsage[]
}

export interface RoleConfig {
  role_id: number
  role_name: string
  monthly_limit: number
  active: boolean
}

export class AIUsageService {
  private static getToken(): string {
    const token = localStorage.getItem('ywp_token')
    if (!token) throw new Error('Authentication token not found')
    return token
  }

  private static async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = AIUsageService.getToken()
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })
  }

  /** Get current user's token usage for the month */
  static async getUsage(): Promise<UserUsageResponse> {
    const res = await AIUsageService.fetchWithAuth('/api/ai/usage')
    if (!res.ok) throw new Error('Failed to fetch usage')
    return res.json()
  }

  /** Admin: get paginated user usage list */
  static async getAdminUsage(
    month?: string,
    page = 1,
    limit = 20,
    search = ''
  ): Promise<AdminUsageResponse> {
    const params = new URLSearchParams()
    if (month) params.set('month', month)
    params.set('page', String(page))
    params.set('limit', String(limit))
    if (search) params.set('search', search)

    const res = await AIUsageService.fetchWithAuth(`/api/admin/ai-usage?${params}`)
    if (!res.ok) throw new Error('Failed to fetch admin usage')
    return res.json()
  }

  /** Admin: get role configs */
  static async getRoleConfigs(): Promise<{ configs: RoleConfig[] }> {
    const res = await AIUsageService.fetchWithAuth('/api/admin/ai-usage/config')
    if (!res.ok) throw new Error('Failed to fetch role configs')
    return res.json()
  }

  /** Admin: update role monthly limit */
  static async updateRoleConfig(roleId: number, monthlyLimit: number): Promise<void> {
    const res = await AIUsageService.fetchWithAuth('/api/admin/ai-usage/config', {
      method: 'PUT',
      body: JSON.stringify({ role_id: roleId, monthly_limit: monthlyLimit }),
    })
    if (!res.ok) throw new Error('Failed to update role config')
  }

  /** Admin: set extra tokens for a user */
  static async updateUserAllocation(userId: number, extraTokens: number): Promise<void> {
    const res = await AIUsageService.fetchWithAuth('/api/admin/ai-usage/allocation', {
      method: 'PUT',
      body: JSON.stringify({ user_id: userId, extra_tokens: extraTokens }),
    })
    if (!res.ok) throw new Error('Failed to update user allocation')
  }
}
