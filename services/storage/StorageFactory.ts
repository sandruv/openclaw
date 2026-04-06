import { IStorageProvider } from './IStorageProvider';
import { AzureBlobProvider } from './AzureBlobProvider';
import { LocalStorageProvider } from './LocalStorageProvider';

/**
 * Storage Factory
 * Creates and returns the appropriate storage provider based on environment configuration
 */
export class StorageFactory {
  private static instance: IStorageProvider | null = null;

  /**
   * Get the configured storage provider
   * Provider is determined by STORAGE_PROVIDER env variable
   * - 'azure' = Azure Blob Storage
   * - 'local' = Local file system (public/uploads)
   * - Default: 'azure' if AZURE_STORAGE_CONNECTION_STRING exists, otherwise 'local'
   */
  static getProvider(): IStorageProvider {
    if (this.instance) {
      return this.instance;
    }

    const providerType = process.env.STORAGE_PROVIDER?.toLowerCase();
    const debugInit = process.env.DEBUG_INIT === '1';
    
    // Auto-detect if not specified
    if (!providerType) {
      if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
        this.instance = new AzureBlobProvider();
        if (debugInit) {
          console.log('[StorageFactory] Using Azure Blob Storage (auto-detected)');
        }
      } else {
        this.instance = new LocalStorageProvider();
        if (debugInit) {
          console.log('[StorageFactory] Using Local Storage (auto-detected)');
        }
      }
    } else if (providerType === 'azure') {
      this.instance = new AzureBlobProvider();
      if (debugInit) {
        console.log('[StorageFactory] Using Azure Blob Storage (explicit)');
      }
    } else if (providerType === 'local') {
      this.instance = new LocalStorageProvider();
      if (debugInit) {
        console.log('[StorageFactory] Using Local Storage (explicit)');
      }
    } else {
      if (debugInit) {
        console.warn(`[StorageFactory] Unknown provider: ${providerType}, falling back to Local Storage`);
      }
      this.instance = new LocalStorageProvider();
    }

    return this.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static reset(): void {
    this.instance = null;
  }

  /**
   * Get the current provider name
   */
  static getProviderName(): string {
    return this.getProvider().getProviderName();
  }
}

/**
 * Get the storage provider instance
 * Use this function instead of direct instantiation to ensure lazy initialization
 */
export const getStorageProvider = () => StorageFactory.getProvider();

/**
 * @deprecated Use getStorageProvider() function instead.
 * This export causes build-time initialization. Will be removed in a future version.
 */
export const storageProvider = StorageFactory.getProvider();
