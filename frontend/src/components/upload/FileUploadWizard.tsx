
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Database, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface FileUploadWizardProps {
  onFileUploaded: (fileData: any) => void;
}

export const FileUploadWizard = ({ onFileUploaded }: FileUploadWizardProps) => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Silakan login terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('upload-file', {
        body: formData,
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) throw error;

      // Save file to database
      let processedData = [];
      try {
        if (data.content && file.type === 'text/csv') {
          const lines = data.content.split('\n').filter(line => line.trim());
          if (lines.length > 1) {
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            processedData = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
              const row: any = {};
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              return row;
            });
          }
        }
      } catch (e) {
        console.warn('Could not parse CSV data:', e);
      }

      const { data: savedFile, error: saveError } = await supabase
        .from('user_files')
        .insert({
          user_id: user.id,
          original_filename: file.name,
          filename: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: `uploads/${user.id}/${Date.now()}_${file.name}`,
          processed: true,
          row_count: processedData.length,
          column_count: processedData.length > 0 ? Object.keys(processedData[0]).length : 0,
          file_metadata: {
            content: data.content,
            processedData: processedData,
            ...data.metadata
          }
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setTimeout(() => {
        toast({
          title: "✅ Upload Berhasil!",
          description: `File ${file.name} berhasil diupload dan diproses`,
        });
        onFileUploaded({ ...data, ...savedFile, processedData });
      }, 500);

    } catch (error: any) {
      setUploadProgress(0);
      toast({
        title: "❌ Upload Gagal",
        description: error.message || "Terjadi kesalahan saat mengupload file",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsUploading(false), 1000);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileUpload(acceptedFiles[0]);
      }
    },
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json'],
    },
    multiple: false,
    disabled: isUploading
  });

  const sampleDatasets = [
    {
      name: 'Sales Data Sample',
      description: 'Contoh data penjualan bulanan',
      icon: TrendingUp,
      size: '2.5 KB'
    },
    {
      name: 'Customer Data Sample',
      description: 'Contoh data pelanggan',
      icon: Database,
      size: '5.1 KB'
    },
    {
      name: 'Financial Report Sample',
      description: 'Contoh laporan keuangan',
      icon: FileText,
      size: '3.8 KB'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Upload className="w-16 h-16 text-blue-500" />
        </div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Upload Data Anda
        </h1>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
          Mulai analisis data Anda dengan mengupload file CSV, Excel, atau JSON. 
          Sistem kami akan memvalidasi dan memproses data secara otomatis.
        </p>
      </div>

      {/* Upload Area */}
      <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
        <CardContent className="p-0">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 scale-105'
                : isUploading
                ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <input {...getInputProps()} />
            
            {isUploading ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <Upload className="w-12 h-12 text-blue-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                    Mengupload file... {uploadProgress}%
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : isDragActive ? (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-blue-500 mx-auto" />
                <p className="text-blue-600 dark:text-blue-400 font-medium text-lg">
                  Lepaskan file di sini...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-center space-x-4">
                  <Upload className="w-10 h-10 text-gray-400" />
                  <FileText className="w-10 h-10 text-gray-400" />
                  <Database className="w-10 h-10 text-gray-400" />
                </div>
                
                <div className="space-y-3">
                  <p className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Drag & drop file atau klik untuk browse
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Format yang didukung: CSV, Excel (.xlsx, .xls), JSON
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    Maksimal ukuran file: 10MB
                  </p>
                </div>
                
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                  disabled={isUploading}
                >
                  Pilih File
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sample Datasets */}
      <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            📁 Atau coba dengan sample data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleDatasets.map((dataset, index) => {
              const Icon = dataset.icon;
              return (
                <Card key={index} className={`cursor-pointer hover:shadow-md transition-shadow ${theme === 'dark' ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Icon className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {dataset.name}
                        </h3>
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {dataset.description}
                        </p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {dataset.size}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className={`${theme === 'dark' ? 'bg-blue-950 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-900'}`}>
                💡 Tips untuk hasil analisis terbaik:
              </h3>
              <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                <li>• Pastikan data memiliki header kolom yang jelas</li>
                <li>• Hindari sel kosong di baris pertama</li>
                <li>• Format tanggal gunakan YYYY-MM-DD atau DD/MM/YYYY</li>
                <li>• Angka jangan menggunakan karakter khusus selain titik desimal</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
