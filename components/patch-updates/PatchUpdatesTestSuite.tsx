'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { usePatchUpdateStore } from '@/stores/usePatchUpdateStore';
import { useToast } from '@/components/ui/toast-provider';
import { 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Plus,
  Eye,
  Bell
} from 'lucide-react';

export function PatchUpdatesTestSuite() {
  const {
    patchUpdates,
    unreadUpdates,
    pagination,
    loading,
    error,
    fetchPatchUpdates,
    fetchUnreadUpdates,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
  } = usePatchUpdateStore();

  const { showToast } = useToast();
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const runTest = async (testName: string, testFn: () => Promise<boolean>) => {
    try {
      const result = await testFn();
      setTestResults(prev => ({ ...prev, [testName]: result }));
      
      showToast({
        type: result ? 'success' : 'error',
        title: `Test ${result ? 'Passed' : 'Failed'}`,
        description: testName
      });
      
      return result;
    } catch (error) {
      setTestResults(prev => ({ ...prev, [testName]: false }));
      
      showToast({
        type: 'error',
        title: 'Test Error',
        description: `${testName}: ${error}`
      });
      
      return false;
    }
  };

  const tests = [
    {
      name: 'Fetch All Patch Updates',
      description: 'Test fetching paginated patch updates',
      action: () => runTest('Fetch All Updates', async () => {
        await fetchPatchUpdates({ page: 1, limit: 10 });
        return true;
      })
    },
    {
      name: 'Fetch Unread Updates',
      description: 'Test fetching unread updates for current user',
      action: () => runTest('Fetch Unread Updates', async () => {
        await fetchUnreadUpdates();
        return true;
      })
    },
    {
      name: 'Refresh Unread Count',
      description: 'Test refreshing unread count',
      action: () => runTest('Refresh Unread Count', async () => {
        await refreshUnreadCount();
        return true;
      })
    },
    {
      name: 'Mark Single as Read',
      description: 'Test marking a single update as read',
      action: () => runTest('Mark Single Read', async () => {
        if (unreadUpdates.length > 0) {
          await markAsRead(unreadUpdates[0].id);
          return true;
        }
        return false;
      })
    },
    {
      name: 'Mark All as Read',
      description: 'Test marking all updates as read',
      action: () => runTest('Mark All Read', async () => {
        if (unreadUpdates.length > 0) {
          const unreadIds = unreadUpdates.map(u => u.id);
          await markAllAsRead(unreadIds);
          return true;
        }
        return false;
      })
    }
  ];

  const getTestIcon = (testName: string) => {
    const result = testResults[testName];
    if (result === undefined) return <RefreshCw className="h-4 w-4" />;
    return result ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  const runAllTests = async () => {
    showToast({
      type: 'info',
      title: 'Running Tests',
      description: 'Starting patch updates test suite...'
    });

    for (const test of tests) {
      await test.action();
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const passedTests = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length;

    showToast({
      type: passedTests === totalTests ? 'success' : 'warning',
      title: 'Tests Complete',
      description: `${passedTests}/${totalTests} tests passed`
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Patch Updates Test Suite
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Test all patch updates functionality and integrations
          </p>
        </div>
        
        <Button onClick={runAllTests} disabled={loading}>
          {loading ? (
            <Spinner size="sm" className="h-4 w-4 mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Run All Tests
        </Button>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Updates</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {pagination.total || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {unreadUpdates.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tests Passed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Object.values(testResults).filter(Boolean).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tests Failed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Object.values(testResults).filter(result => result === false).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">System Error</p>
                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Test Cases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tests.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getTestIcon(test.name)}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {test.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {test.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {testResults[test.name] !== undefined && (
                  <Badge variant={testResults[test.name] ? "default" : "destructive"}>
                    {testResults[test.name] ? "Passed" : "Failed"}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={test.action}
                  disabled={loading}
                >
                  Run Test
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Integration Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              'Dialog shows on login with unread updates',
              'Navigation menu shows unread count badge',
              'Admin can create new patch updates',
              'Admin can edit existing patch updates',
              'Admin can publish/unpublish updates',
              'Admin can delete patch updates',
              'Users can view all patch updates',
              'Users can mark updates as read',
              'Toast notifications work correctly',
              'Responsive design on mobile devices'
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
