
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Share2, Heart } from 'lucide-react';

interface CustomPrompt {
  id: string;
  title: string;
  prompt_text: string;
  category: string;
  is_public: boolean;
  usage_count: number;
  created_at: string;
  user_id: string;
}

export const CustomPrompts = () => {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<CustomPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    title: '',
    prompt_text: '',
    category: 'general',
    is_public: false
  });

  useEffect(() => {
    if (user) {
      fetchPrompts();
    }
  }, [user]);

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_prompts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast.error('Gagal memuat custom prompts');
    } finally {
      setLoading(false);
    }
  };

  const createPrompt = async () => {
    if (!user || !newPrompt.title || !newPrompt.prompt_text) return;

    try {
      const { error } = await supabase
        .from('custom_prompts')
        .insert([{
          ...newPrompt,
          user_id: user.id
        }]);

      if (error) throw error;

      toast.success('Custom prompt berhasil dibuat!');
      setNewPrompt({ title: '', prompt_text: '', category: 'general', is_public: false });
      setIsCreating(false);
      fetchPrompts();
    } catch (error) {
      console.error('Error creating prompt:', error);
      toast.error('Gagal membuat custom prompt');
    }
  };

  const usePrompt = async (promptId: string) => {
    try {
      const { error } = await supabase
        .from('custom_prompts')
        .update({ usage_count: prompts.find(p => p.id === promptId)?.usage_count + 1 || 1 })
        .eq('id', promptId);

      if (error) throw error;
      fetchPrompts();
    } catch (error) {
      console.error('Error updating usage count:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading custom prompts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Custom AI Prompts</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Buat Prompt Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Buat Custom Prompt</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Judul prompt..."
                value={newPrompt.title}
                onChange={(e) => setNewPrompt(prev => ({ ...prev, title: e.target.value }))}
              />
              <Select value={newPrompt.category} onValueChange={(value) => setNewPrompt(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="visualization">Visualization</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Tulis prompt Anda di sini..."
                value={newPrompt.prompt_text}
                onChange={(e) => setNewPrompt(prev => ({ ...prev, prompt_text: e.target.value }))}
                rows={6}
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="public"
                  checked={newPrompt.is_public}
                  onChange={(e) => setNewPrompt(prev => ({ ...prev, is_public: e.target.checked }))}
                />
                <label htmlFor="public" className="text-sm">Bagikan dengan publik</label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Batal
                </Button>
                <Button onClick={createPrompt}>
                  Simpan Prompt
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prompts.map((prompt) => (
          <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{prompt.title}</CardTitle>
                <div className="flex space-x-1">
                  {prompt.is_public && (
                    <Badge variant="secondary">
                      <Share2 className="w-3 h-3 mr-1" />
                      Public
                    </Badge>
                  )}
                  <Badge variant="outline">
                    <Heart className="w-3 h-3 mr-1" />
                    {prompt.usage_count}
                  </Badge>
                </div>
              </div>
              <Badge>{prompt.category}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {prompt.prompt_text}
              </p>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(prompt.prompt_text);
                  usePrompt(prompt.id);
                  toast.success('Prompt disalin ke clipboard!');
                }}
              >
                Gunakan Prompt
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {prompts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Belum ada custom prompts. Buat yang pertama!</p>
        </div>
      )}
    </div>
  );
};
