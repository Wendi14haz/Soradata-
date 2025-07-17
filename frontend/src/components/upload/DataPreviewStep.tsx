
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, AlertTriangle, Info, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useDataQuality } from '@/hooks/useDataQuality';

interface DataPreviewStepProps {
  fileData: any;
  onNext: () => void;
  onBack: () => void;
}

export const DataPreviewStep = ({ fileData, onNext, onBack }: DataPreviewStepProps) => {
  const { theme } = useTheme();
  const { validateData, validationResult, isValidating } = useDataQuality();
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [dataTypes, setDataTypes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (fileData?.processedData) {
      const data = fileData.processedData.slice(0, 10); // Preview 10 rows
      setPreviewData(data);
      
      if (data.length > 0) {
        const cols = Object.keys(data[0]);
        setColumns(cols);
        
        // Detect data types
        const types: Record<string, string> = {};
        cols.forEach(col => {
          const sampleValues = data.map(row => row[col]).filter(val => val !== null && val !== undefined && val !== '');
          if (sampleValues.length > 0) {
            const firstValue = sampleValues[0];
            if (!isNaN(Number(firstValue))) {
              types[col] = 'number';
            } else if (new Date(firstValue).toString() !== 'Invalid Date') {
              types[col] = 'date';
            } else {
              types[col] = 'text';
            }
          } else {
            types[col] = 'unknown';
          }
        });
        setDataTypes(types);
      }
      
      // Validate data quality
      validateData(fileData.processedData, fileData.id);
    }
  }, [fileData, validateData]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'number': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'date': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'text': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'number': return '🔢';
      case 'date': return '📅';
      case 'text': return '📝';
      default: return '❓';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          📋 Preview & Validasi Data
        </h2>
        <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Periksa data Anda sebelum melanjutkan ke analisis
        </p>
      </div>

      {/* File Info */}
      <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                {fileData?.processedData?.length || 0}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Baris
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                {columns.length}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Kolom
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                {fileData?.original_filename || 'Unknown'}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Nama File
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                {fileData?.file_type?.toUpperCase() || 'Unknown'}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Format File
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Report */}
      {isValidating ? (
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Memvalidasi kualitas data...
              </span>
            </div>
          </CardContent>
        </Card>
      ) : validationResult && (
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {validationResult.qualityScore >= 80 ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : validationResult.qualityScore >= 60 ? (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              )}
              <span>Laporan Kualitas Data</span>
              <Badge 
                variant={validationResult.qualityScore >= 80 ? "default" : "secondary"}
                className={
                  validationResult.qualityScore >= 80 
                    ? "bg-green-500 text-white" 
                    : validationResult.qualityScore >= 60 
                    ? "bg-yellow-500 text-white" 
                    : "bg-red-500 text-white"
                }
              >
                {validationResult.qualityScore}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {validationResult.summary.totalChecks}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Total Pemeriksaan</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/30">
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {validationResult.summary.totalChecks - validationResult.issues.length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Lulus Validasi</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/30">
                <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                  {validationResult.issues.length}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">Masalah Ditemukan</div>
              </div>
            </div>
            
            {validationResult.issues.length > 0 && (
              <div className="mt-4">
                <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ⚠️ Masalah yang Ditemukan:
                </h4>
                <ul className="space-y-1">
                  {validationResult.issues.slice(0, 5).map((issue, index) => (
                    <li key={index} className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      • {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Column Types */}
      <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            🏷️ Tipe Data Kolom
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {columns.map((col, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className={`${getTypeColor(dataTypes[col])} border-0`}
              >
                {getTypeIcon(dataTypes[col])} {col}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Preview Table */}
      <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            👁️ Preview Data (10 baris pertama)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className={theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}>
                  {columns.map((col, index) => (
                    <TableHead key={index} className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>
                      <div className="flex items-center space-x-1">
                        <span>{col}</span>
                        <span className="text-xs opacity-75">{getTypeIcon(dataTypes[col])}</span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className={`${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    {columns.map((col, colIndex) => (
                      <TableCell key={colIndex} className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'} max-w-xs truncate`}>
                        {row[col]?.toString() || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button
          onClick={onBack}
          variant="outline"
          className={`${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>

        <Button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Lanjut ke Analisis
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
