
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Share2, Maximize2, BarChart3, LineChart, PieChart, TrendingUp } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { DataVisualization } from '@/components/analysis/DataVisualization';

interface InteractiveDataVisualizerProps {
  data: any[];
  analysisResults?: any;
}

export const InteractiveDataVisualizer = ({ data, analysisResults }: InteractiveDataVisualizerProps) => {
  const { theme } = useTheme();
  const [selectedChart, setSelectedChart] = useState('overview');

  const chartOptions = [
    { id: 'overview', label: '📊 Overview', icon: BarChart3 },
    { id: 'trends', label: '📈 Trends', icon: LineChart },
    { id: 'distribution', label: '🥧 Distribution', icon: PieChart },
    { id: 'advanced', label: '🔍 Advanced', icon: TrendingUp },
  ];

  const exportOptions = [
    { id: 'png', label: 'PNG Image', icon: '🖼️' },
    { id: 'pdf', label: 'PDF Report', icon: '📄' },
    { id: 'excel', label: 'Excel Data', icon: '📊' },
    { id: 'csv', label: 'CSV Data', icon: '📋' },
  ];

  const handleExport = (format: string) => {
    // Export functionality placeholder
    console.log(`Exporting as ${format}`);
  };

  const handleShare = () => {
    // Share functionality placeholder
    console.log('Sharing visualization');
  };

  return (
    <div className="space-y-6">
      {/* Analysis Summary */}
      {analysisResults && (
        <Card className={`${theme === 'dark' ? 'bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'}`}>
          <CardHeader>
            <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              🎯 Hasil Analisis AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`prose prose-sm max-w-none ${theme === 'dark' ? 'prose-invert' : ''}`}>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {analysisResults.analysis}
                  </pre>
                </div>
              </div>
              
              {analysisResults.suggestions && analysisResults.suggestions.length > 0 && (
                <div>
                  <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    💡 Rekomendasi Tindak Lanjut:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResults.suggestions.map((suggestion: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-purple-600/20 text-purple-300">
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visualization Controls */}
      <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              📊 Visualisasi Interaktif
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              {/* Export Dropdown */}
              <div className="relative group">
                <Button
                  variant="outline"
                  size="sm"
                  className={`${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                  <div className="py-1">
                    {exportOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleExport(option.id)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        {option.icon} {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className={`${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>

              <Button
                variant="outline"
                size="sm"
                className={`${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Fullscreen
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedChart} onValueChange={setSelectedChart}>
            <TabsList className="grid w-full grid-cols-4">
              {chartOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <TabsTrigger key={option.id} value={option.id} className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{option.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="overview" className="space-y-4">
                <DataVisualization data={data} />
              </TabsContent>
              
              <TabsContent value="trends" className="space-y-4">
                <Card className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                    <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Analisis Tren
                    </h3>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Visualisasi tren dan pola temporal akan ditampilkan di sini
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="distribution" className="space-y-4">
                <Card className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <CardContent className="p-6 text-center">
                    <PieChart className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Analisis Distribusi
                    </h3>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Distribusi data dan segmentasi akan ditampilkan di sini
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                <Card className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <CardContent className="p-6 text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                    <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Analisis Lanjutan
                    </h3>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Korelasi, clustering, dan analisis statistik lanjutan
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`${theme === 'dark' ? 'bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {data.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Total Data Points
            </div>
          </CardContent>
        </Card>
        
        <Card className={`${theme === 'dark' ? 'bg-gradient-to-br from-green-900 to-green-800 border-green-700' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'}`}>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              {data.length > 0 ? Object.keys(data[0]).length : 0}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Variables
            </div>
          </CardContent>
        </Card>
        
        <Card className={`${theme === 'dark' ? 'bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'}`}>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {analysisResults?.suggestions?.length || 0}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">
              AI Insights
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
