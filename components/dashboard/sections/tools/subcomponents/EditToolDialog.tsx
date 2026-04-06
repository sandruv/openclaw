'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tool, updateTool } from '@/services/toolService'
import { useToast } from '@/components/ui/toast-provider'
import { ChromePicker, ColorResult } from 'react-color'
import { 
  Activity, AlertCircle, Archive, ArrowRight, Bell, Bookmark, 
  Calendar, Check, Clock, Cloud, Code, Cog, Database, Download, 
  File, FileText, Folder, Globe, Heart, Home, 
  Link, Lock, Mail, Map, MessageCircle, Monitor, Moon, 
  Music, Package, Phone, PieChart, Play, Plus, Search, 
  Send, Settings, Share, ShoppingCart, Star, Sun, 
  Terminal, Trash, Upload, User, Video, Zap
} from 'lucide-react'

interface EditToolDialogProps {
  isOpen: boolean
  onClose: () => void
  tool: Tool
  onToolUpdated: () => void
}

export const EditToolDialog = ({ isOpen, onClose, tool, onToolUpdated }: EditToolDialogProps) => {
  const { showToast } = useToast()
  
  const [name, setName] = useState(tool.name)
  const [link, setLink] = useState(tool.link || '')
  const [color, setColor] = useState(tool.color || '#E2E8F0')
  const [icon, setIcon] = useState(tool.icon || '')
  const [selectedIconName, setSelectedIconName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [iconTab, setIconTab] = useState('svg')

  // Reset form when tool changes
  useEffect(() => {
    if (isOpen) {
      setName(tool.name)
      setLink(tool.link || '')
      setColor(tool.color || '#E2E8F0')
      setIcon(tool.icon || '')
      setSelectedIconName('')
      setIconTab('svg')
    }
  }, [isOpen, tool])

  // Map of Lucide icons
  const lucideIcons: { [key: string]: React.ReactElement } = {
    Activity: <Activity />,
    AlertCircle: <AlertCircle />,
    Archive: <Archive />,
    ArrowRight: <ArrowRight />,
    Bell: <Bell />,
    Bookmark: <Bookmark />,
    Calendar: <Calendar />,
    Check: <Check />,
    Clock: <Clock />,
    Cloud: <Cloud />,
    Code: <Code />,
    Cog: <Cog />,
    Database: <Database />,
    Download: <Download />,
    File: <File />,
    FileText: <FileText />,
    Folder: <Folder />,
    Globe: <Globe />,
    Heart: <Heart />,
    Home: <Home />,
    Link: <Link />,
    Lock: <Lock />,
    Mail: <Mail />,
    Map: <Map />,
    MessageCircle: <MessageCircle />,
    Monitor: <Monitor />,
    Moon: <Moon />,
    Music: <Music />,
    Package: <Package />,
    Phone: <Phone />,
    PieChart: <PieChart />,
    Play: <Play />,
    Plus: <Plus />,
    Search: <Search />,
    Send: <Send />,
    Settings: <Settings />,
    Share: <Share />,
    ShoppingCart: <ShoppingCart />,
    Star: <Star />,
    Sun: <Sun />,
    Terminal: <Terminal />,
    Trash: <Trash />,
    Upload: <Upload />,
    User: <User />,
    Video: <Video />,
    Zap: <Zap />
  }

  // Get the selected Lucide icon as SVG string
  const getSelectedIconAsSvg = (): string => {
    if (!selectedIconName) return '';
    
    // Create a temporary div to render the icon
    const tempDiv = document.createElement('div');
    const iconElement = lucideIcons[selectedIconName];
    
    if (iconElement) {
      // Clone the icon element to avoid modifying the original
      const iconClone = React.cloneElement(iconElement, {
        color: 'currentColor',
        size: 24
      });
      
      // Render the icon to string
      const ReactDOMServer = require('react-dom/server');
      const svgString = ReactDOMServer.renderToString(iconClone);
      
      return svgString;
    }
    
    return '';
  };

  // Handle icon selection
  const handleIconSelect = (iconName: string) => {
    setSelectedIconName(iconName);
    setIcon(getSelectedIconAsSvg());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      showToast({
        title: 'Error',
        description: 'Tool name is required',
        type: 'error'
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Get the final icon value
      const finalIcon = iconTab === 'lucide' && selectedIconName 
        ? getSelectedIconAsSvg() 
        : icon.trim() || null;

      // Prepare update data
      const updateData = {
        name: name.trim(),
        link: link.trim() || null,
        color: color || null,
        icon: finalIcon
      }

      const response = await updateTool(tool.id, updateData)

      if (response.status === 200) {
        showToast({
          title: 'Success',
          description: 'Tool updated successfully',
          type: 'success'
        })
        
        // Notify parent component
        onToolUpdated()
        
        // Close dialog
        onClose()
      } else {
        showToast({
          title: 'Error',
          description: response.message || 'Failed to update tool',
          type: 'error'
        })
      }
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'An unexpected error occurred',
        type: 'error'
      })
      console.error('Error updating tool:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Tool</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">
                Link
              </Label>
              <Input
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">
                Color
              </Label>
              <div className="flex items-center gap-2">
                <div 
                  className="w-10 h-10 rounded-md cursor-pointer border"
                  style={{ backgroundColor: color }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                <Input
                  id="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1"
                />
              </div>
              {showColorPicker && (
                <div className="absolute z-10 mt-2">
                  <div 
                    className="fixed inset-0" 
                    onClick={() => setShowColorPicker(false)}
                  />
                  <ChromePicker 
                    color={color} 
                    onChange={(color: ColorResult) => setColor(color.hex)} 
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>
                Icon
              </Label>
              <div className="w-full">
                <Tabs value={iconTab} onValueChange={setIconTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="lucide">Lucide Icons</TabsTrigger>
                    <TabsTrigger value="svg">Custom SVG</TabsTrigger>
                  </TabsList>
                  <TabsContent value="lucide" className="mt-2">
                    <div className="grid grid-cols-6 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                      {Object.entries(lucideIcons).map(([name, icon]) => (
                        <div 
                          key={name}
                          className={`p-2 flex flex-col items-center justify-center cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedIconName === name ? 'bg-green-100 dark:bg-green-900/30 border border-green-500' : ''}`}
                          onClick={() => handleIconSelect(name)}
                        >
                          <div className="w-8 h-8 flex items-center justify-center">
                            {icon}
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedIconName && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm">Selected:</span>
                        <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded flex items-center gap-1">
                          <div className="w-5 h-5">
                            {lucideIcons[selectedIconName]}
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="svg" className="mt-2">
                    <Input
                      id="icon"
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      placeholder="<svg>...</svg>"
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Paste custom SVG code here</p>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button className="bg-green-500 hover:bg-green-600" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Tool'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
