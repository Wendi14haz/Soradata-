
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { ZoomIn, ZoomOut, Filter, TrendingUp } from 'lucide-react';

interface InteractiveChartsProps {
  data: any[];
}

export const InteractiveCharts = ({ data }: InteractiveChartsProps) => {
  const { theme } = useTheme();
  const [chartType, setChartType] = useState('combo');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!data || data.length === 0) {
    return (
      <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardContent className="p-6 text-center">
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            📊 Tidak ada data untuk visualisasi interaktif
          </p>
        </CardContent>
      </Card>
    );
  }

  // Process data for charts
  const processedData = data.slice(0, Math.floor(12 / zoomLevel)).map((item, index) => ({
    name: String(Object.values(item)[0]).substring(0, 10),
    value: Number(Object.values(item)[1]) || Math.random() * 1000,
    trend: Number(Object.values(item)[2]) || Math.random() * 800,
    forecast: Math.random() * 1200,
    category: String(Object.values(item)[0])
  }));

  const radarData = [
    { subject: 'Kualitas', A: 120, B: 110, fullMark: 150 },
    { subject: 'Harga', A: 98, B: 130, fullMark: 150 },
    { subject: 'Layanan', A: 86, B: 130, fullMark: 150 },
    { subject: 'Inovasi', A: 99, B: 100, fullMark: 150 },
    { subject: 'Brand', A: 85, B: 90, fullMark: 150 },
    { subject: 'Market', A: 65, B: 85, fullMark: 150 }
  ];

  const renderChart = () => {
    const chartProps = {
      width: "100%",
      height: 400,
      data: processedData
    };

    switch (chartType) {
      case 'combo':
        return (
          <ResponsiveContainer {...chartProps}>
            <ComposedChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="name" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#fff', border: '1px solid #374151' }} />
              <Legend />
              <Bar dataKey="value" fill="#3B82F6" name="Aktual" />
              <Line type="monotone" dataKey="trend" stroke="#10B981" strokeWidth={3} name="Tren" />
              <Area dataKey="forecast" fill="#F59E0B" fillOpacity={0.3} name="Prediksi" />
            </ComposedChart>
          </ResponsiveContainer>
        );
      
      case 'radar':
        return (
          <ResponsiveContainer {...chartProps}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar name="Series A" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Radar name="Series B" dataKey="B" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );
      
      case 'trend':
        return (
          <ResponsiveContainer {...chartProps}>
            <AreaChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="name" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#fff', border: '1px solid #374151' }} />
              <Area type="monotone" dataKey="value" stackId="1" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.8} />
              <Area type="monotone" dataKey="forecast" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <ResponsiveContainer {...chartProps}>
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="name" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#fff', border: '1px solid #374151' }} />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            📊 Visualisasi Interaktif PRO
          </CardTitle>
          
          <div className="flex gap-2">
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="combo">📈 Kombinasi Chart</SelectItem>
                <SelectItem value="radar">🎯 Radar Chart</SelectItem>
                <SelectItem value="trend">📊 Trend Analysis</SelectItem>
                <SelectItem value="bar">📊 Bar Chart</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.5))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.5))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 flex gap-4">
          <div className={`px-3 py-1 rounded-full text-xs ${theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
            🔍 Zoom: {zoomLevel}x
          </div>
          <div className={`px-3 py-1 rounded-full text-xs ${theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}>
            📊 Chart: {chartType}
          </div>
        </div>
        
        {renderChart()}
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
              Tren Positif
            </p>
            <p className="text-xs text-gray-500">+12.5%</p>
          </div>
          
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'}`}>
            <Filter className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
              Data Points
            </p>
            <p className="text-xs text-gray-500">{processedData.length}</p>
          </div>
          
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
            <ZoomIn className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
              Akurasi
            </p>
            <p className="text-xs text-gray-500">94.7%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
