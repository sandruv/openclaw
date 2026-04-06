'use client';

import { useEffect } from 'react';
import { usePatchUpdateStore } from '@/stores/usePatchUpdateStore';
import { patchUpdateService } from '@/services/patchUpdateService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export function PatchUpdatesDebug() {
  const {
    patchUpdates,
    pagination,
    loading,
    error,
    fetchPatchUpdates,
  } = usePatchUpdateStore();

  useEffect(() => {
    console.log('PatchUpdatesDebug: Component mounted');
    fetchPatchUpdates({ page: 1, limit: 10 });
  }, [fetchPatchUpdates]);

  useEffect(() => {
    console.log('PatchUpdatesDebug: State changed', {
      patchUpdatesCount: patchUpdates.length,
      pagination,
      loading,
      error,
    });
  }, [patchUpdates, pagination, loading, error]);

  const handleRefresh = () => {
    console.log('PatchUpdatesDebug: Manual refresh triggered');
    fetchPatchUpdates({ page: 1, limit: 10 });
  };

  const handleCreateSampleData = async () => {
    try {
      console.log('Creating sample patch update...');
      const sampleData = {
        title: 'Sample Patch Update',
        content: '<p>This is a sample patch update created for testing purposes.</p>',
        version: '1.0.0',
        priority: 'medium' as const,
        published: true,
      };
      
      const response = await patchUpdateService.createPatchUpdate(sampleData);
      console.log('Sample data created:', response);
      
      // Refresh the list
      fetchPatchUpdates({ page: 1, limit: 10 });
    } catch (error) {
      console.error('Error creating sample data:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Patch Updates Debug
            <div className="flex space-x-2">
              <Button onClick={handleCreateSampleData} size="sm" variant="outline">
                Create Sample Data
              </Button>
              <Button onClick={handleRefresh} disabled={loading} size="sm">
                {loading ? (
                  <Spinner size="sm" className="h-4 w-4" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Loading State */}
          <div className="flex items-center space-x-2">
            <span className="font-medium">Loading:</span>
            {loading ? (
              <div className="flex items-center space-x-1 text-blue-600">
                <Spinner size="sm" className="h-4 w-4" />
                <span>True</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>False</span>
              </div>
            )}
          </div>

          {/* Error State */}
          <div className="flex items-center space-x-2">
            <span className="font-medium">Error:</span>
            {error ? (
              <div className="flex items-center space-x-1 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>None</span>
              </div>
            )}
          </div>

          {/* Data Count */}
          <div className="flex items-center space-x-2">
            <span className="font-medium">Patch Updates Count:</span>
            <span className="text-lg font-bold">{patchUpdates.length}</span>
          </div>

          {/* Pagination Info */}
          <div className="space-y-2">
            <span className="font-medium">Pagination:</span>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
              <div>Page: {pagination.page}</div>
              <div>Limit: {pagination.limit}</div>
              <div>Total: {pagination.total}</div>
              <div>Total Pages: {pagination.totalPages}</div>
            </div>
          </div>

          {/* Raw Data */}
          {patchUpdates.length > 0 && (
            <div className="space-y-2">
              <span className="font-medium">Sample Data:</span>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm max-h-40 overflow-y-auto">
                <pre>{JSON.stringify(patchUpdates[0], null, 2)}</pre>
              </div>
            </div>
          )}

          {/* All Updates List */}
          {patchUpdates.length > 0 && (
            <div className="space-y-2">
              <span className="font-medium">All Updates:</span>
              <div className="space-y-1">
                {patchUpdates.map((update) => (
                  <div key={update.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <span className="font-medium">{update.title}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                        ({update.priority})
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {update.published ? 'Published' : 'Draft'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Console Log Button */}
          <Button 
            onClick={() => {
              console.log('Full Store State:', {
                patchUpdates,
                pagination,
                loading,
                error,
              });
            }}
            variant="outline"
            size="sm"
          >
            Log State to Console
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
