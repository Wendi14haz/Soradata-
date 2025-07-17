
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ValidationResult, ValidationIssue } from '@/utils/dataQualityValidator';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, BarChart3, FileX } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface DataQualityReportProps {
  validationResult: ValidationResult;
  fileName?: string;
}

export const DataQualityReport = ({ validationResult, fileName }: DataQualityReportProps) => {
  const { theme } = useTheme();

  const getSeverityIcon = (severity: ValidationIssue['severity']) => {
    switch (severity) {
      case 'high':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: ValidationIssue['severity']) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
    }
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={`space-y-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Laporan Kualitas Data
            {fileName && <span className="text-sm font-normal text-gray-500">- {fileName}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getQualityScoreColor(validationResult.qualityScore)}`}>
                {validationResult.qualityScore.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500">Skor Kualitas</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">
                {validationResult.summary.totalChecks}
              </div>
              <p className="text-sm text-gray-500">Total Pemeriksaan</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">
                {validationResult.summary.issuesFound}
              </div>
              <p className="text-sm text-gray-500">Masalah Ditemukan</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${validationResult.isValid ? 'text-green-500' : 'text-red-500'}`}>
                {validationResult.isValid ? <CheckCircle className="w-8 h-8 mx-auto" /> : <XCircle className="w-8 h-8 mx-auto" />}
              </div>
              <p className="text-sm text-gray-500">
                {validationResult.isValid ? 'Valid' : 'Perlu Perbaikan'}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Skor Kualitas Data</span>
              <span className={getQualityScoreColor(validationResult.qualityScore)}>
                {validationResult.qualityScore.toFixed(1)}%
              </span>
            </div>
            <Progress value={validationResult.qualityScore} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileX className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Data Kosong</p>
                <p className="text-xl font-bold">
                  {validationResult.summary.missingValuePercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Outlier</p>
                <p className="text-xl font-bold">{validationResult.summary.outlierCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-500" />
              <div>
                <p className="text-sm text-gray-500">Duplikat</p>
                <p className="text-xl font-bold">{validationResult.summary.duplicateCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues List */}
      {validationResult.issues.length > 0 && (
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <CardTitle>Masalah Yang Ditemukan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {validationResult.issues.map((issue, index) => (
                <Alert key={index} className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''}>
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getSeverityColor(issue.severity)} className="text-xs">
                          {issue.type.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {issue.column}
                        </Badge>
                        {issue.row && (
                          <Badge variant="outline" className="text-xs">
                            Baris {issue.row}
                          </Badge>
                        )}
                      </div>
                      <AlertDescription className="text-sm">
                        <p className="font-medium">{issue.message}</p>
                        {issue.suggestion && (
                          <p className="text-xs text-gray-500 mt-1">
                            💡 Saran: {issue.suggestion}
                          </p>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {validationResult.issues.length > 0 && (
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <CardTitle>Rekomendasi Perbaikan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validationResult.summary.missingValuePercentage > 10 && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                  <p className="text-sm">Tangani data kosong dengan mengisi nilai default atau menghapus baris yang tidak lengkap</p>
                </div>
              )}
              {validationResult.summary.outlierCount > 0 && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                  <p className="text-sm">Periksa dan verifikasi outlier - mungkin kesalahan input atau nilai yang valid</p>
                </div>
              )}
              {validationResult.summary.duplicateCount > 0 && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                  <p className="text-sm">Hapus atau gabungkan data duplikat untuk meningkatkan akurasi analisis</p>
                </div>
              )}
              {validationResult.summary.formatIssues > 0 && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                  <p className="text-sm">Standardisasi format data (tanggal, angka) agar konsisten di seluruh dataset</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {validationResult.issues.length === 0 && (
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-600 mb-2">Data Berkualitas Tinggi!</h3>
            <p className="text-gray-500">
              Data Anda telah lulus semua pemeriksaan kualitas. Siap untuk dianalisis lebih lanjut.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
