import { apiRequest } from './api/clientConfig';
import { ApiResponse } from '@/types/api';

export interface GlobalSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GlobalSettingData {
  key: string;
  value: string;
  description?: string;
}

export class SettingsService {
  /**
   * Get a global setting by key
   * @param key The setting key
   * @returns The setting value or null if not found
   */
  static async getGlobalSetting(key: string): Promise<ApiResponse<GlobalSetting>> {
    const response = await apiRequest<ApiResponse<GlobalSetting>>(`/global-settings?key=${key}`);
    return response;
  }

  /**
   * Get all global settings
   * @returns An object with all global settings as key-value pairs
   */
  static async getAllGlobalSettings(): Promise<ApiResponse<Record<string, string>>> {
    const response = await apiRequest<ApiResponse<Record<string, string>>>('/global-settings');
    return response;
  }

  /**
   * Set a global setting
   * @param data The setting data (key, value, description)
   * @returns API response with the updated setting
   */
  static async setGlobalSetting(data: GlobalSettingData): Promise<ApiResponse<GlobalSetting>> {
    const response = await apiRequest<ApiResponse<GlobalSetting>>('/global-settings', {
      method: 'POST',
      data,
    });
    return response;
  }

  /**
   * Delete a global setting
   * @param key The setting key
   * @returns API response with the deleted setting
   */
  static async deleteGlobalSetting(key: string): Promise<ApiResponse<GlobalSetting>> {
    const response = await apiRequest<ApiResponse<GlobalSetting>>(`/global-settings?key=${key}`, {
      method: 'DELETE',
    });
    return response;
  }

  /**
   * Initialize default global settings if they don't exist
   */
  static async initializeDefaultSettings(): Promise<void> {
    const defaultSettings: GlobalSettingData[] = [
      {
        key: 'checkUserHasInProgress',
        value: 'true',
        description: 'Check if user has in-progress tasks before creating a new one'
      },
      {
        key: 'validateFormContent',
        value: 'true',
        description: 'Validate content in private notes and email forms'
      }
    ];

    try {
      const response = await this.getAllGlobalSettings();
      const settings = response.data || {};

      for (const setting of defaultSettings) {
        if (settings[setting.key] === undefined) {
          await this.setGlobalSetting(setting);
          console.log(`Initialized default setting: ${setting.key}`);
        }
      }
    } catch (error) {
      console.error('Error initializing default settings:', error);
    }
  }
}

// Export individual methods for easier imports
export const {
  getGlobalSetting,
  getAllGlobalSettings,
  setGlobalSetting,
  deleteGlobalSetting,
  initializeDefaultSettings
} = SettingsService;

export default SettingsService;
