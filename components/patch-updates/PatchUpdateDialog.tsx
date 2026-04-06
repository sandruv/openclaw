'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { usePatchUpdateStore } from '@/stores/usePatchUpdateStore';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { FormattedContent } from './helpers/FormattedContent';
import { PatchUpdateDialogSkeleton } from './loaders/PatchUpdateSkeletons';
import { useRouter } from 'next/navigation';
import { ScrollText } from 'lucide-react';
import { formatDateTime } from '@/lib/dateTimeFormat';
import { patchUpdateHelpers } from '@/constants/colors';
import { cn } from '@/lib/utils';

interface PatchUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoShow?: boolean; // Whether to auto-show when there are unread updates
}

export function PatchUpdateDialog({ open, onOpenChange, autoShow = false }: PatchUpdateDialogProps) {
  const router = useRouter();
  const {
    unreadUpdates,
    unreadLoading,
    fetchUnreadUpdates,
    markAsRead,
    markAllAsRead,
    markReadLoading,
  } = usePatchUpdateStore();

  const [selectedUpdateId, setSelectedUpdateId] = useState<number | null>(null);
  const [imageDialog, setImageDialog] = useState<{ open: boolean; src: string; alt: string }>({
    open: false,
    src: "",
    alt: ""
  });
  // Fetch unread updates when dialog opens
  useEffect(() => {
    if (open) {
      fetchUnreadUpdates();
    }
  }, [open, fetchUnreadUpdates]);

  const handleMarkAsRead = async (updateId: number) => {
    setSelectedUpdateId(updateId);
    await markAsRead(updateId);
    setSelectedUpdateId(null);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    onOpenChange(false);
  };

  // Handle opening the image dialog
  const handleImageClick = (src: string, alt: string = "Image") => {
    setImageDialog({
      open: true,
      src,
      alt
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} modal>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-0 gap-0 focus:visible:ring-0" hideCloseButton>
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 p-5 border-b">
            <DialogTitle className="text-xl font-semibold flex">
              <ScrollText className="mr-2 mt-1" />
              Patch Updates
            </DialogTitle>
            <Button 
              onClick={() => {
                onOpenChange(false);
                // Navigate to full patch updates page use router
                router.push('/patch-updates');
              }}
              disabled={unreadLoading || markReadLoading}
              variant="outline"
              size="sm"
            >
              View All Updates
            </Button>
          </DialogHeader>

        {unreadLoading ? (
          <PatchUpdateDialogSkeleton count={3} />
        ) : unreadUpdates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              All caught up!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You have no unread patch updates.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto styled-scrollbar p-5 mt-0">
              {unreadUpdates.map((update, index) => (
                <div key={update.id}>
                  <div className={cn(patchUpdateHelpers.getPriorityColorOnly(update.priority), "rounded-lg p-4 border border-[1px] border-gray-200 border-l-4", `border-l-${patchUpdateHelpers.getPriorityColorOnly(update.priority)}`, index === unreadUpdates.length - 1 ? "mb-0" : "mb-4")}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {update.title}
                        </h3>
                        <div className="flex items-center space-x-2 ml-3">
                          {update.version && (
                            <Badge variant="secondary" className="text-xs">
                              v{update.version}
                            </Badge>
                          )}

                          <Badge 
                            className={`${patchUpdateHelpers.getPriorityColor(update.priority)} text-xs border-0`}
                            variant="outline"
                          >
                            {patchUpdateHelpers.formatPriority(update.priority)}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        {formatDateTime(update.created_at)}
                      </p>
                    </div>                    

                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed pl-4">
                      <FormattedContent 
                        content={update.content} 
                        onImageClick={handleImageClick}
                        compact={true}
                        maxLength={300}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
           
            <div className="flex items-center justify-between p-5 border-t">
              <div></div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markReadLoading}
                className="text-xs"
              >
                {markReadLoading ? 'Marking...' : 'Mark all as read'}
              </Button>
            </div>
          </>
        )}
        </DialogContent>
      </Dialog>
    </>
  );
}
