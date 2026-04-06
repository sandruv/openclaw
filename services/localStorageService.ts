import { UploadResponse, FileData } from '@/types/upload';
import { apiRequest } from './api/clientConfig';

/**
 * Service for managing files in local storage
 * Uses the /api/storage endpoints for file operations
 */
class LocalStorageService {
  private apiEndpoint: string;

  constructor() {
    this.apiEndpoint = '/storage';
    if (process.env.DEBUG_INIT === '1') {
      console.log('[LocalStorageService] Initialized using API endpoint:', this.apiEndpoint);
    }
  }

  /**
   * Upload files to local storage
   */
  async uploadFiles(files: File[], activityId?: number, ticketId?: number): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('files', file);
      });

      if (activityId) {
        formData.append('activity_id', activityId.toString());
      }

      if (ticketId) {
        formData.append('ticket_id', ticketId.toString());
      }

      const response = await apiRequest(this.apiEndpoint, {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response as UploadResponse;
    } catch (error) {
      console.error('Error uploading files to local storage:', error);
      throw error;
    }
  }

  /**
   * Get files by ID, activity ID, or ticket ID
   */
  async getFiles(options: {
    id?: number;
    activityId?: number;
    ticketId?: number;
  }): Promise<any> {
    try {
      const params: Record<string, string> = {};
      
      if (options.id) {
        params.id = options.id.toString();
      }
      
      if (options.activityId) {
        params.activity_id = options.activityId.toString();
      }
      
      if (options.ticketId) {
        params.ticket_id = options.ticketId.toString();
      }
      
      return await apiRequest(this.apiEndpoint, {
        method: 'GET',
        params
      });
    } catch (error) {
      console.error('Error getting files:', error);
      throw error;
    }
  }

  /**
   * Download a file by its metadata
   */
  async downloadFile(file: FileData): Promise<Blob> {
    try {
      const blobName = file.blob_name || file.file_name;
      const apiUrl = `/api/storage/download?blobName=${encodeURIComponent(blobName)}`;
      
      const response = await fetch(apiUrl, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ywp_token') || ''}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  /**
   * Download a file directly by a storage URL (e.g. /api/storage/download?blobName=...)
   */
  async downloadFileByBlobUrl(blobUrl: string): Promise<void> {
    try {
      const url = new URL(blobUrl, window.location.origin);
      const pathSegments = url.pathname.split('/');
      const filename = decodeURIComponent(pathSegments[pathSegments.length - 1]);

      // We expect blobUrl to be an API download URL that returns the file bytes
      const response = await fetch(blobUrl, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ywp_token') || ''}`,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Error downloading file by URL from local storage:', error);
      throw error;
    }
  }

  /**
   * Delete a file from local storage
   */
  async deleteFile(blobName: string): Promise<void> {
    try {
      await apiRequest(`${this.apiEndpoint}?blobName=${encodeURIComponent(blobName)}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting file from local storage:', error);
      throw error;
    }
  }

  /**
   * Test the local storage connection
   */
  async testConnection(): Promise<{connected: boolean; message: string}> {
    try {
      const response = await fetch('/api/storage/test', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ywp_token') || ''}`,
        }
      });
      
      const result = await response.json();
      
      return {
        connected: result.connected || false,
        message: result.message || 'Connection test completed'
      };
    } catch (error) {
      console.error('Error testing local storage connection:', error);
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Unknown connection error'
      };
    }
  }
}

export const localStorageService = new LocalStorageService();
