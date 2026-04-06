import React, { useState } from 'react';
import { 
  FileIcon, 
  ImageIcon, 
  FileTextIcon, 
  FileSpreadsheetIcon,
  DownloadIcon,
  XIcon,
  Loader2
} from 'lucide-react';

interface FileAttachmentProps {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  onRemove?: () => void;
  onDownload?: () => void;
  isPreview?: boolean;
}

/**
 * FileAttachment Component
 * Displays file attachments in chat messages with preview and download capabilities
 */
export const FileAttachment: React.FC<FileAttachmentProps> = ({
  fileName,
  fileUrl,
  fileType,
  fileSize,
  onRemove,
  onDownload,
  isPreview = false,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  
  // Check if file is an image by type or extension
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  const isImage = fileType.startsWith('image/') || imageExtensions.includes(fileExtension);
  const isPdf = fileType === 'application/pdf';
  const isDoc = fileType.includes('word') || fileType.includes('document');
  const isSpreadsheet = fileType.includes('excel') || fileType.includes('sheet');

  // Check if URL is Azure Blob Storage URL (direct Azure URL)
  const isAzureUrl = fileUrl.includes('blob.core.windows.net');
  // Check if URL is proxied through our API
  const isProxiedAzureUrl = fileUrl.includes('/api/azure-blob/view');
  // Check if URL is a local upload URL
  const isLocalUrl = fileUrl.startsWith('/uploads/') || fileUrl.includes('/uploads/');

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="w-5 h-5" />;
    if (isPdf) return <FileTextIcon className="w-5 h-5" />;
    if (isDoc) return <FileTextIcon className="w-5 h-5" />;
    if (isSpreadsheet) return <FileSpreadsheetIcon className="w-5 h-5" />;
    return <FileIcon className="w-5 h-5" />;
  };

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    // For preview mode (local blob URLs), use simple download
    if (isPreview) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    setIsDownloading(true);
    
    try {
      if (isAzureUrl || isProxiedAzureUrl) {
        // For Azure Blob Storage, extract blob name
        let blobName: string;
        
        if (isProxiedAzureUrl) {
          // Extract blobName from our proxied URL
          const url = new URL(fileUrl, window.location.origin);
          blobName = url.searchParams.get('blobName') || '';
        } else {
          // Extract from direct Azure URL
          const url = new URL(fileUrl);
          const pathSegments = url.pathname.split('/');
          // Remove container name from path to get blob name
          blobName = pathSegments.slice(2).join('/');
        }
        
        if (!blobName) {
          throw new Error('Could not extract blob name from URL');
        }
        
        // Pass both blobName (storage path) and fileName (original filename for download)
        const downloadUrl = `/api/azure-blob/download?blobName=${encodeURIComponent(blobName)}&fileName=${encodeURIComponent(fileName)}`;
        
        const response = await fetch(downloadUrl, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('ywp_token') || ''}`,
          }
        });
        
        if (!response.ok) {
          throw new Error(`Download failed: ${response.status}`);
        }
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      } else if (isLocalUrl) {
        // For local uploads, fetch and download
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Download failed: ${response.status}`);
        }
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      } else {
        // Fallback: try direct fetch
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Download failed: ${response.status}`);
        }
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      }
    } catch (error) {
      console.error('[FileAttachment] Download failed:', error);
      // Fallback: open in new tab
      window.open(fileUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  // Show image preview for images when not in preview mode (i.e., in chat messages)
  if (isImage && !isPreview && !imageLoadError) {
    return (
      <div className="relative group max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fileUrl}
          alt={fileName}
          loading="lazy"
          className="rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={handleDownload}
          onError={() => {
            console.error('[FileAttachment] Failed to load image:', fileUrl);
            setImageLoadError(true);
          }}
        />
        {/* Download indicator overlay */}
        {isDownloading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
        {/* Download button on hover */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="absolute top-2 left-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
          aria-label="Download image"
        >
          <DownloadIcon className="w-4 h-4" />
        </button>
        <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-xs text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
          {fileName}
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove file"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`
        flex items-center gap-3 py-2 px-3 rounded-lg border
        ${isPreview 
          ? 'bg-gray-400/50 dark:bg-gray-800' 
          : 'bg-gray-400/10 dark:bg-gray-900'
        }
        ${!isPreview && 'hover:bg-gray-400/20 dark:hover:bg-gray-900/20'}
        transition-colors max-w-sm
      `}
    >
      <div className="flex-shrink-0 text-gray-500/80 dark:text-gray-400">
        {getFileIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-bold text-xs text-gray-900 dark:text-gray-100 truncate">
          {fileName}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatFileSize(fileSize)}
        </div>
      </div>

      <div className="flex gap-1">
        {!isPreview && (
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Download file"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 text-gray-600 dark:text-gray-300 animate-spin" />
            ) : (
              <DownloadIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        )}
        
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            aria-label="Remove file"
          >
            <XIcon className="w-4 h-4 text-red-500 dark:text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
};
