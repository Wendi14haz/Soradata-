import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { History, FileText, Calendar, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
export const AnalysisHistory = () => {
  const {
    user
  } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);
  const fetchHistory = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('data_analyses').select(`
          *,
          user_files (original_filename, file_type, upload_date)
        `).eq('user_id', user?.id).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      toast.error(`Error mengambil riwayat: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const deleteAnalysis = async (id: string) => {
    try {
      const {
        error
      } = await supabase.from('data_analyses').delete().eq('id', id);
      if (error) throw error;
      setHistory(history.filter(item => item.id !== id));
      toast.success('🗑️ Analisis berhasil dihapus');
    } catch (error: any) {
      toast.error(`Error menghapus analisis: ${error.message}`);
    }
  };
  if (loading) {
    return <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>;
  }
  return <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <History className="h-5 w-5 text-purple-400" />
            📚 Riwayat Analisis Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? <div className="text-center py-8 text-gray-400">
              <History className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Riwayat</h3>
              <p>Mulai analisis data untuk melihat riwayat di sini</p>
            </div> : <div className="space-y-4">
              {history.map(item => <Card key={item.id} className="bg-gray-700 border-gray-600 hover:bg-gray-600 transition-colors">
                  <CardContent className="p-4 bg-gray-900">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="font-medium text-white">
                            {item.user_files?.original_filename || 'File tidak ditemukan'}
                          </span>
                          <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                            {item.user_files?.file_type || 'unknown'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-300 mb-2">
                          <strong>Prompt:</strong> {item.analysis_prompt}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" onClick={() => setSelectedAnalysis(selectedAnalysis?.id === item.id ? null : item)} className="border-gray-600 text-gray-300 bg-gray-900 hover:bg-gray-800">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteAnalysis(item.id)} className="border-red-600 text-red-400 hover:text-white bg-zinc-900 hover:bg-zinc-800">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {selectedAnalysis?.id === item.id && <div className="mt-4 pt-4 border-t border-gray-600">
                        <h4 className="font-medium text-white mb-2">📊 Hasil Analisis:</h4>
                        <div className="bg-gray-800 p-3 rounded-lg max-h-60 overflow-y-auto">
                          <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                            {item.ai_response}
                          </pre>
                        </div>
                        
                        {item.insights_json?.suggestions && item.insights_json.suggestions.length > 0 && <div className="mt-3">
                            <h5 className="text-sm font-medium text-white mb-2">💡 Saran:</h5>
                            <div className="flex flex-wrap gap-1">
                              {item.insights_json.suggestions.map((suggestion: string, index: number) => <Badge key={index} variant="secondary" className="text-xs bg-purple-600/20 text-purple-300">
                                  {suggestion}
                                </Badge>)}
                            </div>
                          </div>}
                      </div>}
                  </CardContent>
                </Card>)}
            </div>}
        </CardContent>
      </Card>
    </div>;
};