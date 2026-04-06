import { UploadResponse, GetFilesResponse } from '@/types/upload';
import { axiosInstance } from './api/clientConfig';

class FileService {
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

      const response = await axiosInstance.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  }

  async getFiles(options: {
    id?: number;
    activityId?: number;
    ticketId?: number;
  }): Promise<GetFilesResponse> {
    try {
      const response = await axiosInstance.get('/upload', {
        params: {
          id: options.id,
          activity_id: options.activityId,
          ticket_id: options.ticketId,
        }
      });

      return response;
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  }

  async downloadFile(fileName: string, inline: boolean = false): Promise<Blob> {
    try {
      // Use fetch API directly to get the blob data
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/download?filename=${encodeURIComponent(fileName)}&inline=${inline}`, {
        method: 'GET',
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

  async downloadFileById(fileId: number, inline: boolean = false): Promise<Blob> {
    try {
      // Use fetch API directly to get the blob data
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/download?id=${fileId}&inline=${inline}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error downloading file by ID:', error);
      throw error;
    }
  }
}

export const fileService = new FileService();
