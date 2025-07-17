
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Share2, Plus, Eye, Edit, Trash2, Mail } from 'lucide-react';
import { toast } from 'sonner';

export const SharedProjects = () => {
  const { user } = useAuth();
  const [sharedProjects, setSharedProjects] = useState<any[]>([]);
  const [userFiles, setUserFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    file_id: '',
    shared_with_email: '',
    permissions: 'view'
  });

  useEffect(() => {
    fetchSharedProjects();
    fetchUserFiles();
  }, []);

  const fetchSharedProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('shared_projects')
        .select(`
          *,
          user_files (original_filename, file_type)
        `)
        .eq('owner_id', user?.id)
        .order('shared_at', { ascending: false });

      if (error) throw error;
      setSharedProjects(data || []);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_files')
        .select('id, original_filename, file_type')
        .eq('user_id', user?.id)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setUserFiles(data || []);
    } catch (error: any) {
      console.error('Error fetching files:', error);
    }
  };

  const shareProject = async () => {
    try {
      // In a real app, you'd verify the email exists
      const { error } = await supabase
        .from('shared_projects')
        .insert({
          file_id: formData.file_id,
          owner_id: user?.id,
          shared_with_id: user?.id, // In real app, get user ID from email
          permissions: formData.permissions
        });

      if (error) throw error;
      
      toast.success('🔗 Project berhasil dibagikan!');
      setFormData({ file_id: '', shared_with_email: '', permissions: 'view' });
      setShowForm(false);
      fetchSharedProjects();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const deleteSharedProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shared_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSharedProjects(sharedProjects.filter(p => p.id !== id));
      toast.success('🗑️ Sharing berhasil dihapus!');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const updatePermissions = async (id: string, newPermissions: string) => {
    try {
      const { error } = await supabase
        .from('shared_projects')
        .update({ permissions: newPermissions })
        .eq('id', id);

      if (error) throw error;
      
      fetchSharedProjects();
      toast.success('✅ Permission berhasil diperbarui!');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

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
              <Share2 className="h-5 w-5 text-orange-400" />
              🔗 Project Sharing
            </CardTitle>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Bagikan Project
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <Card className="mb-6 bg-gray-600 border-gray-500">
              <CardHeader>
                <CardTitle className="text-white text-lg">🔗 Bagikan Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pilih File untuk Dibagikan
                  </label>
                  <select
                    value={formData.file_id}
                    onChange={(e) => setFormData({ ...formData, file_id: e.target.value })}
                    className="w-full p-2 bg-gray-500 border border-gray-400 rounded text-white"
                  >
                    <option value="">Pilih file...</option>
                    {userFiles.map(file => (
                      <option key={file.id} value={file.id}>
                        {file.original_filename} ({file.file_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Pengguna
                  </label>
                  <Input
                    type="email"
                    value={formData.shared_with_email}
                    onChange={(e) => setFormData({ ...formData, shared_with_email: e.target.value })}
                    placeholder="user@example.com"
                    className="bg-gray-500 border-gray-400 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Level Permission
                  </label>
                  <select
                    value={formData.permissions}
                    onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                    className="w-full p-2 bg-gray-500 border border-gray-400 rounded text-white"
                  >
                    <option value="view">👁️ View Only (Hanya Lihat)</option>
                    <option value="edit">✏️ Edit (Bisa Edit)</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={shareProject}
                    disabled={!formData.file_id || !formData.shared_with_email}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    🚀 Bagikan Project
                  </Button>
                  <Button
                    onClick={() => setShowForm(false)}
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
            {sharedProjects.map((project) => (
              <Card key={project.id} className="bg-gray-600 border-gray-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">
                        📄 {project.user_files?.original_filename || 'File tidak ditemukan'}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs border-gray-400 text-gray-300">
                          {project.user_files?.file_type || 'unknown'}
                        </Badge>
                        <Badge className={project.permissions === 'edit' ? 'bg-orange-600' : 'bg-blue-600'}>
                          {project.permissions === 'edit' ? '✏️ Edit' : '👁️ View'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>📧 Shared with: user#{project.shared_with_id.substring(0, 8)}</span>
                        <span>📅 {new Date(project.shared_at).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 ml-4">
                      <select
                        value={project.permissions}
                        onChange={(e) => updatePermissions(project.id, e.target.value)}
                        className="text-xs p-1 bg-gray-500 border border-gray-400 rounded text-white"
                      >
                        <option value="view">👁️ View</option>
                        <option value="edit">✏️ Edit</option>
                      </select>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteSharedProject(project.id)}
                        className="border-red-400 text-red-400 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {sharedProjects.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Share2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Project yang Dibagikan</h3>
              <p>Mulai bagikan project dengan tim untuk kolaborasi yang lebih baik!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
