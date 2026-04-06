// Stub: token limits — no DB in frontend prototype.
// All users are treated as unlimited (exempt).

export async function getEffectiveLimit(_userId: number, _roleId: number): Promise<number> {
  return 0 // 0 = unlimited
}

export async function getTokensUsed(_userId: number): Promise<number> {
  return 0
}

export async function checkTokenLimit(
  _userId: number,
  _roleId: number
): Promise<{ allowed: boolean; used: number; limit: number }> {
  return { allowed: true, used: 0, limit: 0 }
}

export async function recordUserTokenUsage(_userId: number, _tokens: number): Promise<void> {
  // No-op
}

export async function recordSystemTokenUsage(_tokens: number, _feature: string = 'analysis'): Promise<void> {
  // No-op
}
