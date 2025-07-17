
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database, FileText, Download, Trash2, Calendar, BarChart3, Eye } from 'lucide-react';
import { DataVisualizationCard } from '@/components/visualization/DataVisualizationCard';

interface DataFile {
  id: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  file_metadata?: any;
}

export const DataContent = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [dataFiles, setDataFiles] = useState<DataFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<DataFile | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserFiles();
    }
  }, [user]);

  const fetchUserFiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_files')
        .select('*')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false });

      if (error) throw error;

      setDataFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Gagal memuat file tersimpan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
    
    const dateStr = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/\s/g, '-');
    
    return `${timeStr} • ${dateStr}`;
  };

  const handleDownload = (file: DataFile) => {
    try {
      let content = '';
      let mimeType = 'text/plain';
      let fileName = file.original_filename;

      if (file.file_metadata?.content) {
        // If it's JSON data, convert to CSV format for better readability
        try {
          const parsedData = JSON.parse(file.file_metadata.content);
          if (Array.isArray(parsedData)) {
            const headers = Object.keys(parsedData[0] || {});
            const csvContent = [
              headers.join(','),
              ...parsedData.map(row => 
                headers.map(header => `"${row[header] || ''}"`).join(',')
              )
            ].join('\n');
            content = csvContent;
            mimeType = 'text/csv';
            fileName = fileName.replace(/\.[^/.]+$/, '') + '_processed.csv';
          } else {
            content = JSON.stringify(parsedData, null, 2);
            mimeType = 'application/json';
          }
        } catch {
          content = file.file_metadata.content;
        }
      } else {
        content = `File: ${file.original_filename}\nUploaded: ${formatDateTime(file.upload_date)}\nSize: ${formatFileSize(file.file_size)}`;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "💾 File Diunduh!",
        description: `${fileName} berhasil diunduh`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengunduh file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    try {
      const { error } = await supabase
        .from('user_files')
        .delete()
        .eq('id', fileId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setDataFiles(prev => prev.filter(f => f.id !== fileId));
      
      toast({
        title: "🗑️ File Dihapus!",
        description: `${fileName} berhasil dihapus`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus file",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className={`border-b p-6 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-2xl font-bold flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Database className="h-6 w-6 text-blue-500" />
            Data Tersimpan
          </h2>
        </div>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {dataFiles.length > 0 
            ? `${dataFiles.length} file data tersimpan. Kelola dan unduh data yang telah Anda upload.`
            : 'Belum ada data tersimpan. Upload file untuk mulai menyimpan data.'
          }
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {dataFiles.length === 0 ? (
          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} max-w-md mx-auto`}>
            <CardContent className="p-8 text-center">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Database className={`w-10 h-10 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Belum Ada Data Tersimpan
              </h3>
              <p className={`mb-6 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Upload file data Anda untuk mulai menganalisis dan menyimpan hasil analisis.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {dataFiles.map(file => (
              <Card 
                key={file.id}
                className={`transition-all duration-200 hover:shadow-lg ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
                      }`}>
                        <FileText className="w-6 h-6 text-blue-500" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {file.original_filename}
                        </h4>
                        
                        <div className="flex flex-col gap-1 mt-2 text-sm">
                          <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Calendar className="w-3 h-3" />
                            {formatDateTime(file.upload_date)}
                          </span>
                          
                          <div className="flex items-center gap-4">
                            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <BarChart3 className="w-3 h-3" />
                              {formatFileSize(file.file_size)}
                            </span>
                            
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {file.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedFile(file)}
                        className={`${
                          theme === 'dark' 
                            ? 'border-blue-600 text-blue-400 hover:bg-blue-900/20' 
                            : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Lihat
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file)}
                        className={`${
                          theme === 'dark' 
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Unduh
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(file.id, file.original_filename)}
                        className={`${
                          theme === 'dark' 
                            ? 'border-red-600 text-red-400 hover:bg-red-900/20' 
                            : 'border-red-300 text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Data Visualization Modal/Panel */}
      {selectedFile && selectedFile.file_metadata?.processedData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-6xl w-full max-h-[90vh] overflow-y-auto rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div className={`sticky top-0 p-4 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} flex justify-between items-center`}>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Visualisasi Data: {selectedFile.original_filename}
              </h3>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedFile(null)}
                className={theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
              >
                ✕
              </Button>
            </div>
            <div className="p-4">
              <DataVisualizationCard
                data={selectedFile.file_metadata.processedData}
                fileName={selectedFile.original_filename}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
