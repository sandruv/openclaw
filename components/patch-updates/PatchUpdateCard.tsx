'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { usePatchUpdateStore } from '@/stores/usePatchUpdateStore';
import { patchUpdateHelpers } from '@/constants/colors';
import { PatchUpdate } from '@/services/patchUpdateService';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Info, 
  Zap, 
  Calendar,
  User,
  Eye,
  EyeOff
} from 'lucide-react';
import { FormattedContent } from './helpers/FormattedContent';

interface PatchUpdateCardProps {
  update: PatchUpdate;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export function PatchUpdateCard({ 
  update, 
  showActions = true, 
  compact = false,
  className = '' 
}: PatchUpdateCardProps) {
  const { markAsRead, markAsUnread, markReadLoading } = usePatchUpdateStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleRead = async () => {
    setIsProcessing(true);
    try {
      if (update.isRead) {
        await markAsUnread(update.id);
      } else {
        await markAsRead(update.id);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="h-4 w-4" />;
      case 'high':
        return <Zap className="h-4 w-4" />;
      case 'medium':
        return <Info className="h-4 w-4" />;
      case 'low':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };


  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      update.isRead ? 'opacity-75' : `border-l-4 border-l-${patchUpdateHelpers.getPriorityColorOnly(update.priority)}`
    } ${className}`}>
      <CardHeader style={{ paddingBottom: '0px' }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Priority Icon & Badge */}
            <div className={`p-2 rounded-full text-white ${
              patchUpdateHelpers.getPriorityColor(update.priority).split(' ')[0]
            }`}>
              {getPriorityIcon(update.priority)}
            </div>
            
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <Badge 
                  className={patchUpdateHelpers.getPriorityColor(update.priority)}
                  variant="outline"
                >
                  {patchUpdateHelpers.formatPriority(update.priority)}
                </Badge>
                {update.version && (
                  <Badge variant="secondary" className="text-xs">
                    v{update.version}
                  </Badge>
                )}
                {!update.published && (
                  <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                    Draft
                  </Badge>
                )}
                {update.isRead && (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Read
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleRead}
                disabled={markReadLoading || isProcessing}
                className="text-xs"
              >
                {isProcessing ? (
                  <Spinner size="sm" className="mr-1 h-3 w-3" />
                ) : update.isRead ? (
                  <EyeOff className="h-3 w-3 mr-1" />
                ) : (
                  <Eye className="h-3 w-3 mr-1" />
                )}
                {update.isRead ? 'Mark unread' : 'Mark read'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent style={{ paddingTop: '1rem' }}>
        {/* Title */}
        <h3 className={`font-semibold text-gray-900 dark:text-gray-100 mb-3 ${
          compact ? 'text-base' : 'text-lg'
        }`}>
          {update.title}
        </h3>

        {/* Content */}
        <div className="prose prose-sm max-w-none mb-4 text-gray-600 dark:text-gray-400">
          <FormattedContent 
            content={update.content}
            compact={compact}
            maxLength={compact ? 150 : undefined}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-4">
            {/* Author */}
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {getInitials(update.creator.first_name, update.creator.last_name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">
                {update.creator.first_name} {update.creator.last_name}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span className="text-xs">
                {format(new Date(update.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          {/* Relative time */}
          <span className="text-xs">
            {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
