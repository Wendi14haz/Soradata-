
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Sparkles, TrendingUp, PieChart, BarChart3, Search, Zap } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { InteractiveDataVisualizer } from '@/components/visualization/InteractiveDataVisualizer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AnalysisWizardProps {
  fileData: any;
  onComplete: (results: any) => void;
  onBack: () => void;
}

export const AnalysisWizard = ({ fileData, onComplete, onBack }: AnalysisWizardProps) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const analysisTemplates = [
    {
      id: 'overview',
      title: '📊 Analisis Umum',
      description: 'Ringkasan statistik dan insight dasar dari data Anda',
      icon: BarChart3,
      prompt: 'Berikan analisis umum yang komprehensif dari data ini termasuk statistik deskriptif, distribusi data, dan insight utama dalam bahasa Indonesia'
    },
    {
      id: 'trends',
      title: '📈 Analisis Tren',
      description: 'Identifikasi pola dan tren dalam data time series',
      icon: TrendingUp,
      prompt: 'Analisis tren dan pola temporal dalam data ini, identifikasi tren naik/turun dan seasonality dalam bahasa Indonesia'
    },
    {
      id: 'distribution',
      title: '🥧 Analisis Distribusi',
      description: 'Analisis distribusi dan segmentasi data',
      icon: PieChart,
      prompt: 'Analisis distribusi data dan segmentasi berdasarkan kategori, temukan segmen terbesar dan terkecil dalam bahasa Indonesia'
    },
    {
      id: 'correlation',
      title: '🔗 Analisis Korelasi',
      description: 'Temukan hubungan antar variabel dalam data',
      icon: Search,
      prompt: 'Analisis korelasi antar variabel dalam data, identifikasi hubungan positif/negatif yang signifikan dalam bahasa Indonesia'
    },
    {
      id: 'anomaly',
      title: '⚠️ Deteksi Anomali',
      description: 'Identifikasi outlier dan data yang tidak normal',
      icon: Zap,
      prompt: 'Deteksi anomali dan outlier dalam data, analisis apakah anomali tersebut valid atau error dalam bahasa Indonesia'
    },
    {
      id: 'custom',
      title: '✨ Analisis Kustom',
      description: 'Tulis pertanyaan analisis Anda sendiri',
      icon: Sparkles,
      prompt: ''
    }
  ];

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template.id);
    if (template.id === 'custom') {
      setCustomPrompt('');
    } else {
      setCustomPrompt(template.prompt);
    }
  };

  const handleAnalyze = async () => {
    if (!user || !selectedTemplate || (!customPrompt.trim() && selectedTemplate !== 'custom')) {
      toast({
        title: "Error",
        description: "Silakan pilih template dan masukkan prompt analisis",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const analyzePrompt = customPrompt.trim() || analysisTemplates.find(t => t.id === selectedTemplate)?.prompt || '';
      
      const { data, error } = await supabase.functions.invoke('analyze-data', {
        body: {
          data: fileData.processedData,
          prompt: analyzePrompt,
          userMessage: analyzePrompt,
          analysisType: selectedTemplate
        },
      });

      if (error) throw error;

      const results = {
        analysis: data.analysis || 'Analisis berhasil diselesaikan!',
        suggestions: data.suggestions || [],
        charts: data.charts || [],
        template: selectedTemplate,
        prompt: analyzePrompt
      };

      setAnalysisResults(results);

      // Save to database
      await supabase.from('data_analyses').insert({
        user_id: user.id,
        file_id: fileData.id,
        analysis_prompt: analyzePrompt,
        ai_response: results.analysis,
        insights_json: { 
          suggestions: results.suggestions,
          template: selectedTemplate,
          charts: results.charts
        },
      });

      toast({
        title: "🎉 Analisis Selesai!",
        description: "Data Anda berhasil dianalisis",
      });

      onComplete(results);

    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Terjadi kesalahan saat menganalisis data",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          🧠 Pilih Jenis Analisis
        </h2>
        <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Pilih template analisis atau buat pertanyaan kustom untuk data Anda
        </p>
      </div>

      {/* Analysis Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analysisTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedTemplate === template.id
                  ? theme === 'dark' 
                    ? 'bg-blue-900 border-blue-600 ring-2 ring-blue-500' 
                    : 'bg-blue-50 border-blue-500 ring-2 ring-blue-300'
                  : theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Icon className={`w-8 h-8 flex-shrink-0 mt-1 ${
                    selectedTemplate === template.id ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {template.title}
                    </h3>
                    <p className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {template.description}
                    </p>
                    {selectedTemplate === template.id && (
                      <Badge className="mt-2 bg-blue-500 text-white text-xs">
                        Dipilih
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Custom Prompt Input */}
      {selectedTemplate && (
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {selectedTemplate === 'custom' ? '✨ Tulis Pertanyaan Analisis Anda' : '📝 Kustomisasi Prompt (Opsional)'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={
                selectedTemplate === 'custom' 
                  ? "Contoh: Analisis hubungan antara usia dan pendapatan dalam data ini, buat insight mendalam tentang segmentasi pelanggan berdasarkan demografi..."
                  : "Anda dapat memodifikasi prompt analisis di sini atau biarkan kosong untuk menggunakan template default"
              }
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4}
              className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                💡 Tip: Gunakan bahasa yang spesifik dan jelas
              </Badge>
              <Badge variant="outline" className="text-xs">
                🎯 Fokus: Sebutkan insight yang ingin Anda temukan
              </Badge>
              <Badge variant="outline" className="text-xs">
                📊 Format: Minta visualisasi yang sesuai
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Overview */}
      <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            📊 Ringkasan Data Anda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {fileData?.processedData?.length || 0}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Baris Data</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/30">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {fileData?.processedData?.[0] ? Object.keys(fileData.processedData[0]).length : 0}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">Kolom</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/30">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {fileData?.file_type?.toUpperCase() || 'N/A'}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">Format</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/30">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {Math.round((fileData?.file_size || 0) / 1024)} KB
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400">Ukuran</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Visualization */}
      {analysisResults && (
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              🎯 Hasil Analisis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InteractiveDataVisualizer 
              data={fileData.processedData}
              analysisResults={analysisResults}
            />
          </CardContent>
        </Card>
      )}

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
          onClick={handleAnalyze}
          disabled={!selectedTemplate || isAnalyzing || (!customPrompt.trim() && selectedTemplate === 'custom')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Menganalisis...
            </>
          ) : (
            <>
              Mulai Analisis
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
