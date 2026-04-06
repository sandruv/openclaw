'use client';

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Paperclip } from 'lucide-react';
import { FileAttachment } from './FileAttachment';
import { useToast } from '@/hooks/useToast';

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  /** Called when user is typing (for typing indicators) */
  onTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
  maxFileSize?: number; // in bytes, default 10MB
  allowedFileTypes?: string[];
}

export function ChatInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder = 'Type a message...',
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedFileTypes = [
    'image/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'application/zip',
  ],
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { showToast } = useToast();

  // Debounced typing indicator
  const handleTyping = useCallback(() => {
    if (!onTyping) return;
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Call onTyping
    onTyping();
    
    // Set timeout to stop calling after 2 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 2000);
  }, [onTyping]);

  const handleSend = () => {
    const trimmed = message.trim();
    if ((trimmed || selectedFiles.length > 0) && !disabled) {
      onSend(trimmed, selectedFiles.length > 0 ? selectedFiles : undefined);
      setMessage('');
      setSelectedFiles([]);
      textareaRef.current?.focus();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles: File[] = [];
    for (const file of files) {
      if (file.size > maxFileSize) {
        showToast({
          title: 'File too large',
          description: `${file.name} exceeds the maximum size of ${(maxFileSize / (1024 * 1024)).toFixed(0)}MB`,
          type: 'error',
        });
        continue;
      }
      validFiles.push(file);
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (e.target.value) {
      handleTyping();
    }
  };

  return (
    <div className="border-t bg-background">
      {/* File previews */}
      {selectedFiles.length > 0 && (
        <div className="p-3 border-b space-y-2">
          {selectedFiles.map((file, index) => (
            <FileAttachment
              key={`${file.name}-${index}`}
              fileName={file.name}
              fileUrl={URL.createObjectURL(file)}
              fileType={file.type}
              fileSize={file.size}
              onRemove={() => handleRemoveFile(index)}
              isPreview
            />
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 p-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedFileTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          size="icon"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="shrink-0"
          type="button"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[40px] max-h-[120px] resize-none text-sm"
          rows={1}
        />
        
        <Button
          size="icon"
          onClick={handleSend}
          disabled={disabled || (!message.trim() && selectedFiles.length === 0)}
          className="shrink-0"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
