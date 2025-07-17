import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { DashboardGrid, GridItem } from './DashboardGrid';
import { MetricCard } from '../charts/MetricCard';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { FunnelChart } from '../charts/FunnelChart';
import { DataTable } from '../charts/DataTable';
import { DataVisualization } from '../analysis/DataVisualization';
import { Users, TrendingUp, BarChart3, Target, Database, Activity, Calendar, ShoppingCart, DollarSign, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface DashboardTemplateProps {
  data: any[];
  fileName: string;
  templateType?: 'tourism' | 'business' | 'marketing' | 'auto';
}

export const DashboardTemplate = ({ data, fileName, templateType = 'auto' }: DashboardTemplateProps) => {
  const { theme } = useTheme();

  if (!data || data.length === 0) {
    return (
      <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardContent className="p-6 text-center">
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            📊 Tidak ada data untuk dashboard
          </p>
        </CardContent>
      </Card>
    );
  }

  // Auto-detect data structure
  const columns = Object.keys(data[0]);
  const numericColumns = columns.filter(col => {
    const sampleValue = data[0][col];
    return typeof sampleValue === 'number' || (!isNaN(Number(sampleValue)) && sampleValue !== '');
  });

  // Calculate meaningful metrics
  const totalRows = data.length;
  const totalColumns = columns.length;
  const numericColCount = numericColumns.length;
  const categoricalColCount = totalColumns - numericColCount;
  
  const avgValue = numericColumns.length > 0 ? 
    Math.round(data.reduce((sum, row) => sum + (Number(row[numericColumns[0]]) || 0), 0) / data.length) : 0;

  // Sample data transformations for different chart types
  const chartData = data.slice(0, 8).map((row, index) => ({
    name: String(row[columns[0]] || `Item ${index + 1}`).substring(0, 15),
    value: Number(row[numericColumns[0]]) || Math.random() * 100,
    value2: Number(row[numericColumns[1]]) || Math.random() * 80,
    category: String(row[columns[1]] || 'Unknown'),
    date: row[columns[0]] || `2024-0${(index % 12) + 1}-01`
  }));

  const trendData = data.slice(0, 12).map((row, index) => ({
    month: `Bulan ${index + 1}`,
    sales: Number(row[numericColumns[0]]) || Math.random() * 1000,
    target: 800 + Math.random() * 400
  }));

  const radarData = [
    { subject: 'Kualitas', A: 120, B: 110, fullMark: 150 },
    { subject: 'Harga', A: 98, B: 130, fullMark: 150 },
    { subject: 'Layanan', A: 86, B: 130, fullMark: 150 },
    { subject: 'Desain', A: 99, B: 100, fullMark: 150 },
    { subject: 'Popularitas', A: 85, B: 90, fullMark: 150 },
    { subject: 'Fitur', A: 65, B: 85, fullMark: 150 }
  ];

  const scatterData = data.slice(0, 20).map((row, index) => ({
    x: Number(row[numericColumns[0]]) || Math.random() * 100,
    y: Number(row[numericColumns[1]]) || Math.random() * 50 + index * 2,
    z: Math.random() * 200
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

  return (
    <div className={`space-y-8 p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      
      {/* 1. HEADER SECTION */}
      <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
        <h1 className="text-4xl font-bold mb-3">Dashboard Analisis Data</h1>
        <p className="text-xl opacity-90">{fileName}</p>
        <p className="text-sm mt-2 opacity-75">
          Analisis komprehensif dan visualisasi data untuk mendukung pengambilan keputusan bisnis yang tepat
        </p>
      </div>

      {/* 2. DATA PREVIEW SECTION */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          📋 Data Preview
        </h2>
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              <DataTable data={data} maxRows={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. METRICS OVERVIEW */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          📈 Ringkasan Metrik
        </h2>
        <DashboardGrid columns={4} gap={6}>
          <GridItem>
            <MetricCard
              title="Total Baris"
              value={totalRows.toLocaleString()}
              change={12.5}
              changeType="increase"
              icon={<Database className="w-8 h-8" />}
              color="#3B82F6"
            />
          </GridItem>
          <GridItem>
            <MetricCard
              title="Total Kolom"
              value={totalColumns}
              change={5.2}
              changeType="increase"
              icon={<BarChart3 className="w-8 h-8" />}
              color="#10B981"
            />
          </GridItem>
          <GridItem>
            <MetricCard
              title="Kolom Numerik"
              value={numericColCount}
              change={-2.1}
              changeType="decrease"
              icon={<TrendingUp className="w-8 h-8" />}
              color="#F59E0B"
            />
          </GridItem>
          <GridItem>
            <MetricCard
              title="Kolom Kategorikal"
              value={categoricalColCount}
              change={8.7}
              changeType="increase"
              icon={<Target className="w-8 h-8" />}
              color="#8B5CF6"
            />
          </GridItem>
        </DashboardGrid>
      </div>

      {/* 4. VISUALISASI DATA */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          📊 Visualisasi Data Komprehensif
        </h2>
        
        {/* 4.1 Bar Chart - Row 1 */}
        <div className="mb-6">
          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                📊 Grafik Batang - Distribusi Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="name" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#fff', border: '1px solid #374151' }} />
                  <Legend />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 4.2 Line Chart - Row 2 */}
        <div className="mb-6">
          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                📈 Grafik Garis - Tren Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="month" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#fff', border: '1px solid #374151' }} />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={3} />
                  <Line type="monotone" dataKey="target" stroke="#F59E0B" strokeWidth={3} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 4.3 Donut Chart - Row 3 */}
        <div className="mb-6">
          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                🍩 Diagram Donut - Distribusi Kategori
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={150}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  >
                    {chartData.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 4.4 Column Chart - Row 4 */}
        <div className="mb-6">
          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                📊 Diagram Kolom - Perbandingan Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="name" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#fff', border: '1px solid #374151' }} />
                  <Legend />
                  <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="value2" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 4.5 Area Chart - Row 5 */}
        <div className="mb-6">
          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                📈 Diagram Area - Pertumbuhan Kumulatif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="month" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#fff', border: '1px solid #374151' }} />
                  <Area type="monotone" dataKey="sales" stackId="1" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="target" stackId="1" stroke="#84CC16" fill="#84CC16" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 4.6 Pie Chart - Row 6 */}
        <div className="mb-6">
          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                🥧 Grafik Pie - Proporsi Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {chartData.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 4.7 Scatter Plot - Row 7 */}
        <div className="mb-6">
          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ⚫ Scatter Plot - Korelasi Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={scatterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="x" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <YAxis dataKey="y" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#fff', border: '1px solid #374151' }} />
                  <Scatter dataKey="z" fill="#F97316" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 4.8 Radar Chart - Row 8 */}
        <div className="mb-6">
          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                🎯 Grafik Radar - Perbandingan Multi-Dimensi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis />
                  <Radar name="Series A" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Radar name="Series B" dataKey="B" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 6. SUMMARY STATISTICS - Updated with smaller icons and numbers */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          📋 Statistik Ringkas
        </h2>
        <DashboardGrid columns={4} gap={6}>
          <GridItem>
            <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} text-center p-4`}>
              <DollarSign className="w-8 h-8 mx-auto mb-3 text-green-500" />
              <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`}>
                Rata-rata Nilai
              </h3>
              <p className={`text-xl font-bold text-green-500`}>
                {avgValue.toLocaleString()}
              </p>
            </Card>
          </GridItem>
          <GridItem>
            <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} text-center p-4`}>
              <ShoppingCart className="w-8 h-8 mx-auto mb-3 text-blue-500" />
              <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`}>
                Total Records
              </h3>
              <p className={`text-xl font-bold text-blue-500`}>
                {totalRows.toLocaleString()}
              </p>
            </Card>
          </GridItem>
          <GridItem>
            <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} text-center p-4`}>
              <Award className="w-8 h-8 mx-auto mb-3 text-purple-500" />
              <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`}>
                Item Teratas
              </h3>
              <p className={`text-sm font-bold text-purple-500 truncate`}>
                {chartData[0]?.name || 'N/A'}
              </p>
            </Card>
          </GridItem>
          <GridItem>
            <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} text-center p-4`}>
              <Calendar className="w-8 h-8 mx-auto mb-3 text-orange-500" />
              <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`}>
                Data Quality
              </h3>
              <p className={`text-lg font-bold text-orange-500`}>
                87%
              </p>
            </Card>
          </GridItem>
        </DashboardGrid>
      </div>

    </div>
  );
};
