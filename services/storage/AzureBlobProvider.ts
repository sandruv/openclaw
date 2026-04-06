import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { IStorageProvider, UploadOptions, UploadResult } from './IStorageProvider';

/**
 * Azure Blob Storage Provider
 * Implementation of IStorageProvider for Azure Blob Storage
 */
export class AzureBlobProvider implements IStorageProvider {
  private containerClient: ContainerClient | null = null;
  private connectionString: string;
  private containerName: string;

  constructor() {
    this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
    this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'uploads';

    if (this.connectionString) {
      try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
        this.containerClient = blobServiceClient.getContainerClient(this.containerName);
      } catch (error) {
        console.error('[AzureBlobProvider] Failed to initialize:', error);
      }
    }
  }

  private generateBlobName(originalFileName: string, options?: UploadOptions): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const lastDotIndex = originalFileName.lastIndexOf('.');
    const baseName = lastDotIndex > -1 ? originalFileName.slice(0, lastDotIndex) : originalFileName;
    const extension = lastDotIndex > -1 ? originalFileName.slice(lastDotIndex) : '';

    const folder = options?.folder || 'chat';
    const conversationPrefix = options?.conversationId ? `conv-${options.conversationId}/` : '';

    if (options?.generateUniqueName !== false) {
      return `${folder}/${conversationPrefix}${baseName}-${timestamp}-${randomString}${extension}`;
    }
    return `${folder}/${conversationPrefix}${originalFileName}`;
  }

  async upload(file: File | Buffer, fileName: string, options?: UploadOptions): Promise<UploadResult> {
    if (!this.containerClient) {
      throw new Error('Azure Blob Storage not configured');
    }

    const blobName = this.generateBlobName(fileName, options);
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

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

    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: {
        blobContentType: fileType,
      },
    });

    // Return proxied URL through our API instead of direct Azure URL
    // This allows us to control access and bypass public access restrictions
    const proxiedUrl = `/api/azure-blob/view?blobName=${encodeURIComponent(blobName)}`;

    return {
      url: proxiedUrl,
      fileName: fileName,
      fileSize: fileSize,
      fileType: fileType,
      blobName: blobName,
    };
  }

  async delete(blobName: string): Promise<void> {
    if (!this.containerClient) {
      throw new Error('Azure Blob Storage not configured');
    }

    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
  }

  async getDownloadUrl(blobName: string, expiresIn: number = 3600): Promise<string> {
    if (!this.containerClient) {
      throw new Error('Azure Blob Storage not configured');
    }

    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.url;
  }

  async download(blobName: string): Promise<Buffer> {
    if (!this.containerClient) {
      throw new Error('Azure Blob Storage not configured');
    }

    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    const downloadResponse = await blockBlobClient.download();

    if (!downloadResponse.readableStreamBody) {
      throw new Error('Failed to download blob');
    }

    const chunks: Buffer[] = [];
    for await (const chunk of downloadResponse.readableStreamBody) {
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  }

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      if (!this.containerClient) {
        return {
          connected: false,
          message: 'Azure Storage connection string not configured',
        };
      }

      await this.containerClient.exists();
      return {
        connected: true,
        message: 'Azure Blob Storage connected successfully',
      };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  getProviderName(): string {
    return 'azure-blob';
  }
}
