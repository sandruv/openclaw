// Stub: server-side global settings — no DB in frontend prototype.

export interface GlobalSetting {
  id: number;
  key: string;
  value: string;
  description: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export async function getGlobalSetting(_key: string): Promise<GlobalSetting | null> {
  return null;
}

export async function getAllGlobalSettings(): Promise<Record<string, string>> {
  return {};
}

export async function getGlobalSettingBoolean(
  _key: string,
  defaultValue: boolean = false
): Promise<boolean> {
  return defaultValue;
}

export async function getGlobalSettingNumber(
  _key: string,
  defaultValue: number = 0
): Promise<number> {
  return defaultValue;
}
