import { UploadResponse } from '@/types/upload';
import { apiRequest } from './api/clientConfig';
import { FileData } from '@/types/upload';
/**
 * Service for managing files in Azure Blob Storage
 * All Azure Storage operations are now handled by the API endpoints at /api/azure-blob-url
 */
class AzureFileService {
  private apiEndpoint: string;

  constructor() {
    // Set the API endpoint for Azure Blob operations
    // We'll use relative URLs that work in both development and production
    this.apiEndpoint = '/azure-blob';
    console.log('AzureFileService initialized using API endpoint:', this.apiEndpoint);
  }

  /**
   * Get a URL for a file by its blob name
   */
  private getApiUrl(params: Record<string, string>): string {
    const url = new URL(this.apiEndpoint, window.location.origin);
    
    // Add all params to the URL
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });
    
    return url.toString();
  }

  private generateBlobName(originalFilename: string): string {
    // Extract the file extension if present
    const lastDotIndex = originalFilename.lastIndexOf('.');
    const baseName = lastDotIndex > -1 ? originalFilename.slice(0, lastDotIndex) : originalFilename;
    const fileExtension = lastDotIndex > -1 ? originalFilename.slice(lastDotIndex + 1) : '';
    
    // Create a unique blob name with timestamp and random string
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    
    return `${baseName}-${timestamp}-${randomString}${fileExtension ? `.${fileExtension}` : ''}`;
  }

  // Client-side methods for file operations
  async uploadFiles(files: File[], activityId?: number, ticketId?: number): Promise<any> {
    try {
      const formData = new FormData();
      
      // Append files to FormData
      files.forEach((file) => {
        formData.append('files', file);
      });

      // Add optional activity or ticket ID
      if (activityId) {
        formData.append('activity_id', activityId.toString());
      }

      if (ticketId) {
        formData.append('ticket_id', ticketId.toString());
      }

      // Use apiRequest with custom headers for FormData
      const response = await apiRequest(this.apiEndpoint, {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response as UploadResponse;
    } catch (error) {
      console.error('Error uploading files to Azure:', error);
      throw error;
    }
  }

  async getFiles(options: {
    id?: number;
    activityId?: number;
    ticketId?: number;
  }): Promise<any> {
    try {
      // Convert options to query params
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
      
      // Call Azure blob API directly with apiRequest
      return await apiRequest(this.apiEndpoint, {
        method: 'GET',
        params
      });
    } catch (error) {
      console.error('Error getting files:', error);
      throw error;
    }
  }

  async downloadFileByBlobUrl(blobUrl: string): Promise<void> {
    try {
      // Extract filename from the URL
      const url = new URL(blobUrl);
      const pathSegments = url.pathname.split('/');
      const filename = pathSegments[pathSegments.length - 1];
      
      // Extract the blobName from the URL
      // The URL format is typically: https://accountname.blob.core.windows.net/containername/blobname
      const blobName = decodeURIComponent(pathSegments[pathSegments.length - 1]);
      
      // Use our API endpoint for downloading
      // This endpoint directly returns the file content, not a URL
      const apiUrl = `${this.apiEndpoint}/download?blobName=${encodeURIComponent(blobName)}`;
      
      // Use fetch directly with credentials to ensure authentication
      // We can't use apiRequest here because it expects JSON responses
      const response = await fetch(apiUrl, {
        credentials: 'include',
        headers: {
          // Get the token from localStorage for authentication
          'Authorization': `Bearer ${localStorage.getItem('ywp_token') || ''}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Convert to blob
      const blob = await response.blob();
      
      // Create download link and trigger download
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = decodeURIComponent(filename); // Use the filename from the URL
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Error downloading file from Azure:', error);
      throw error;
    }
  }
  /**
   * Get a URL for a file by its blob name
   */
  async getBlobUrl(blobName: string): Promise<string> {
    try {
      const data = await apiRequest<{ url: string }>(`${this.apiEndpoint}?blobName=${encodeURIComponent(blobName)}`);
      return data.url;
    } catch (error) {
      console.error('Error getting blob URL:', error);
      throw error;
    }
  }

  /**
   * Download a file by its ID from the database
   * This first gets the file metadata from the API, then downloads the file using the blob name
   */
  async downloadFile(file: FileData): Promise<Blob> {
    try {
      const blobName = file.blob_name || file.file_name;
      
      // Now download the file using the blob name
      const apiUrl = `/api/azure-blob/download?blobName=${encodeURIComponent(blobName)}`;
      
      // Use fetch directly with credentials to ensure authentication
      const downloadResponse = await fetch(apiUrl, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ywp_token') || ''}`,
        }
      });
      
      if (!downloadResponse.ok) {
        throw new Error(`HTTP error! status: ${downloadResponse.status}`);
      }
      
      // Return the blob directly
      return await downloadResponse.blob();
    } catch (error) {
      console.error('Error downloading file by ID:', error);
      throw error;
    }
  }
  /**
   * Delete a file from Azure Blob Storage
   */
  async deleteFromAzure(blobName: string): Promise<void> {
    try {
      await apiRequest(`${this.apiEndpoint}?blobName=${encodeURIComponent(blobName)}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting from Azure Blob Storage:', error);
      throw error;
    }
  }

  /**
   * Test the Azure Blob Storage connection before attempting file uploads
   * Returns true if the connection is working, false otherwise
   */
  async testConnection(): Promise<{connected: boolean; message: string}> {
    try {
      // Call our test endpoint
      const response = await fetch('/api/azure-blob/test', {
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
      console.error('Error testing Azure Blob Storage connection:', error);
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Unknown connection error'
      };
    }
  }
}

export const azureFileService = new AzureFileService();
