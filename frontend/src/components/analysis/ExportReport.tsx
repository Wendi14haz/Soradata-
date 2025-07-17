
import { Button } from '@/components/ui/button';
import { Download, FileText, Image, Table } from 'lucide-react';
import { toast } from 'sonner';

interface ExportReportProps {
  analysisId: string;
  fileData: any;
  analysis: string;
}

export const ExportReport = ({ analysisId, fileData, analysis }: ExportReportProps) => {
  
  const exportToPDF = () => {
    const reportContent = `
# Laporan Analisis Data SoraData 🇮🇩

## File: ${fileData.original_filename}
**Tanggal Analisis:** ${new Date().toLocaleDateString('id-ID')}
**Total Baris:** ${fileData.row_count}
**Total Kolom:** ${fileData.column_count}

---

## Hasil Analisis AI

${analysis}

---

**Dibuat dengan SoraData AI - Platform Analisis Data Indonesia**
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SoraData_Report_${fileData.original_filename}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('📄 Laporan berhasil didownload sebagai file TXT!');
  };

  const exportToCSV = () => {
    if (!fileData.processedData || fileData.processedData.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    const csv = [
      Object.keys(fileData.processedData[0]).join(','),
      ...fileData.processedData.map((row: any) => 
        Object.values(row).map(val => `"${val}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SoraData_Export_${fileData.original_filename}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('📊 Data berhasil diekspor ke CSV!');
  };

  const exportToJSON = () => {
    if (!fileData.processedData || fileData.processedData.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    const reportData = {
      metadata: {
        filename: fileData.original_filename,
        analysis_date: new Date().toISOString(),
        rows: fileData.row_count,
        columns: fileData.column_count
      },
      analysis: analysis,
      data: fileData.processedData
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SoraData_Report_${fileData.original_filename}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('📋 Laporan lengkap berhasil diekspor ke JSON!');
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-300 text-sm">
        💾 Download laporan analisis dalam berbagai format:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          onClick={exportToPDF}
          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          📄 Download TXT
        </Button>
        
        <Button 
          onClick={exportToCSV}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          <Table className="w-4 h-4" />
          📊 Download CSV
        </Button>
        
        <Button 
          onClick={exportToJSON}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          📋 Download JSON
        </Button>
      </div>
      
      <div className="text-xs text-gray-500 bg-gray-700/50 p-3 rounded-lg">
        <p>💡 <strong>Tips Export:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>TXT: Untuk laporan ringkas yang mudah dibaca</li>
          <li>CSV: Untuk import ke Excel atau software lain</li>
          <li>JSON: Untuk laporan lengkap dengan metadata</li>
        </ul>
      </div>
    </div>
  );
};
