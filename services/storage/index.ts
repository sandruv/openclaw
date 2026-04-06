/**
 * Storage Services Index
 * Export all storage-related services and types
 */

export type { IStorageProvider, UploadOptions, UploadResult } from './IStorageProvider';
export { AzureBlobProvider } from './AzureBlobProvider';
export { LocalStorageProvider } from './LocalStorageProvider';
export { StorageFactory, storageProvider } from './StorageFactory';
