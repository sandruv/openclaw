import { ApiResponse } from './api';

export interface FileData {
  id: number;
  uuid?: string;
  file_name: string;
  blob_name: string;
  activity_id?: number;
  ticket_id?: number;
  created_at: string;
  updated_at: string;
  activity?: {
    id: number;
    // content: string;
  };
  ticket?: {
    id: number;
    summary: string;
  };
}

export interface UploadResponse extends ApiResponse<{
  files_data: FileData[];
  files: string[];
}> {}

export interface GetFilesResponse extends ApiResponse<FileData[]> {}
