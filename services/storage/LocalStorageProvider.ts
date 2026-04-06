import { IStorageProvider, UploadOptions, UploadResult } from './IStorageProvider';
import fs from 'fs/promises';
import path from 'path';

/**
 * Local File Storage Provider
 * Implementation of IStorageProvider for local file system storage
 * Files are stored in public/uploads directory
 */
export class LocalStorageProvider implements IStorageProvider {
  private baseUploadDir: string;
  private baseUrl: string;

  constructor() {
    // Store files in public/uploads
    this.baseUploadDir = path.join(process.cwd(), 'public', 'uploads');
    this.baseUrl = '/uploads';
  }

  private generateFileName(originalFileName: string, options?: UploadOptions): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const lastDotIndex = originalFileName.lastIndexOf('.');
    const baseName = lastDotIndex > -1 ? originalFileName.slice(0, lastDotIndex) : originalFileName;
    const extension = lastDotIndex > -1 ? originalFileName.slice(lastDotIndex) : '';

    if (options?.generateUniqueName !== false) {
      return `${baseName}-${timestamp}-${randomString}${extension}`;
    }
    return originalFileName;
  }

  private getFilePath(fileName: string, options?: UploadOptions): { fullPath: string; relativePath: string } {
    const folder = options?.folder || 'chat';
    const conversationPrefix = options?.conversationId ? `conv-${options.conversationId}` : '';
    
    const subPath = conversationPrefix ? path.join(folder, conversationPrefix) : folder;
    const fullPath = path.join(this.baseUploadDir, subPath, fileName);
    const relativePath = path.join(subPath, fileName).replace(/\\/g, '/');

    return { fullPath, relativePath };
  }

  async upload(file: File | Buffer, fileName: string, options?: UploadOptions): Promise<UploadResult> {
    const uniqueFileName = this.generateFileName(fileName, options);
    const { fullPath, relativePath } = this.getFilePath(uniqueFileName, options);

    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    let buffer: Buffer;
    let fileSize: number;
    let fileType: string;

    if (Buffer.isBuffer(file)) {
      buffer = file;
      fileSize = buffer.length;
      fileType = 'application/octet-stream';
    } else {
      // File object (client-side)
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      fileSize = file.size;
      fileType = file.type || 'application/octet-stream';
    }

    // Write file to disk
    await fs.writeFile(fullPath, buffer);

    return {
      url: `${this.baseUrl}/${relativePath}`,
      fileName: fileName,
      fileSize: fileSize,
      fileType: fileType,
      localPath: relativePath,
    };
  }

  async delete(relativePath: string): Promise<void> {
    const fullPath = path.join(this.baseUploadDir, relativePath);
    
    try {
      await fs.unlink(fullPath);
      
      // Try to remove empty parent directories
      let dir = path.dirname(fullPath);
      while (dir !== this.baseUploadDir) {
        try {
          const files = await fs.readdir(dir);
          if (files.length === 0) {
            await fs.rmdir(dir);
            dir = path.dirname(dir);
          } else {
            break;
          }
        } catch {
          break;
        }
      }
    } catch (error) {
      console.error('[LocalStorageProvider] Delete failed:', error);
      throw error;
    }
  }

  async getDownloadUrl(relativePath: string, expiresIn?: number): Promise<string> {
    // Local files don't need signed URLs, just return the public URL
    return `${this.baseUrl}/${relativePath}`;
  }

  async download(relativePath: string): Promise<Buffer> {
    const fullPath = path.join(this.baseUploadDir, relativePath);
    
    try {
      return await fs.readFile(fullPath);
    } catch (error) {
      console.error('[LocalStorageProvider] Download failed:', error);
      throw error;
    }
  }

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      // Check if upload directory exists, create if not
      await fs.mkdir(this.baseUploadDir, { recursive: true });
      
      // Test write permissions
      const testFile = path.join(this.baseUploadDir, '.test');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);

      return {
        connected: true,
        message: `Local storage connected successfully at ${this.baseUploadDir}`,
      };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  getProviderName(): string {
    return 'local';
  }
}
