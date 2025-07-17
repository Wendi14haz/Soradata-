
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Share2, Eye, Edit, Plus } from 'lucide-react';

interface SharedProject {
  id: string;
  file_id: string;
  owner_id: string;
  shared_with_id: string;
  permissions: string;
  shared_at: string;
  user_files?: {
    filename: string;
    file_type: string;
  };
}

interface UserFile {
  id: string;
  filename: string;
}

export const SharedProjects = () => {
  const { user } = useAuth();
  const [sharedProjects, setSharedProjects] = useState<SharedProject[]>([]);
  const [userFiles, setUserFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [newShare, setNewShare] = useState({
    file_id: '',
    shared_with_email: '',
    permissions: 'view'
  });

  useEffect(() => {
    if (user) {
      fetchSharedProjects();
      fetchUserFiles();
    }
  }, [user]);

  const fetchSharedProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('shared_projects')
        .select(`
          *,
          user_files (filename, file_type)
        `)
        .order('shared_at', { ascending: false });

      if (error) throw error;
      setSharedProjects(data || []);
    } catch (error) {
      console.error('Error fetching shared projects:', error);
      toast.error('Gagal memuat project yang dibagikan');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_files')
        .select('id, filename')
        .eq('user_id', user?.id);

      if (error) throw error;
      setUserFiles(data || []);
    } catch (error) {
      console.error('Error fetching user files:', error);
    }
  };

  const shareProject = async () => {
    if (!user || !newShare.file_id || !newShare.shared_with_email) return;

    try {
      // Di implementasi nyata, Anda perlu mencari user berdasarkan email
      // Untuk demo ini, kita asumsikan shared_with_id ada
      const { error } = await supabase
        .from('shared_projects')
        .insert([{
          file_id: newShare.file_id,
          owner_id: user.id,
          shared_with_id: newShare.shared_with_email, // Seharusnya user ID
          permissions: newShare.permissions
        }]);

      if (error) throw error;

      toast.success('Project berhasil dibagikan!');
      setNewShare({ file_id: '', shared_with_email: '', permissions: 'view' });
      setIsSharing(false);
      fetchSharedProjects();
    } catch (error) {
      console.error('Error sharing project:', error);
      toast.error('Gagal membagikan project');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading shared projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project yang Dibagikan</h2>
        <Dialog open={isSharing} onOpenChange={setIsSharing}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Bagikan Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bagikan Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={newShare.file_id} onValueChange={(value) => setNewShare(prev => ({ ...prev, file_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih file untuk dibagikan" />
                </SelectTrigger>
                <SelectContent>
                  {userFiles.map((file) => (
                    <SelectItem key={file.id} value={file.id}>
                      {file.filename}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="email"
                placeholder="Email pengguna..."
                value={newShare.shared_with_email}
                onChange={(e) => setNewShare(prev => ({ ...prev, shared_with_email: e.target.value }))}
              />
              <Select value={newShare.permissions} onValueChange={(value) => setNewShare(prev => ({ ...prev, permissions: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">Hanya Lihat</SelectItem>
                  <SelectItem value="edit">Lihat & Edit</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsSharing(false)}>
                  Batal
                </Button>
                <Button onClick={shareProject}>
                  Bagikan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sharedProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  {project.user_files?.filename}
                </CardTitle>
                <Badge variant={project.permissions === 'edit' ? "default" : "secondary"}>
                  {project.permissions === 'edit' ? (
                    <><Edit className="w-3 h-3 mr-1" />Edit</>
                  ) : (
                    <><Eye className="w-3 h-3 mr-1" />View</>
                  )}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {project.user_files?.file_type}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">
                    {project.owner_id === user?.id ? 'Dibagikan ke:' : 'Dibagikan oleh:'}
                  </span>
                  <br />
                  {project.owner_id === user?.id ? project.shared_with_id : project.owner_id}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(project.shared_at).toLocaleDateString()}
                </p>
              </div>
              
              <Button size="sm" className="w-full mt-4">
                <Share2 className="w-4 h-4 mr-2" />
                Buka Project
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {sharedProjects.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Belum ada project yang dibagikan.</p>
        </div>
      )}
    </div>
  );
};
