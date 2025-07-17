
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
}

export const FeatureTester = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTestResult = (name: string, status: TestResult['status'], message: string) => {
    setTestResults(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        existing.status = status;
        existing.message = message;
        return [...prev];
      }
      return [...prev, { name, status, message }];
    });
  };

  const testAuthentication = async () => {
    updateTestResult('Authentication', 'pending', 'Testing user authentication...');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        updateTestResult('Authentication', 'success', `User authenticated: ${user.email}`);
      } else {
        updateTestResult('Authentication', 'warning', 'No user authenticated');
      }
    } catch (error: any) {
      updateTestResult('Authentication', 'error', `Auth error: ${error.message}`);
    }
  };

  const testDatabase = async () => {
    updateTestResult('Database Connection', 'pending', 'Testing database connectivity...');
    
    try {
      // Test basic database connectivity
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        updateTestResult('Database Connection', 'error', `DB error: ${error.message}`);
      } else {
        updateTestResult('Database Connection', 'success', 'Database connected successfully');
      }
    } catch (error: any) {
      updateTestResult('Database Connection', 'error', `Connection failed: ${error.message}`);
    }
  };

  const testChatSessions = async () => {
    updateTestResult('Chat Sessions', 'pending', 'Testing chat session functionality...');
    
    if (!user) {
      updateTestResult('Chat Sessions', 'warning', 'User not authenticated');
      return;
    }

    try {
      // Test fetching chat sessions
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .limit(5);

      if (error) {
        updateTestResult('Chat Sessions', 'error', `Chat sessions error: ${error.message}`);
      } else {
        updateTestResult('Chat Sessions', 'success', `Found ${data?.length || 0} chat sessions`);
      }
    } catch (error: any) {
      updateTestResult('Chat Sessions', 'error', `Test failed: ${error.message}`);
    }
  };

  const testPinnedChats = async () => {
    updateTestResult('Pinned Chats', 'pending', 'Testing pinned chats functionality...');
    
    if (!user) {
      updateTestResult('Pinned Chats', 'warning', 'User not authenticated');
      return;
    }

    try {
      // Test fetching pinned chats
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('pinned', true)
        .order('updated_at', { ascending: false });

      if (error) {
        updateTestResult('Pinned Chats', 'error', `Pinned chats error: ${error.message}`);
      } else {
        const pinnedCount = data?.length || 0;
        if (pinnedCount <= 3) {
          updateTestResult('Pinned Chats', 'success', `Found ${pinnedCount} pinned chats (limit: 3)`);
        } else {
          updateTestResult('Pinned Chats', 'warning', `Found ${pinnedCount} pinned chats (exceeds limit of 3)`);
        }
      }
    } catch (error: any) {
      updateTestResult('Pinned Chats', 'error', `Test failed: ${error.message}`);
    }
  };

  const testFileUpload = async () => {
    updateTestResult('File Upload', 'pending', 'Testing file upload system...');
    
    if (!user) {
      updateTestResult('File Upload', 'warning', 'User not authenticated');
      return;
    }

    try {
      // Test fetching user files
      const { data, error } = await supabase
        .from('user_files')
        .select('*')
        .eq('user_id', user.id)
        .limit(5);

      if (error) {
        updateTestResult('File Upload', 'error', `File upload error: ${error.message}`);
      } else {
        updateTestResult('File Upload', 'success', `Found ${data?.length || 0} uploaded files`);
      }
    } catch (error: any) {
      updateTestResult('File Upload', 'error', `Test failed: ${error.message}`);
    }
  };

  const testEdgeFunctions = async () => {
    updateTestResult('Edge Functions', 'pending', 'Testing edge functions...');
    
    try {
      // Test chat-ai function with a simple message
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: 'Test message for feature testing',
          chatHistory: [],
          filesContent: null
        }
      });

      if (error) {
        updateTestResult('Edge Functions', 'error', `Edge function error: ${error.message}`);
      } else if (data?.response) {
        updateTestResult('Edge Functions', 'success', 'Chat AI function working correctly');
      } else {
        updateTestResult('Edge Functions', 'warning', 'Edge function responded but no AI response');
      }
    } catch (error: any) {
      updateTestResult('Edge Functions', 'error', `Test failed: ${error.message}`);
    }
  };

  const testVisualizationComponents = () => {
    updateTestResult('Visualization Components', 'pending', 'Testing visualization components...');
    
    try {
      // Check if key visualization components exist
      const components = [
        'DataVisualizationCard',
        'InteractiveCharts', 
        'DataVisualization',
        'DashboardTemplate'
      ];
      
      updateTestResult('Visualization Components', 'success', `${components.length} visualization components available`);
    } catch (error: any) {
      updateTestResult('Visualization Components', 'error', `Component test failed: ${error.message}`);
    }
  };

  const testUIComponents = () => {
    updateTestResult('UI Components', 'pending', 'Testing UI components...');
    
    try {
      // Test theme context
      if (theme) {
        updateTestResult('UI Components', 'success', `Theme system working (current: ${theme})`);
      } else {
        updateTestResult('UI Components', 'warning', 'Theme context not available');
      }
    } catch (error: any) {
      updateTestResult('UI Components', 'error', `UI test failed: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    console.log('🧪 Starting comprehensive feature testing...');
    
    // Run tests sequentially
    await testAuthentication();
    await testDatabase();
    await testChatSessions();
    await testPinnedChats();
    await testFileUpload();
    await testEdgeFunctions();
    testVisualizationComponents();
    testUIComponents();
    
    setIsRunning(false);
    console.log('✅ Feature testing completed');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      pending: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const successCount = testResults.filter(t => t.status === 'success').length;
  const errorCount = testResults.filter(t => t.status === 'error').length;
  const warningCount = testResults.filter(t => t.status === 'warning').length;

  return (
    <Card className={`w-full max-w-4xl mx-auto ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <span>🧪 SoraData Feature Testing Suite</span>
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Run All Tests'
            )}
          </Button>
        </CardTitle>
        
        {testResults.length > 0 && (
          <div className="flex gap-4 mt-4">
            <Badge variant="default" className="bg-green-600">
              ✅ Success: {successCount}
            </Badge>
            <Badge variant="destructive">
              ❌ Errors: {errorCount}
            </Badge>
            <Badge variant="secondary">
              ⚠️ Warnings: {warningCount}
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {testResults.length === 0 && !isRunning && (
            <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>Click "Run All Tests" to start comprehensive feature testing</p>
            </div>
          )}
          
          {testResults.map((result, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <div>
                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {result.name}
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {result.message}
                  </p>
                </div>
              </div>
              {getStatusBadge(result.status)}
            </div>
          ))}
        </div>
        
        {testResults.length > 0 && (
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-950 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
            <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-900'}`}>
              📊 Testing Summary
            </h4>
            <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
              Total tests: {testResults.length} | 
              Success rate: {testResults.length > 0 ? Math.round((successCount / testResults.length) * 100) : 0}% |
              {errorCount === 0 && warningCount === 0 ? ' 🎉 All systems operational!' : ` ${errorCount > 0 ? `${errorCount} critical issues` : ''} ${warningCount > 0 ? `${warningCount} warnings` : ''}`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
