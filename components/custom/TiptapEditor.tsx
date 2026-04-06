'use client'

import React, { useState, useEffect } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import '@/styles/tiptap-editor.css'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  Image as ImageIcon,
} from 'lucide-react'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  className?: string
  minHeight?: string
  maxHeight?: string
}

export function TiptapEditor({ content, onChange, className, minHeight, maxHeight }: TiptapEditorProps) {
  const [imageUrl, setImageUrl] = useState('')
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full',
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }: { editor: Editor }) => {
      onChange(editor.getHTML())
    },
    onPaste: (event: ClipboardEvent, view: any) => {
      const items = event.clipboardData?.items
      if (items) {
        for (const item of items) {
          if (item.type.indexOf('image') === 0) {
            event.preventDefault()
            const blob = item.getAsFile()
            if (blob) {
              const reader = new FileReader()
              reader.onload = (e) => {
                const dataUrl = e.target?.result as string
                if (dataUrl && editor) {
                  editor.commands.setImage({ src: dataUrl })
                }
              }
              reader.readAsDataURL(blob)
              return true
            }
          }
        }
      }
      return false
    },
    immediatelyRender: false,
  })


  // Update editor content when prop changes
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

  const handleImageInsert = () => {
    if (imageUrl && editor) {
      editor.commands.setImage({ src: imageUrl })
      setImageUrl('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleImageInsert()
    }
  }

  if (!editor) {
    return <div>Loading editor...</div>
  }

  return (
    <div className={cn(
      "border rounded-md flex flex-col",
      "focus-within:ring-1 focus-within:ring-emerald-400 focus-within:border-emerald-400",
      className
    )}>
      <div className="border-b p-2 flex gap-2 flex-shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive('bold') && "bg-muted")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive('italic') && "bg-muted")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(editor.isActive('underline') && "bg-muted")}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editor.isActive('bulletList') && "bg-muted")}
        >
          <List className="h-4 w-4" />
        </Button>
        <HoverCard openDelay={0} closeDelay={200}>
          <HoverCardTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 p-2">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button 
                type="button"
                size="sm"
                onClick={handleImageInsert}
                disabled={!imageUrl}
              >
                Insert
              </Button>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
      <div 
        className="flex-1 cursor-text overflow-y-auto styled-scrollbar"
        style={{ minHeight, maxHeight }}
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} className="tiptap-editor-content prose max-w-none p-4 h-full" />
      </div>
    </div>
  )
}