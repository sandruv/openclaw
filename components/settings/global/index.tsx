'use client'

import React, { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast-provider';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, XCircle, Info, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalSettings() {
  const { 
    globalSettings, 
    fetchGlobalSettings, 
    updateGlobalSetting,
    globalSettingsError,
    clearGlobalSettingsError,
    isLoadingGlobalSettings 
  } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      await fetchGlobalSettings();
      setIsLoading(false);
    };

    loadSettings();
    
    // Check if user is admin (role_id === 3)
    try {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setIsAdmin(userData?.role_id === 3);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  }, [fetchGlobalSettings]);

  const handleUpdateSetting = async (key: string, value: any) => {
    try {
      const success = await updateGlobalSetting(key, value);
      
      if (success) {
        showToast({
          title: 'Setting Updated',
          description: 'Global setting has been updated successfully.',
          type: 'success',
        });
      }
    } catch (error) {
      // Error is already handled in the store
      console.error('Error in component:', error);
    }
  };

  const getSettingDescription = (key: string): string => {
    switch (key) {
      case 'checkUserHasInProgress':
        return 'Check if user has in-progress tasks before creating a new one';
      case 'validateFormContent':
        return 'Validate content in private notes and email forms';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-[1fr,auto,1fr] gap-8 relative h-[calc(100vh-130px)] max-w-[1000px]">
        <div className="space-y-4 p-6">
          <Skeleton className="h-6 w-[150px] mb-6" />
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
              <Skeleton className="h-6 w-[50px] mt-2" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-[180px]" />
              <Skeleton className="h-4 w-[280px]" />
              <Skeleton className="h-6 w-[50px] mt-2" />
            </div>
          </div>
        </div>
        <Separator orientation="vertical" className="h-full min-h-[500px]" />
        <div className="space-y-4 p-6 pl-2">
          <div className="space-y-4">
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[80px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[1fr,auto,1fr] gap-8 relative h-[calc(100vh-130px)] max-w-[1000px]">
      <div className="space-y-4 p-6">
        <h3 className="text-lg font-medium">Global Settings</h3>
        
        {/* Error display */}
        {globalSettingsError && (
          <Alert variant="destructive" className="border-2 border-red-500 bg-red-50 dark:bg-red-950/30 mb-4">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <div>
                  <AlertTitle className="text-red-700 dark:text-red-400">Settings Error</AlertTitle>
                  <AlertDescription className="text-red-600 dark:text-red-300">
                    {globalSettingsError}
                  </AlertDescription>
                </div>
              </div>
            </div>
            <div className="mt-2 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchGlobalSettings()}
                className="text-xs border-red-300 hover:bg-red-100 dark:border-red-700 dark:hover:bg-red-900/50"
                disabled={isLoadingGlobalSettings}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isLoadingGlobalSettings ? 'animate-spin' : ''}`} />
                Refresh Settings
              </Button>
            </div>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="check-in-progress">Check User In-Progress Tasks</Label>
              <p className="text-sm text-muted-foreground">Warn users when they try to create a new task while having in-progress tasks</p>
            </div>
            <Switch
              id="check-in-progress"
              disabled={!!globalSettingsError || isLoadingGlobalSettings || !isAdmin}
              checked={globalSettings.checkUserHasInProgress}
              onCheckedChange={(checked) => handleUpdateSetting('checkUserHasInProgress', checked)}
              className="data-[state=checked]:bg-lime-600"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="validate-form">Validate Form Content</Label>
              <p className="text-sm text-muted-foreground">Validate content in private notes and email forms before submission with AI. </p>
              <p className="text-sm text-muted-foreground"><span className="bg-gray-600 rounded p-1 px-2 text-white text-xs">Note:</span> It may make the form submission slower.</p>
            </div>
            <Switch
              id="validate-form"
              disabled={!!globalSettingsError || isLoadingGlobalSettings || !isAdmin}
              checked={globalSettings.validateFormContent}
              onCheckedChange={(checked) => handleUpdateSetting('validateFormContent', checked)}
              className="data-[state=checked]:bg-lime-600"
            />
          </div>
        </div>
      </div>

      <Separator orientation="vertical" className="h-full min-h-[500px]" />

      <div className="space-y-4 p-6 pl-2">
        <div className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-400 dark:text-blue-400" />
            <AlertTitle className="text-blue-700 dark:text-blue-300">About Global Settings</AlertTitle>
            <AlertDescription className="text-blue-600 dark:text-blue-400">
              <p className="mb-2">
                Global settings affect all users of the application. Changes made here will be applied system-wide.
              </p>
              <p className="mb-2">
                These settings are stored in the database and synchronized across all clients in real-time.
              </p>
            </AlertDescription>
          </Alert>
          
          {!isAdmin && (
            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800 mt-4">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-700 dark:text-amber-300">Administrator Access Required</AlertTitle>
              <AlertDescription className="text-amber-600 dark:text-amber-400">
                Only administrators can modify these settings. You are currently viewing these settings in read-only mode.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
