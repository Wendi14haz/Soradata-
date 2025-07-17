
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Plus, Copy, Trash2, Edit, Star } from 'lucide-react';
import { toast } from 'sonner';

export const CustomPrompts = () => {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    prompt_text: '',
    category: 'general',
    is_public: false
  });

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_prompts')
        .select('*')
        .or(`user_id.eq.${user?.id},is_public.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const savePrompt = async () => {
    try {
      if (editingPrompt) {
        const { error } = await supabase
          .from('custom_prompts')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPrompt.id);

        if (error) throw error;
        toast.success('✅ Prompt berhasil diperbarui!');
      } else {
        const { error } = await supabase
          .from('custom_prompts')
          .insert({
            ...formData,
            user_id: user?.id
          });

        if (error) throw error;
        toast.success('✅ Prompt berhasil dibuat!');
      }

      setFormData({ title: '', prompt_text: '', category: 'general', is_public: false });
      setShowForm(false);
      setEditingPrompt(null);
      fetchPrompts();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const deletePrompt = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPrompts(prompts.filter(p => p.id !== id));
      toast.success('🗑️ Prompt berhasil dihapus!');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('📋 Prompt berhasil disalin!');
    } catch (error) {
      toast.error('Gagal menyalin prompt');
    }
  };

  const categories = [
    { value: 'general', label: '🔧 General' },
    { value: 'analysis', label: '📊 Analysis' },
    { value: 'visualization', label: '📈 Visualization' },
    { value: 'report', label: '📄 Report' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-700 border-gray-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="h-5 w-5 text-blue-400" />
              🧠 Custom AI Prompts
            </CardTitle>
            <Button
              onClick={() => {
                setShowForm(!showForm);
                setEditingPrompt(null);
                setFormData({ title: '', prompt_text: '', category: 'general', is_public: false });
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Buat Prompt Baru
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <Card className="mb-6 bg-gray-600 border-gray-500">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  {editingPrompt ? '✏️ Edit Prompt' : '➕ Buat Prompt Baru'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Judul Prompt
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Analisis Trend Penjualan"
                    className="bg-gray-500 border-gray-400 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Kategori
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-gray-500 border-gray-400 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-600 border-gray-500">
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value} className="text-white">
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Teks Prompt
                  </label>
                  <Textarea
                    value={formData.prompt_text}
                    onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })}
                    placeholder="Analisis data penjualan dan berikan insight tentang trend, pola musiman, dan rekomendasi untuk meningkatkan performa..."
                    rows={4}
                    className="bg-gray-500 border-gray-400 text-white"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="isPublic" className="text-sm text-gray-300">
                    🌐 Bagikan secara publik (pengguna lain dapat menggunakan prompt ini)
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={savePrompt} className="bg-green-600 hover:bg-green-700">
                    💾 Simpan Prompt
                  </Button>
                  <Button
                    onClick={() => {
                      setShowForm(false);
                      setEditingPrompt(null);
                    }}
                    variant="outline"
                    className="border-gray-500 text-gray-300"
                  >
                    ❌ Batal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {prompts.map((prompt) => (
              <Card key={prompt.id} className="bg-gray-600 border-gray-500 hover:bg-gray-500 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{prompt.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs border-gray-400 text-gray-300">
                          {categories.find(c => c.value === prompt.category)?.label || prompt.category}
                        </Badge>
                        {prompt.is_public && (
                          <Badge className="text-xs bg-green-600 text-white">🌐 Publik</Badge>
                        )}
                        {prompt.user_id === user?.id && (
                          <Badge className="text-xs bg-blue-600 text-white">👤 Milik Saya</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {prompt.prompt_text}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>📊 Digunakan: {prompt.usage_count || 0}x</span>
                        <span>📅 {new Date(prompt.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(prompt.prompt_text)}
                        className="border-gray-400 text-gray-300 hover:bg-blue-600"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      
                      {prompt.user_id === user?.id && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingPrompt(prompt);
                              setFormData({
                                title: prompt.title,
                                prompt_text: prompt.prompt_text,
                                category: prompt.category,
                                is_public: prompt.is_public
                              });
                              setShowForm(true);
                            }}
                            className="border-gray-400 text-gray-300 hover:bg-yellow-600"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deletePrompt(prompt.id)}
                            className="border-red-400 text-red-400 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {prompts.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Brain className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Custom Prompts</h3>
              <p>Buat prompt AI pertama Anda untuk mempercepat analisis data!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
