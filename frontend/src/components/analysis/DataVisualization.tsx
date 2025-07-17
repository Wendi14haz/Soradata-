import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';

interface DataVisualizationProps {
  data: any[] | { numericColumns: string[]; categoricalColumns: string[]; rawData: any[]; };
}

export const DataVisualization = ({ data }: DataVisualizationProps) => {
  const { theme } = useTheme();

  // Normalize data structure
  const processedData = Array.isArray(data) ? data : data.rawData || [];
  const numericColumns = Array.isArray(data) ? [] : data.numericColumns || [];
  const categoricalColumns = Array.isArray(data) ? [] : data.categoricalColumns || [];

  if (!processedData || processedData.length === 0) {
    return (
      <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
        <CardContent className="p-6 text-center">
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>📊 Tidak ada data untuk divisualisasikan</p>
        </CardContent>
      </Card>
    );
  }

  // Auto-detect columns if not provided
  const allColumns = processedData.length > 0 ? Object.keys(processedData[0]) : [];
  const detectedNumericColumns = numericColumns.length > 0 ? numericColumns : 
    allColumns.filter(col => {
      const sampleValue = processedData[0][col];
      return typeof sampleValue === 'number' || (!isNaN(Number(sampleValue)) && sampleValue !== '');
    });

  const detectedCategoricalColumns = categoricalColumns.length > 0 ? categoricalColumns :
    allColumns.filter(col => !detectedNumericColumns.includes(col));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  // DARK/LIGHT utility
  const cardBase = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200';
  const cardTitle = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSubtitle = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const statBg = [
    theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600',
    theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600',
    theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700',
    theme === 'dark' ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700'
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        {detectedNumericColumns.length > 0 && (
          <Card className={cardBase}>
            <CardHeader>
              <CardTitle className={cardTitle}>📊 Grafik Batang</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processedData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey={detectedCategoricalColumns[0] || allColumns[0]} stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#fff', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: theme === 'dark' ? '#F3F4F6' : '#333' }}
                  />
                  <Legend />
                  {detectedNumericColumns.slice(0, 3).map((col, index) => (
                    <Bar key={col} dataKey={col} fill={COLORS[index % COLORS.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Line Chart */}
        {detectedNumericColumns.length > 0 && (
          <Card className={cardBase}>
            <CardHeader>
              <CardTitle className={cardTitle}>📈 Grafik Garis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={processedData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey={detectedCategoricalColumns[0] || allColumns[0]} stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#fff', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: theme === 'dark' ? '#F3F4F6' : '#333' }}
                  />
                  <Legend />
                  {detectedNumericColumns.slice(0, 2).map((col, index) => (
                    <Line key={col} type="monotone" dataKey={col} stroke={COLORS[index % COLORS.length]} strokeWidth={3} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Pie Chart */}
        {detectedCategoricalColumns.length > 0 && (
          <Card className={cardBase}>
            <CardHeader>
              <CardTitle className={cardTitle}>🥧 Diagram Lingkaran</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={processedData.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey={detectedNumericColumns[0] || 'value'}
                    nameKey={detectedCategoricalColumns[0] || allColumns[0]}
                  >
                    {processedData.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#fff', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: theme === 'dark' ? '#F3F4F6' : '#333' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Data Summary */}
      <Card className={cardBase}>
        <CardHeader>
          <CardTitle className={cardTitle}>📋 Ringkasan Data</CardTitle>
        </CardHeader>
        <CardContent className={textSubtitle}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`text-center p-4 rounded-lg ${statBg[0]}`}>
              <p className="text-2xl font-bold">{processedData.length}</p>
              <p className="text-sm">Total Baris</p>
            </div>
            <div className={`text-center p-4 rounded-lg ${statBg[1]}`}>
              <p className="text-2xl font-bold">{allColumns.length}</p>
              <p className="text-sm">Total Kolom</p>
            </div>
            <div className={`text-center p-4 rounded-lg ${statBg[2]}`}>
              <p className="text-2xl font-bold">{detectedNumericColumns.length}</p>
              <p className="text-sm">Kolom Numerik</p>
            </div>
            <div className={`text-center p-4 rounded-lg ${statBg[3]}`}>
              <p className="text-2xl font-bold">{detectedCategoricalColumns.length}</p>
              <p className="text-sm">Kolom Kategorikal</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
