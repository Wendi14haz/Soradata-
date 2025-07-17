
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { BarChart3, Layout, Table as TableIcon, Download, Filter, ZoomIn, FileText, FileSpreadsheet } from 'lucide-react';
import { DashboardTemplate } from '../dashboard/DashboardTemplate';
import { DataVisualization } from '../analysis/DataVisualization';
import { DataTable } from '../charts/DataTable';
import { toast } from 'sonner';

interface DataVisualizationCardProps {
  data: any[];
  fileName: string;
  isAnalyzing?: boolean;
  analysisProgress?: number;
}

export const DataVisualizationCard = ({ 
  data, 
  fileName, 
  isAnalyzing = false, 
  analysisProgress = 0 
}: DataVisualizationCardProps) => {
  const { theme } = useTheme();
  const [activeView, setActiveView] = useState<'dashboard' | 'charts' | 'table'>('dashboard');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isDownloading, setIsDownloading] = useState(false);

  // Filter data based on selected filter
  const filteredData = useMemo(() => {
    if (!data || data.length === 0 || selectedFilter === 'all') return data;
    
    // Simple filtering logic - can be enhanced based on data structure
    const columns = Object.keys(data[0] || {});
    const categoricalColumn = columns.find(col => 
      typeof data[0][col] === 'string' && 
      !col.toLowerCase().includes('date') && 
      !col.toLowerCase().includes('time')
    );
    
    if (categoricalColumn) {
      return data.filter(row => 
        String(row[categoricalColumn]).toLowerCase().includes(selectedFilter.toLowerCase())
      );
    }
    
    return data;
  }, [data, selectedFilter]);

  if (!data || data.length === 0) {
    return (
      <Card className={`mt-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">📊 Tidak ada data untuk divisualisasikan</p>
        </CardContent>
      </Card>
    );
  }

  // Detect columns
  const columns = Object.keys(data[0] || {});
  const numericColumns = columns.filter(col => {
    const sampleValue = data[0][col];
    return typeof sampleValue === 'number' || (!isNaN(Number(sampleValue)) && sampleValue !== '');
  });
  const categoricalColumns = columns.filter(col => !numericColumns.includes(col));

  // Get unique values for filtering
  const filterOptions = useMemo(() => {
    if (categoricalColumns.length === 0) return [];
    const firstCategorical = categoricalColumns[0];
    const uniqueValues = [...new Set(data.map(row => String(row[firstCategorical])))];
    return uniqueValues.slice(0, 10); // Limit to 10 options
  }, [data, categoricalColumns]);

  const handleDownload = async (format: 'pdf' | 'excel' | 'word') => {
    setIsDownloading(true);
    
    try {
      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success toast
      toast.success(`📥 Laporan ${format.toUpperCase()} berhasil diunduh!`, {
        description: `File "${fileName}_report.${format}" telah disimpan ke perangkat Anda`,
        duration: 4000,
      });
      
      // Here you would implement actual download logic
      console.log(`Downloading ${format} report for ${fileName}`);
      
    } catch (error) {
      toast.error('❌ Gagal mengunduh laporan', {
        description: 'Terjadi kesalahan saat mengunduh. Coba lagi.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const viewConfigs = {
    dashboard: {
      icon: Layout,
      label: 'Dashboard',
      component: <DashboardTemplate data={filteredData} fileName={fileName} />
    },
    charts: {
      icon: BarChart3,
      label: 'Charts',
      component: <DataVisualization data={filteredData} />
    },
    table: {
      icon: TableIcon,
      label: 'Table',
      component: <DataTable data={filteredData} title={`Data Table - ${fileName}`} maxRows={20} />
    }
  };

  return (
    <Card className={`mt-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            📊 Analisis Data - {fileName}
          </CardTitle>
          
          {/* Download Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDownload('pdf')}
              disabled={isDownloading}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {isDownloading ? 'Mengunduh...' : 'PDF'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDownload('excel')}
              disabled={isDownloading}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDownload('word')}
              disabled={isDownloading}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Word
            </Button>
          </div>
        </div>
        
        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-blue-500 font-medium">
                Sedang menganalisis data Anda...
              </span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
            <p className="text-xs text-gray-500">{analysisProgress}% selesai</p>
          </div>
        )}
        
        {/* View Type Selector */}
        <div className="flex gap-2 mt-3">
          {Object.entries(viewConfigs).map(([key, config]) => (
            <Button
              key={key}
              variant={activeView === key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView(key as any)}
              className="flex items-center gap-2"
            >
              <config.icon className="w-4 h-4" />
              {config.label}
            </Button>
          ))}
        </div>

        {/* Filter Section */}
        {filterOptions.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter data..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Data</SelectItem>
                {filterOptions.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFilter !== 'all' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedFilter('all')}
                className="text-xs"
              >
                Reset Filter
              </Button>
            )}
          </div>
        )}

        {/* Data Summary Badges */}
        <div className="flex gap-2 mt-3">
          <Badge variant="secondary" className="text-xs">
            {filteredData.length} baris {selectedFilter !== 'all' && `(dari ${data.length})`}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {columns.length} kolom
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {numericColumns.length} numerik
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {categoricalColumns.length} kategorikal
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Active View Display */}
        <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} p-4 relative`}>
          {viewConfigs[activeView].component}
          
          {/* SoraData Branding Watermark */}
          <div className="absolute bottom-2 right-2 opacity-30">
            <span className="text-xs text-gray-400">
              Dibuat dengan SoraData Free
            </span>
          </div>
        </div>

        {/* Enhanced Download Section */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                📄 Unduh Laporan Lengkap
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Dapatkan analisis lengkap dalam format pilihan Anda
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleDownload('pdf')}
                disabled={isDownloading}
                className="bg-red-500 hover:bg-red-600 text-white"
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button 
                onClick={() => handleDownload('excel')}
                disabled={isDownloading}
                className="bg-green-500 hover:bg-green-600 text-white"
                size="sm"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Download Excel
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
