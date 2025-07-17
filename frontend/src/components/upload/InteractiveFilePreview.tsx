
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Eye, Settings, Download, Lightbulb } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface InteractiveFilePreviewProps {
  data: any[];
  fileName: string;
  onActionSelect: (action: string, customPrompt?: string) => void;
}

export const InteractiveFilePreview = ({ data, fileName, onActionSelect }: InteractiveFilePreviewProps) => {
  const { theme } = useTheme();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  if (!data || data.length === 0) {
    return (
      <Card className={`mt-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">📄 Tidak ada data yang bisa ditampilkan</p>
        </CardContent>
      </Card>
    );
  }

  const columns = Object.keys(data[0] || {});
  const previewData = data.slice(0, 5);

  const actionButtons = [
    {
      id: 'visualize',
      label: '📊 Buat Visualisasi',
      description: 'Grafik interaktif dari data',
      color: 'bg-blue-500 hover:bg-blue-600',
      icon: BarChart3
    },
    {
      id: 'find-insight',
      label: '💡 Temukan Insight',
      description: 'Pola tersembunyi dalam data',
      color: 'bg-purple-500 hover:bg-purple-600',
      icon: Lightbulb
    },
    {
      id: 'analyze-trend',
      label: '🔍 Analisis Tren',
      description: 'Tren dan pola waktu',
      color: 'bg-green-500 hover:bg-green-600',
      icon: TrendingUp
    },
    {
      id: 'explore',
      label: '⚙️ Eksplorasi Manual',
      description: 'Analisis step-by-step',
      color: 'bg-orange-500 hover:bg-orange-600',
      icon: Settings
    }
  ];

  const handleActionClick = (actionId: string) => {
    setSelectedAction(actionId);
    onActionSelect(actionId);
  };

  return (
    <Card className={`mt-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            📁 {fileName}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              {data.length} baris
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {columns.length} kolom
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div>
          <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Apa yang ingin kamu lakukan?
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {actionButtons.map((action) => (
              <Button
                key={action.id}
                onClick={() => handleActionClick(action.id)}
                disabled={selectedAction === action.id}
                className={`${action.color} text-white text-left h-auto p-3 flex flex-col items-start space-y-1 ${
                  selectedAction === action.id ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-center gap-2 w-full">
                  <action.icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{action.label}</span>
                </div>
                <span className="text-xs opacity-90 text-left">{action.description}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Data Preview */}
        <div>
          <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            👀 Preview Data (5 baris pertama)
          </h4>
          <div className={`rounded-lg border overflow-hidden ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    {columns.slice(0, 6).map((column, index) => (
                      <th
                        key={index}
                        className={`px-3 py-2 text-left font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {column}
                      </th>
                    ))}
                    {columns.length > 6 && (
                      <th className={`px-3 py-2 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        +{columns.length - 6} lainnya
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}>
                  {previewData.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}
                    >
                      {columns.slice(0, 6).map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className={`px-3 py-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}
                        >
                          {String(row[column] || '-').length > 20
                            ? String(row[column] || '-').substring(0, 20) + '...'
                            : String(row[column] || '-')}
                        </td>
                      ))}
                      {columns.length > 6 && (
                        <td className={`px-3 py-2 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          ...
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Status */}
        {selectedAction && (
          <div className={`text-sm text-center p-2 rounded ${
            theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
          }`}>
            ⏳ Sedang memproses permintaan...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
