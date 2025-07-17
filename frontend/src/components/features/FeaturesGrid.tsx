
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomPrompts } from './CustomPrompts';
import { CollaborationSessions } from './CollaborationSessions';
import { SharedProjects } from './SharedProjects';
import { Brain, Users, Share2 } from 'lucide-react';

export const FeaturesGrid = () => {
  return (
    <div className="w-full">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-400" />
            🚀 Fitur Lanjutan SoraData
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="prompts" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-700 border border-gray-600">
              <TabsTrigger value="prompts" className="flex items-center space-x-2 data-[state=active]:bg-blue-600">
                <Brain className="w-4 h-4" />
                <span>🧠 Custom Prompts</span>
              </TabsTrigger>
              <TabsTrigger value="collaboration" className="flex items-center space-x-2 data-[state=active]:bg-green-600">
                <Users className="w-4 h-4" />
                <span>👥 Kolaborasi</span>
              </TabsTrigger>
              <TabsTrigger value="sharing" className="flex items-center space-x-2 data-[state=active]:bg-orange-600">
                <Share2 className="w-4 h-4" />
                <span>🔗 Sharing</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="prompts" className="mt-6">
              <CustomPrompts />
            </TabsContent>
            
            <TabsContent value="collaboration" className="mt-6">
              <CollaborationSessions />
            </TabsContent>
            
            <TabsContent value="sharing" className="mt-6">
              <SharedProjects />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
