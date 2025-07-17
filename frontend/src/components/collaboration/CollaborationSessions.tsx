
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
import { Users, Play, Plus, Clock } from 'lucide-react';

interface CollaborationSession {
  id: string;
  file_id: string;
  session_name: string;
  created_by: string;
  is_active: boolean;
  created_at: string;
  user_files?: {
    filename: string;
  };
  session_participants?: Array<{
    user_id: string;
    is_online: boolean;
  }>;
}

interface UserFile {
  id: string;
  filename: string;
}

export const CollaborationSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [userFiles, setUserFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newSession, setNewSession] = useState({
    session_name: '',
    file_id: ''
  });

  useEffect(() => {
    if (user) {
      fetchSessions();
      fetchUserFiles();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select(`
          *,
          user_files (filename),
          session_participants (user_id, is_online)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Gagal memuat session kolaborasi');
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

  const createSession = async () => {
    if (!user || !newSession.session_name || !newSession.file_id) return;

    try {
      const { error } = await supabase
        .from('collaboration_sessions')
        .insert([{
          ...newSession,
          created_by: user.id
        }]);

      if (error) throw error;

      toast.success('Session kolaborasi berhasil dibuat!');
      setNewSession({ session_name: '', file_id: '' });
      setIsCreating(false);
      fetchSessions();
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Gagal membuat session kolaborasi');
    }
  };

  const joinSession = async (sessionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('session_participants')
        .upsert([{
          session_id: sessionId,
          user_id: user.id,
          is_online: true
        }]);

      if (error) throw error;
      toast.success('Berhasil bergabung ke session!');
      fetchSessions();
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error('Gagal bergabung ke session');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading collaboration sessions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Session Kolaborasi</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Buat Session Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Session Kolaborasi</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Nama session..."
                value={newSession.session_name}
                onChange={(e) => setNewSession(prev => ({ ...prev, session_name: e.target.value }))}
              />
              <Select value={newSession.file_id} onValueChange={(value) => setNewSession(prev => ({ ...prev, file_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih file untuk dikolaborasi" />
                </SelectTrigger>
                <SelectContent>
                  {userFiles.map((file) => (
                    <SelectItem key={file.id} value={file.id}>
                      {file.filename}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Batal
                </Button>
                <Button onClick={createSession}>
                  Buat Session
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <Card key={session.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{session.session_name}</CardTitle>
                <Badge variant={session.is_active ? "default" : "secondary"}>
                  {session.is_active ? "Aktif" : "Selesai"}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                File: {session.user_files?.filename}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">
                    {session.session_participants?.filter(p => p.is_online).length || 0} online
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    {new Date(session.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <Button 
                size="sm" 
                className="w-full"
                disabled={!session.is_active}
                onClick={() => joinSession(session.id)}
              >
                <Play className="w-4 h-4 mr-2" />
                {session.created_by === user?.id ? 'Buka Session' : 'Gabung Session'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Belum ada session kolaborasi. Buat yang pertama!</p>
        </div>
      )}
    </div>
  );
};
