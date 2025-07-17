
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Share2, BarChart3, FileText, TrendingUp } from 'lucide-react';
import { DataVisualization } from '@/components/analysis/DataVisualization';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';

const Results = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const actionType = searchParams.get('action') || 'visualize';
  const fileId = searchParams.get('fileId');

  useEffect(() => {
    // Simulate loading analysis results
    const loadResults = async () => {
      setLoading(true);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock analysis results based on action type
      const mockResults = {
        visualize: {
          title: 'Visualisasi Data',
          description: 'Grafik dan chart berdasarkan data Anda',
          insights: ['Ditemukan 3 tren utama dalam data', 'Korelasi positif antara variabel A dan B', 'Peningkatan 25% pada periode Q3']
        },
        'analyze-trend': {
          title: 'Analisis Tren',
          description: 'Pola dan tren yang ditemukan dalam data',
          insights: ['Tren naik konsisten dalam 6 bulan terakhir', 'Pola musiman terdeteksi setiap kuartal', 'Proyeksi pertumbuhan 15% untuk periode berikutnya']
        },
        summarize: {
          title: 'Ringkasan Data',
          description: 'Statistik dan rangkuman data utama',
          insights: ['Total 1,247 record data valid', 'Nilai rata-rata: 85.4', '3 outlier teridentifikasi']
        },
        'find-anomaly': {
          title: 'Deteksi Anomali',
          description: 'Data tidak normal yang ditemukan',
          insights: ['5 anomali terdeteksi dalam dataset', 'Nilai ekstrem pada tanggal 15 Maret', 'Pola tidak biasa di kolom revenue']
        },
        custom: {
          title: 'Analisis Kustom',
          description: 'Hasil analisis berdasarkan permintaan khusus',
          insights: ['Analisis sesuai permintaan telah diselesaikan', 'Insight khusus berdasarkan kriteria yang diminta', 'Rekomendasi tindak lanjut tersedia']
        }
      };
      setAnalysisData(mockResults[actionType as keyof typeof mockResults] || mockResults.visualize);
      setLoading(false);
    };
    loadResults();
  }, [actionType, fileId]);

  const handleBackToChat = () => {
    navigate('/dashboard');
  };
  const handleDownload = () => {
    // Implement download functionality
    console.log('Download results');
  };
  const handleShare = () => {
    // Implement share functionality
    console.log('Share results');
  };

  if (!user) {
    navigate('/auth');
    return null;
  }
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="text-center space-y-4">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            theme === 'dark' ? 'border-blue-500' : 'border-purple-500'
          } mx-auto`}></div>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Memuat hasil analisis...</p>
        </div>
      </div>
    );
  }

  // Penentuan warna Layout berdasarkan theme
  const mainBg = theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-[#f8fafc] text-gray-900';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const headerBg = theme === 'dark' ? 'bg-gray-900/95' : 'bg-white/80';
  const sidebarBoxBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const statsLabelColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const statsValueColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const statsAccentColor = theme === 'dark' ? 'text-green-400' : 'text-green-600';
  const dashedBorder = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';
  const btnOutline = theme === 'dark'
    ? 'border-gray-600 bg-blue-700 hover:bg-blue-600 text-zinc-50'
    : 'border-gray-300 bg-[#9B5DE5] hover:bg-purple-700 text-white';

  return (
    <div className={`min-h-screen ${mainBg}`}>
      {/* Header */}
      <div className={`border-b ${borderColor} ${headerBg} backdrop-blur-sm sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBackToChat}
                className={theme === 'dark' 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                  : 'text-gray-500 hover:text-purple-800 hover:bg-purple-100'}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Chat
              </Button>
              <div className={`h-6 w-px ${borderColor}`}></div>
              <div>
                <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{analysisData?.title}</h1>
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{analysisData?.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleShare}
                className={btnOutline}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Bagikan
              </Button>
              <Button
                onClick={handleDownload}
                className={
                  theme === 'dark'
                    ? 'text-white bg-blue-700 hover:bg-blue-600'
                    : 'text-white bg-[#9B5DE5] hover:bg-purple-700'
                }
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visualization */}
            <Card className={`${cardBg} ${borderColor}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <BarChart3 className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-purple-500'}`} />
                  Visualisasi Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`rounded-lg p-6 min-h-[400px] flex items-center justify-center ${cardBg}`}>
                  {/* DataVisualization */}
                  <DataVisualization data={[]} />
                  {/* Komentar: Implementasikan kembalian visualisasi sesuai data jika diperlukan */}
                </div>
              </CardContent>
            </Card>

            {/* Analysis Report */}
            <Card className={`${cardBg} ${borderColor}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <FileText className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                  Laporan Analisis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`prose max-w-none ${
                  theme === 'dark' ? 'prose-invert text-gray-300' : 'text-gray-800'
                }`}>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                    Analisis telah diselesaikan berdasarkan data yang Anda upload.
                    Berikut adalah hasil temuan utama dari proses analisis menggunakan AI SoraData.
                  </p>
                  <div className="mt-6 space-y-3">
                    <h4 className={theme === 'dark' ? 'text-white font-semibold' : 'text-gray-900 font-semibold'}>
                      Key Insights:
                    </h4>
                    <ul className="space-y-2">
                      {analysisData?.insights.map((insight: string, index: number) => (
                        <li key={index} className={theme === 'dark'
                          ? 'text-gray-300 flex items-start gap-2'
                          : 'text-gray-800 flex items-start gap-2'
                        }>
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            theme === 'dark' ? 'bg-blue-400' : 'bg-purple-500'
                          }`}></div>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className={`${sidebarBoxBg} ${borderColor}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <TrendingUp className={`w-5 h-5 ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-500'
                  }`} />
                  Statistik Cepat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={statsLabelColor}>Total Records</span>
                    <span className={statsValueColor + ' font-semibold'}>1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={statsLabelColor}>Kolom</span>
                    <span className={statsValueColor + ' font-semibold'}>8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={statsLabelColor}>Akurasi</span>
                    <span className={statsAccentColor + ' font-semibold'}>94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={statsLabelColor}>Waktu Proses</span>
                    <span className={statsValueColor + ' font-semibold'}>2.1s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className={`${sidebarBoxBg} ${borderColor}`}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Langkah Selanjutnya</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className={`w-full justify-start ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 bg-gray-900 hover:bg-gray-800'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-purple-50'
                  }`}
                >
                  Analisis File Baru
                </Button>
                <Button
                  variant="outline"
                  className={`w-full justify-start ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 bg-gray-900 hover:bg-gray-800'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-purple-50'
                  }`}
                >
                  Ekspor ke Excel
                </Button>
                <Button
                  variant="outline"
                  className={`w-full justify-start ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 bg-gray-900 hover:bg-gray-800'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-purple-50'
                  }`}
                >
                  Buat Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
