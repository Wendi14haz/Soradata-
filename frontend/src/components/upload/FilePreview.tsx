import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, BarChart3, TrendingUp, Search, Zap, Edit3 } from 'lucide-react';

interface FilePreviewProps {
  data: any[];
  fileName: string;
  onActionSelect: (action: string, customPrompt?: string) => void;
  error?: string;
}

export const FilePreview = ({ data, fileName, onActionSelect, error }: FilePreviewProps) => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const { theme } = useTheme();

  const actions = [
    { id: 'analyze', label: 'Analisis Data', icon: BarChart3, description: 'Dapatkan ringkasan statistik dan analisis mendalam.' },
    { id: 'find-insight', label: 'Temukan Insight', icon: Zap, description: 'Temukan pola, korelasi, dan anomali tersembunyi.' },
    { id: 'visualize', label: 'Visualisasi Data', icon: TrendingUp, description: 'Buat berbagai macam grafik dan chart secara otomatis.' },
    { id: 'explore', label: 'Eksplorasi Manual', icon: Search, description: 'Ajukan pertanyaan spesifik tentang data Anda.' },
    { id: 'custom', label: 'Kustomisasi Analisis', icon: Edit3, description: 'Tulis permintaan analisa Anda sendiri secara detail.' }
  ];

  const handleActionClick = (actionId: string) => {
    if (actionId === 'custom') {
      setSelectedAction(actionId);
    } else {
      onActionSelect(actionId);
    }
  };

  const handleCustomSubmit = () => {
    if (customPrompt.trim()) {
      onActionSelect('custom', customPrompt);
    }
  };

  // Get preview data (first 5 rows)
  const previewData = data.slice(0, 5);
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  // Styling helpers
  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const previewCardBg = isDark ? 'bg-white/5 border-gray-600' : 'bg-gray-100 border-gray-200';
  const textTitle = isDark ? 'text-white' : 'text-gray-900';
  const badgeVariant = isDark ? 'bg-blue-600/20 text-blue-300' : 'bg-blue-100 text-blue-700';
  const tableHead = isDark ? 'text-gray-300' : 'text-gray-700';
  const tableCell = isDark ? 'text-gray-200' : 'text-gray-800';
  const tableRow = isDark ? 'border-gray-700 hover:bg-gray-700/30' : 'border-gray-200 hover:bg-gray-100';
  const cardActionBg = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const buttonOutline = isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100';

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* File Info */}
      <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        <FileText className="w-4 h-4" />
        <span>{fileName}</span>
        <Badge variant="secondary" className={badgeVariant}>
          {data.length} baris, {columns.length} kolom
        </Badge>
      </div>

      {/* Error Display */}
      {error && (
        <Card className={`border-red-500 ${isDark ? 'bg-red-500/10' : 'bg-red-100'}`}>
          <CardContent className="p-4">
            <p className={`text-red-400 text-sm ${isDark ? '' : 'text-red-500'}`}>{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Data Preview */}
      {!error && (
        <Card className={previewCardBg}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-base font-medium flex items-center gap-2 ${textTitle}`}>
              <FileText className="w-4 h-4 text-blue-400" />
              Berikut adalah pratinjau dari 5 baris pertama data:
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className={tableRow}>
                    {columns.map((column, index) => (
                      <TableHead key={index} className={`${tableHead} font-medium px-3 py-2`}>
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, index) => (
                    <TableRow key={index} className={tableRow}>
                      {columns.map((column, colIndex) => (
                        <TableCell key={colIndex} className={`${tableCell} px-3 py-2`}>
                          {String(row[column] || '').substring(0, 50)}
                          {String(row[column] || '').length > 50 ? '...' : ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Selection */}
      {!error && (
        <Card className={cardBg}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-lg ${textTitle}`}>Pilih Aksi Analisis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    className={`h-auto p-4 text-left ${isDark ? 'bg-gray-700/30 border-gray-600 hover:bg-gray-600/50 hover:border-gray-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'} `}
                    onClick={() => handleActionClick(action.id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Icon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${textTitle}`}>{action.label}</div>
                        <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-xs mt-1`}>{action.description}</div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Custom Analysis Input */}
            {selectedAction === 'custom' && (
              <Card className={`mt-4 ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <CardContent className="p-4 space-y-3">
                  <label className={`text-sm font-medium ${textTitle}`}>
                    Tulis permintaan analisa kustom:
                  </label>
                  <textarea
                    placeholder="Contoh: Analisis korelasi antara umur dan pendapatan, buat insight mendalam..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={3}
                    className={`w-full rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400' : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCustomSubmit}
                      disabled={!customPrompt.trim()}
                      className={`text-white ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                      Proses Analisa
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedAction(null)}
                      className={buttonOutline}
                    >
                      Batal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
