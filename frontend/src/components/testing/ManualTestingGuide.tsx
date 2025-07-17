
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTheme } from '@/contexts/ThemeContext';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TestStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface TestCategory {
  name: string;
  icon: string;
  steps: TestStep[];
  expanded: boolean;
}

export const ManualTestingGuide = () => {
  const { theme } = useTheme();
  
  const [testCategories, setTestCategories] = useState<TestCategory[]>([
    {
      name: 'Authentication & User Management',
      icon: '🔐',
      expanded: true,
      steps: [
        { id: 'auth-1', title: 'User Registration', description: 'Register a new user account', completed: false },
        { id: 'auth-2', title: 'User Login', description: 'Login with valid credentials', completed: false },
        { id: 'auth-3', title: 'Profile Access', description: 'Access user profile and settings', completed: false },
        { id: 'auth-4', title: 'Session Persistence', description: 'Verify session persists after page refresh', completed: false }
      ]
    },
    {
      name: 'Chat System',
      icon: '💬',
      expanded: true,
      steps: [
        { id: 'chat-1', title: 'New Chat Creation', description: 'Create a new chat session', completed: false },
        { id: 'chat-2', title: 'Send Messages', description: 'Send messages and receive AI responses', completed: false },
        { id: 'chat-3', title: 'Pin Chats', description: 'Pin important chats (test max 3 limit)', completed: false },
        { id: 'chat-4', title: 'Chat History', description: 'Navigate through chat history', completed: false },
        { id: 'chat-5', title: 'Chat Titles', description: 'Verify chat titles auto-generate correctly', completed: false }
      ]
    },
    {
      name: 'File Upload & Processing',
      icon: '📁',
      expanded: true,
      steps: [
        { id: 'file-1', title: 'CSV Upload', description: 'Upload a CSV file and verify processing', completed: false },
        { id: 'file-2', title: 'Excel Upload', description: 'Upload an Excel file (.xlsx/.xls)', completed: false },
        { id: 'file-3', title: 'JSON Upload', description: 'Upload a JSON data file', completed: false },
        { id: 'file-4', title: 'Image Upload', description: 'Upload image files (PNG, JPG)', completed: false },
        { id: 'file-5', title: 'File Validation', description: 'Test file size and format validation', completed: false }
      ]
    },
    {
      name: 'Data Analysis & AI',
      icon: '🤖',
      expanded: true,
      steps: [
        { id: 'ai-1', title: 'Data Analysis Request', description: 'Ask AI to analyze uploaded data', completed: false },
        { id: 'ai-2', title: 'Insights Generation', description: 'Verify AI generates meaningful insights', completed: false },
        { id: 'ai-3', title: 'Context Awareness', description: 'Test AI remembers conversation context', completed: false },
        { id: 'ai-4', title: 'Indonesian Responses', description: 'Verify AI responds in Indonesian', completed: false }
      ]
    },
    {
      name: 'Data Visualization',
      icon: '📊',
      expanded: true,
      steps: [
        { id: 'viz-1', title: 'Chart Generation', description: 'Generate different chart types (bar, line, pie)', completed: false },
        { id: 'viz-2', title: 'Interactive Charts', description: 'Test chart interactivity and tooltips', completed: false },
        { id: 'viz-3', title: 'Chart Export', description: 'Export charts as PNG, PDF, Excel', completed: false },
        { id: 'viz-4', title: 'Dashboard View', description: 'Test dashboard template with multiple visualizations', completed: false },
        { id: 'viz-5', title: 'Responsive Design', description: 'Verify charts work on different screen sizes', completed: false }
      ]
    },
    {
      name: 'User Interface',
      icon: '🎨',
      expanded: true,
      steps: [
        { id: 'ui-1', title: 'Theme Switching', description: 'Switch between light and dark themes', completed: false },
        { id: 'ui-2', title: 'Sidebar Functionality', description: 'Test sidebar collapse/expand', completed: false },
        { id: 'ui-3', title: 'Navigation', description: 'Navigate between different sections', completed: false },
        { id: 'ui-4', title: 'Responsive Layout', description: 'Test on mobile and tablet devices', completed: false },
        { id: 'ui-5', title: 'Error Handling', description: 'Verify proper error messages display', completed: false }
      ]
    },
    {
      name: 'Data Management',
      icon: '🗄️',
      expanded: true,
      steps: [
        { id: 'data-1', title: 'File Storage', description: 'View stored files in Data section', completed: false },
        { id: 'data-2', title: 'File Download', description: 'Download processed files', completed: false },
        { id: 'data-3', title: 'File Deletion', description: 'Delete files from storage', completed: false },
        { id: 'data-4', title: 'File Metadata', description: 'Verify file information is displayed correctly', completed: false }
      ]
    }
  ]);

  const toggleCategory = (index: number) => {
    setTestCategories(prev => prev.map((cat, i) => 
      i === index ? { ...cat, expanded: !cat.expanded } : cat
    ));
  };

  const toggleStep = (categoryIndex: number, stepId: string) => {
    setTestCategories(prev => prev.map((cat, i) => 
      i === categoryIndex 
        ? {
            ...cat, 
            steps: cat.steps.map(step => 
              step.id === stepId ? { ...step, completed: !step.completed } : step
            )
          }
        : cat
    ));
  };

  const resetAllTests = () => {
    setTestCategories(prev => prev.map(cat => ({
      ...cat,
      steps: cat.steps.map(step => ({ ...step, completed: false }))
    })));
  };

  const totalSteps = testCategories.reduce((sum, cat) => sum + cat.steps.length, 0);
  const completedSteps = testCategories.reduce((sum, cat) => 
    sum + cat.steps.filter(step => step.completed).length, 0
  );
  const completionRate = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <Card className={`w-full max-w-4xl mx-auto ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            📋 Manual Testing Checklist
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Progress: {completedSteps}/{totalSteps} ({completionRate}%)
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetAllTests}
              className={theme === 'dark' ? 'border-gray-600 text-gray-300' : ''}
            >
              Reset All
            </Button>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {testCategories.map((category, categoryIndex) => (
            <div key={category.name} className={`border rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
              <button
                onClick={() => toggleCategory(categoryIndex)}
                className={`w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg ${
                  !category.expanded && 'rounded-b-lg'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{category.icon}</span>
                  <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {category.name}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {category.steps.filter(s => s.completed).length}/{category.steps.length}
                  </span>
                </div>
                {category.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              
              {category.expanded && (
                <div className="border-t border-gray-200 dark:border-gray-600">
                  {category.steps.map((step) => (
                    <div key={step.id} className="p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Checkbox
                        checked={step.completed}
                        onCheckedChange={() => toggleStep(categoryIndex, step.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <h4 className={`font-medium ${step.completed ? 'line-through text-gray-500' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {step.title}
                        </h4>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {completionRate === 100 && (
          <div className={`mt-6 p-4 rounded-lg border-2 border-green-500 ${theme === 'dark' ? 'bg-green-950' : 'bg-green-50'}`}>
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-1">
                All Tests Completed!
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                Congratulations! You've successfully tested all SoraData features.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
