/**
 * Storage Provider Interface
 * Abstraction layer for file storage operations
 * Allows switching between Azure Blob Storage, local storage, or other providers
 */

export interface UploadOptions {
  folder?: string;
  conversationId?: number;
  userId?: number;
  generateUniqueName?: boolean;
}

export interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  blobName?: string; // For Azure compatibility
  localPath?: string; // For local storage
}

export interface IStorageProvider {
  /**
   * Upload a file to storage
   */
  upload(file: File | Buffer, fileName: string, options?: UploadOptions): Promise<UploadResult>;

  /**
   * Delete a file from storage
   */
  delete(identifier: string): Promise<void>;

  /**
   * Get a download URL for a file
   */
  getDownloadUrl(identifier: string, expiresIn?: number): Promise<string>;

  /**
   * Download a file as a blob/buffer
   */
  download(identifier: string): Promise<Buffer>;

  /**
   * Check if storage provider is properly configured
   */
  testConnection(): Promise<{ connected: boolean; message: string }>;

  /**
   * Get the provider name
   */
  getProviderName(): string;
}
