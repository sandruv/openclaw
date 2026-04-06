'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { usePatchUpdateStore } from '@/stores/usePatchUpdateStore';
import { PatchUpdate } from '@/services/patchUpdateService';
import { patchUpdateHelpers } from '@/constants/colors';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Save,
  Eye,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { FormattedContent } from '../../../patch-updates/helpers/FormattedContent';
import { PatchUpdateFormSkeleton } from '../../../patch-updates/loaders/PatchUpdateSkeletons';

const patchUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  version: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  published: z.boolean(),
});

type PatchUpdateFormData = z.infer<typeof patchUpdateSchema>;

interface PatchUpdateFormProps {
  initialData?: PatchUpdate;
  onSubmit: (data: PatchUpdateFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean; // For initial loading (show skeleton)
  isSubmitting?: boolean; // For form submission (disable form + loading button)
  mode: 'create' | 'edit';
}

export function PatchUpdateForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  isSubmitting = false,
  mode 
}: PatchUpdateFormProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const form = useForm<PatchUpdateFormData>({
    resolver: zodResolver(patchUpdateSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      version: initialData?.version || '1.0',
      priority: initialData?.priority || 'low',
      published: initialData?.published || false,
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: initialData?.content || '<p>Enter your patch update content here...</p>',
    onUpdate: ({ editor }) => {
      form.setValue('content', editor.getHTML());
    },
  });

  // Update editor content when initialData changes
  useEffect(() => {
    if (editor && initialData?.content) {
      editor.commands.setContent(initialData.content);
    }
  }, [editor, initialData?.content]);

  const handleSubmit = async (data: PatchUpdateFormData) => {
    await onSubmit(data);
  };

  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run();
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor?.chain().focus().toggleBlockquote().run();
  const undo = () => editor?.chain().focus().undo().run();
  const redo = () => editor?.chain().focus().redo().run();

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="h-4 w-4" />;
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'low':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const currentPriority = form.watch('priority');
  const currentPublished = form.watch('published');
  const currentTitle = form.watch('title');
  const currentContent = form.watch('content');

  // Show skeleton loader only for initial loading (not submission)
  if (isLoading) {
    return <PatchUpdateFormSkeleton />;
  }

  return (
    <div className="h-full bg-white dark:bg-[#1e1e1e]">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="relative h-full flex flex-col">
        {/* Overlay when submitting */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-40" />
        )}
        
        {/* Form Header Bar */}
        <div className="flex-shrink-0 h-12 bg-gray-50 dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">
              {mode === 'create' ? 'Create Patch Update' : 'Edit Patch Update'}
            </h1>
            <span className="text-xs text-gray-500 dark:text-[#969696]">
              {mode === 'create' 
                ? 'Create a new patch update to inform users about system changes'
                : 'Update the patch update information and content'
              }
            </span>
          </div>
          
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            disabled={isSubmitting}
            className={cn(
              'h-7 px-3 text-xs rounded flex items-center gap-1.5 transition-colors',
              isPreviewMode
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'text-gray-700 dark:text-[#cccccc] hover:bg-gray-100 dark:hover:bg-[#3c3c3c]'
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            {isPreviewMode ? 'Exit Preview' : 'Preview'}
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-full">
            {/* Main Content */}
            <div className="lg:col-span-2 flex flex-col border-r border-gray-200 dark:border-[#3c3c3c]">
              {/* Basic Information */}
              <div className="flex-shrink-0 p-4 bg-gray-50 dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c]">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="title" className="text-xs text-gray-600 dark:text-[#969696] uppercase tracking-wide">Title *</Label>
                    <Input
                      id="title"
                      {...form.register('title')}
                      placeholder="Enter patch update title..."
                      className="mt-1 bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#3c3c3c] text-gray-900 dark:text-white"
                      disabled={isPreviewMode || isSubmitting}
                    />
                    {form.formState.errors.title && (
                      <p className="text-xs text-red-500 dark:text-[#f48771] mt-1">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="w-32">
                    <Label htmlFor="version" className="text-xs text-gray-600 dark:text-[#969696] uppercase tracking-wide">Version</Label>
                    <Input
                      id="version"
                      {...form.register('version')}
                      placeholder="e.g., 2.1.0"
                      className="mt-1 bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#3c3c3c] text-gray-900 dark:text-white"
                      disabled={isPreviewMode || isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Content Editor */}
              <div className="flex-1 flex flex-col">
                {/* Content Header */}
                <div className="flex-shrink-0 h-9 bg-gray-50 dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center px-4">
                  <span className="text-xs text-gray-600 dark:text-[#969696] uppercase tracking-wide">Content *</span>
                </div>
                
                {isPreviewMode ? (
                  <div className="flex-1 p-4 bg-white dark:bg-[#1e1e1e] overflow-y-auto">
                    <div className="prose prose-sm max-w-none dark:prose-invert text-gray-700 dark:text-[#cccccc]">
                      <FormattedContent 
                        content={currentContent || '<p>No content</p>'}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Editor Toolbar */}
                    <div className="flex-shrink-0 h-10 bg-white dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center px-2 gap-0.5">
                      <button
                        type="button"
                        onClick={toggleBold}
                        disabled={isSubmitting}
                        className={cn(
                          'h-7 w-7 flex items-center justify-center rounded text-gray-600 dark:text-[#cccccc] hover:bg-gray-100 dark:hover:bg-[#3c3c3c]',
                          editor?.isActive('bold') && 'bg-gray-200 dark:bg-[#3c3c3c]'
                        )}
                      >
                        <Bold className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={toggleItalic}
                        disabled={isSubmitting}
                        className={cn(
                          'h-7 w-7 flex items-center justify-center rounded text-gray-600 dark:text-[#cccccc] hover:bg-gray-100 dark:hover:bg-[#3c3c3c]',
                          editor?.isActive('italic') && 'bg-gray-200 dark:bg-[#3c3c3c]'
                        )}
                      >
                        <Italic className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={toggleUnderline}
                        disabled={isSubmitting}
                        className={cn(
                          'h-7 w-7 flex items-center justify-center rounded text-gray-600 dark:text-[#cccccc] hover:bg-gray-100 dark:hover:bg-[#3c3c3c]',
                          editor?.isActive('underline') && 'bg-gray-200 dark:bg-[#3c3c3c]'
                        )}
                      >
                        <UnderlineIcon className="h-3.5 w-3.5" />
                      </button>
                      
                      <div className="w-px h-5 bg-gray-300 dark:bg-[#3c3c3c] mx-1" />
                      
                      <button
                        type="button"
                        onClick={toggleBulletList}
                        disabled={isSubmitting}
                        className={cn(
                          'h-7 w-7 flex items-center justify-center rounded text-gray-600 dark:text-[#cccccc] hover:bg-gray-100 dark:hover:bg-[#3c3c3c]',
                          editor?.isActive('bulletList') && 'bg-gray-200 dark:bg-[#3c3c3c]'
                        )}
                      >
                        <List className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={toggleOrderedList}
                        disabled={isSubmitting}
                        className={cn(
                          'h-7 w-7 flex items-center justify-center rounded text-gray-600 dark:text-[#cccccc] hover:bg-gray-100 dark:hover:bg-[#3c3c3c]',
                          editor?.isActive('orderedList') && 'bg-gray-200 dark:bg-[#3c3c3c]'
                        )}
                      >
                        <ListOrdered className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={toggleBlockquote}
                        disabled={isSubmitting}
                        className={cn(
                          'h-7 w-7 flex items-center justify-center rounded text-gray-600 dark:text-[#cccccc] hover:bg-gray-100 dark:hover:bg-[#3c3c3c]',
                          editor?.isActive('blockquote') && 'bg-gray-200 dark:bg-[#3c3c3c]'
                        )}
                      >
                        <Quote className="h-3.5 w-3.5" />
                      </button>
                      
                      <div className="w-px h-5 bg-gray-300 dark:bg-[#3c3c3c] mx-1" />
                      
                      <button
                        type="button"
                        onClick={undo}
                        disabled={isSubmitting}
                        className="h-7 w-7 flex items-center justify-center rounded text-gray-600 dark:text-[#cccccc] hover:bg-gray-100 dark:hover:bg-[#3c3c3c]"
                      >
                        <Undo className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={redo}
                        disabled={isSubmitting}
                        className="h-7 w-7 flex items-center justify-center rounded text-gray-600 dark:text-[#cccccc] hover:bg-gray-100 dark:hover:bg-[#3c3c3c]"
                      >
                        <Redo className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Editor */}
                    <div className="flex-1 p-4 bg-white dark:bg-[#1e1e1e] overflow-y-auto">
                      <div className="min-h-[300px] prose prose-sm max-w-none dark:prose-invert text-gray-900 dark:text-[#cccccc]">
                        <EditorContent 
                          editor={editor}
                          className="focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {form.formState.errors.content && (
                  <div className="flex-shrink-0 px-4 py-2 bg-red-50 dark:bg-[#5a1d1d]/30 border-t border-red-200 dark:border-[#be1100]/50">
                    <p className="text-xs text-red-500 dark:text-[#f48771]">
                      {form.formState.errors.content.message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col bg-gray-50 dark:bg-[#252526]">
              {/* Settings Section */}
              <div className="border-b border-gray-200 dark:border-[#3c3c3c]">
                <div className="h-9 flex items-center px-4 bg-gray-100 dark:bg-[#1e1e1e]">
                  <span className="text-xs text-gray-600 dark:text-[#969696] uppercase tracking-wide">Settings</span>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <Label htmlFor="priority" className="text-xs text-gray-600 dark:text-[#969696] uppercase tracking-wide">Priority *</Label>
                    <Select
                      value={currentPriority}
                      onValueChange={(value) => form.setValue('priority', value as any)}
                      disabled={isPreviewMode || isSubmitting}
                    >
                      <SelectTrigger className="mt-1 bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#3c3c3c]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center space-x-2">
                            {getPriorityIcon('low')}
                            <span>Low</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center space-x-2">
                            {getPriorityIcon('medium')}
                            <span>Medium</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center space-x-2">
                            {getPriorityIcon('high')}
                            <span>High</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="critical">
                          <div className="flex items-center space-x-2">
                            {getPriorityIcon('critical')}
                            <span>Critical</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="published" className="text-sm text-gray-700 dark:text-[#cccccc]">Published</Label>
                    <Switch
                      id="published"
                      className="data-[state=checked]:bg-green-600"
                      checked={currentPublished}
                      onCheckedChange={(checked) => form.setValue('published', checked)}
                      disabled={isPreviewMode || isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div className="flex-1">
                <div className="h-9 flex items-center px-4 bg-gray-100 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#3c3c3c]">
                  <span className="text-xs text-gray-600 dark:text-[#969696] uppercase tracking-wide">Preview</span>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={patchUpdateHelpers.getPriorityColor(currentPriority)}>
                      {patchUpdateHelpers.formatPriority(currentPriority)}
                    </Badge>
                    {currentPublished ? (
                      <Badge variant="outline" className="text-green-600 border-green-600 dark:text-green-400 dark:border-green-400">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500 border-gray-400 dark:text-[#969696] dark:border-[#3c3c3c]">
                        Draft
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {currentTitle || 'Untitled'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-[#969696] mt-1">
                      {currentContent ? `${currentContent.replace(/<[^>]*>/g, '').length} characters` : '0 characters'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Actions */}
        <div className="flex-shrink-0 h-14 bg-gray-50 dark:bg-[#252526] border-t border-gray-200 dark:border-[#3c3c3c] flex items-center justify-end px-4 gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-8 px-4 text-sm rounded text-gray-700 dark:text-[#cccccc] hover:bg-gray-100 dark:hover:bg-[#3c3c3c] border border-gray-200 dark:border-[#3c3c3c] bg-white dark:bg-[#1e1e1e] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || isPreviewMode}
            className="h-8 px-6 text-sm rounded flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="h-3.5 w-3.5" />
                {mode === 'create' ? 'Creating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                {mode === 'create' ? 'Create Patch Update' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
