
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeatureTester } from './FeatureTester';
import { ManualTestingGuide } from './ManualTestingGuide';
import { useTheme } from '@/contexts/ThemeContext';

export const TestingDashboard = () => {
  const { theme } = useTheme();
  
  return (
    <div className="w-full space-y-6">
      <div className="text-center mb-8">
        <h1 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          🧪 SoraData Testing Center
        </h1>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Comprehensive testing suite for all SoraData features and functionality
        </p>
      </div>
      
      <Tabs defaultValue="automated" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="automated" className="flex items-center gap-2">
            🤖 Automated Tests
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            📋 Manual Testing
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="automated" className="space-y-4">
          <FeatureTester />
        </TabsContent>
        
        <TabsContent value="manual" className="space-y-4">
          <ManualTestingGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
};
