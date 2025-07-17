import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Send, Brain, TrendingUp, Download, BarChart3, FileText, Sparkles } from 'lucide-react';
import { DataVisualization } from './DataVisualization';
import { ExportReport } from './ExportReport';

interface DataAnalysisProps {
  fileData: any;
}

const SUPABASE_EDGE_URL = 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/analyze-data'; // Ganti dengan URL Supabase kamu

export default function DataAnalysis({ fileData }: DataAnalysisProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);

  const analyzeData = async (userPrompt?: string) => {
    if (!user || !fileData) return;

    setLoading(true);
    try {
      const analyzePrompt = userPrompt || prompt || 'Analisis data ini dan berikan insight yang berguna dalam bahasa Indonesia';

      let data, error;

      try {
        const response = await supabase.functions.invoke('analyze-data', {
          body: {
            data: fileData.processedData,
            prompt: analyzePrompt,
            userMessage: analyzePrompt,
          },
        });
        data = response.data;
        error = response.error;
      } catch (invokeError) {
        const res = await fetch(SUPABASE_EDGE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: fileData.processedData,
            prompt: analyzePrompt,
            userMessage: analyzePrompt,
          }),
        });
        data = await res.json();
      }

      if (error) throw error;

      const analysisResult = data.analysis || 'Analisis berhasil diselesaikan!';
      setAnalysis(analysisResult);
      setSuggestions(data.suggestions || []);

      const { data: savedAnalysis, error: saveError } = await supabase
        .from('data_analyses')
        .insert({
          user_id: user.id,
          file_id: fileData.id,
          analysis_prompt: analyzePrompt,
          ai_response: analysisResult,
          insights_json: { suggestions: data.suggestions },
        })
        .select()
        .single();

      if (saveError) throw saveError;
      setCurrentAnalysisId(savedAnalysis.id);

      if (!userPrompt) setPrompt('');

      toast({
        title: '🎉 Analisis Selesai!',
        description: 'AI telah menganalisis data Anda dengan berhasil.',
      });
    } catch (error: any) {
      toast({
        title: '❌ Error',
        description: error.message || 'Terjadi kesalahan saat menganalisis data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAnalysis = (question: string) => {
    analyzeData(question);
  };

  const quickQuestions = [
    '🔍 Apa insight utama dari data ini?',
    '📈 Identifikasi tren dan pola penting',
    '💡 Apa rekomendasi berdasarkan data ini?',
    '⚠️ Temukan anomali atau outlier dalam data',
    '📝 Buat ringkasan eksekutif dari data ini',
    '📊 Analisis statistik deskriptif',
    '🎯 Identifikasi peluang bisnis',
    '🔗 Cari korelasi antar variabel',
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-5 w-5 text-blue-400" />
            💬 Chat dengan AI Analyst
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              🤖 Tanya AI tentang data Anda (dalam Bahasa Indonesia):
            </label>
            <Textarea
              placeholder="Contoh: Bagaimana tren penjualan berdasarkan data ini? Atau analisis customer behavior dari data yang diupload..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => analyzeData()}
              disabled={loading || !prompt.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="mr-2 h-4 w-4" />
              {loading ? '🔄 Menganalisis...' : '🚀 Analisis Data'}
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              ⚡ Atau pilih analisis cepat:
            </label>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-600 hover:text-white border-gray-600 text-gray-300 text-xs"
                  onClick={() => handleQuickAnalysis(question)}
                >
                  {question}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5 text-green-400" />
              📊 Hasil Analisis AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 w-full">
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-200 leading-relaxed">
                  {analysis}
                </pre>
              </div>
            </ScrollArea>

            {suggestions.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-white">💡 Saran Tindak Lanjut:</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-600/20 text-purple-300">
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {fileData && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5 text-orange-400" />
              📈 Visualisasi Data Otomatis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataVisualization data={fileData.processedData} />
          </CardContent>
        </Card>
      )}

      {currentAnalysisId && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Download className="h-5 w-5 text-red-400" />
              📄 Export Laporan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExportReport
              analysisId={currentAnalysisId}
              fileData={fileData}
              analysis={analysis}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
