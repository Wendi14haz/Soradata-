
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface AdvancedInsightsProps {
  data: any[];
}

export const AdvancedInsights = ({ data }: AdvancedInsightsProps) => {
  const { theme } = useTheme();
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateAdvancedInsights = async () => {
    setLoading(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock insights based on data
    const mockInsights = {
      correlations: [
        { variables: ['Penjualan', 'Marketing'], correlation: 0.87, insight: 'Korelasi kuat antara investasi marketing dan penjualan' },
        { variables: ['Cuaca', 'Demand'], correlation: -0.43, insight: 'Cuaca buruk menurunkan permintaan produk outdoor' }
      ],
      trends: [
        { period: 'Q4 2024', change: '+23.5%', insight: 'Pertumbuhan signifikan menjelang akhir tahun' },
        { period: 'Musim Hujan', change: '-12.3%', insight: 'Penurunan konsisten selama musim hujan' }
      ],
      outliers: [
        { date: '15 Nov 2024', value: 15000, normal_range: '3000-8000', reason: 'Event Black Friday, lonjakan normal untuk periode tersebut' },
        { date: '3 Jan 2024', value: 890, normal_range: '3000-8000', reason: 'Hari libur nasional, aktivitas minimal' }
      ],
      segments: [
        { category: 'Premium Products', performance: '+45%', insight: 'Segmen premium menunjukkan pertumbuhan terkuat' },
        { category: 'Budget Products', performance: '-8%', insight: 'Penurunan minat pada produk budget, shift ke mid-range' }
      ],
      predictions: [
        { metric: 'Penjualan Bulan Depan', value: '125,000', confidence: '89%', trend: 'up' },
        { metric: 'Customer Retention', value: '78%', confidence: '92%', trend: 'stable' }
      ],
      recommendations: [
        'Tingkatkan investasi marketing pada Q4 untuk memaksimalkan momentum',
        'Kembangkan strategi khusus musim hujan untuk menjaga stabilitas penjualan',
        'Fokus pada segmen premium yang menunjukkan pertumbuhan kuat',
        'Evaluasi ulang positioning produk budget untuk menghentikan penurunan'
      ]
    };
    
    setInsights(mockInsights);
    setLoading(false);
    toast.success('🧠 Analisis AI Lanjutan berhasil dihasilkan!');
  };

  return (
    <div className="space-y-6">
      <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <Brain className="w-6 h-6 text-purple-500" />
              🧠 Advanced AI Insights PRO
            </CardTitle>
            <Button 
              onClick={generateAdvancedInsights}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {loading ? '🔄 Menganalisis...' : '🚀 Generate Insights'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {!insights && !loading && (
            <div className="text-center py-8">
              <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Klik tombol di atas untuk menghasilkan analisis AI lanjutan
              </p>
            </div>
          )}
          
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                🤖 AI sedang menganalisis data Anda...
              </p>
            </div>
          )}
          
          {insights && (
            <div className="space-y-6">
              {/* Correlations */}
              <div>
                <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  📊 Analisis Korelasi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.correlations.map((corr: any, index: number) => (
                    <div key={index} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {corr.variables.join(' ↔ ')}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          Math.abs(corr.correlation) > 0.7 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {corr.correlation > 0 ? '+' : ''}{corr.correlation}
                        </span>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {corr.insight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Trends */}
              <div>
                <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  📈 Analisis Tren
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.trends.map((trend: any, index: number) => (
                    <div key={index} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {trend.period}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          trend.change.startsWith('+') 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {trend.change}
                        </span>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {trend.insight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Outliers */}
              <div>
                <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  ⚠️ Deteksi Outlier
                </h3>
                <div className="space-y-3">
                  {insights.outliers.map((outlier: any, index: number) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 border-orange-500 ${theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
                      <div className="flex items-center gap-4 mb-2">
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {outlier.date}
                        </span>
                        <span className="text-orange-600 font-bold">
                          {outlier.value.toLocaleString()}
                        </span>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          (Normal: {outlier.normal_range})
                        </span>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        💡 {outlier.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Predictions */}
              <div>
                <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Target className="w-5 h-5 text-purple-500" />
                  🔮 Prediksi & Forecasting
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.predictions.map((pred: any, index: number) => (
                    <div key={index} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {pred.metric}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          pred.trend === 'up' ? 'bg-green-100 text-green-700' : 
                          pred.trend === 'down' ? 'bg-red-100 text-red-700' : 
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {pred.trend === 'up' ? '📈' : pred.trend === 'down' ? '📉' : '➡️'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-purple-500">
                          {pred.value}
                        </span>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          ({pred.confidence} akurasi)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Recommendations */}
              <div>
                <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  💡 Rekomendasi Strategis
                </h3>
                <div className="space-y-2">
                  {insights.recommendations.map((rec: string, index: number) => (
                    <div key={index} className={`p-3 rounded-lg border-l-4 border-yellow-500 ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        💡 {rec}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
