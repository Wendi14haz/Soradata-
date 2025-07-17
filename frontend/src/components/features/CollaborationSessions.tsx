
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Users, Plus, UserPlus, Eye, Trash2, Circle } from 'lucide-react';
import { toast } from 'sonner';

export const CollaborationSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [userFiles, setUserFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    session_name: '',
    file_id: ''
  });

  useEffect(() => {
    fetchSessions();
    fetchUserFiles();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select(`
          *,
          user_files (original_filename, file_type),
          session_participants (
            id,
            user_id,
            is_online,
            joined_at
          )
        `)
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
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

  const createSession = async () => {
    try {
      const { error } = await supabase
        .from('collaboration_sessions')
        .insert({
          session_name: formData.session_name,
          file_id: formData.file_id,
          created_by: user?.id,
          is_active: true
        });

      if (error) throw error;
      
      toast.success('✅ Session kolaborasi berhasil dibuat!');
      setFormData({ session_name: '', file_id: '' });
      setShowForm(false);
      fetchSessions();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const deleteSession = async (id: string) => {
    try {
      const { error } = await supabase
        .from('collaboration_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSessions(sessions.filter(s => s.id !== id));
      toast.success('🗑️ Session berhasil dihapus!');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const toggleSessionStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('collaboration_sessions')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      
      fetchSessions();
      toast.success(`Session ${!isActive ? 'diaktifkan' : 'dinonaktifkan'}!`);
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
              <Users className="h-5 w-5 text-green-400" />
              👥 Session Kolaborasi Real-time
            </CardTitle>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Buat Session Baru
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <Card className="mb-6 bg-gray-600 border-gray-500">
              <CardHeader>
                <CardTitle className="text-white text-lg">➕ Buat Session Kolaborasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nama Session
                  </label>
                  <Input
                    value={formData.session_name}
                    onChange={(e) => setFormData({ ...formData, session_name: e.target.value })}
                    placeholder="Contoh: Analisis Data Penjualan Q4"
                    className="bg-gray-500 border-gray-400 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pilih File untuk Kolaborasi
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

                <div className="flex gap-2">
                  <Button
                    onClick={createSession}
                    disabled={!formData.session_name || !formData.file_id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    🚀 Buat Session
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
            {sessions.map((session) => (
              <Card key={session.id} className="bg-gray-600 border-gray-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white">{session.session_name}</h3>
                        <Badge className={session.is_active ? 'bg-green-600' : 'bg-gray-600'}>
                          <Circle className={`w-2 h-2 mr-1 ${session.is_active ? 'fill-green-300' : 'fill-gray-300'}`} />
                          {session.is_active ? '🟢 Aktif' : '⚫ Nonaktif'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-2">
                        📄 File: {session.user_files?.original_filename || 'File tidak ditemukan'}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>👥 Participants: {session.session_participants?.length || 0}</span>
                        <span>📅 Dibuat: {new Date(session.created_at).toLocaleDateString('id-ID')}</span>
                      </div>

                      {session.session_participants && session.session_participants.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-400 mb-1">Online sekarang:</p>
                          <div className="flex flex-wrap gap-1">
                            {session.session_participants.filter((p: any) => p.is_online).map((participant: any) => (
                              <Badge key={participant.id} className="text-xs bg-green-600/20 text-green-300">
                                🟢 User #{participant.user_id.substring(0, 8)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleSessionStatus(session.id, session.is_active)}
                        className="border-gray-400 text-gray-300 hover:bg-blue-600"
                      >
                        {session.is_active ? '⏸️' : '▶️'}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-400 text-gray-300 hover:bg-green-600"
                      >
                        <UserPlus className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteSession(session.id)}
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

          {sessions.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Session Kolaborasi</h3>
              <p>Buat session pertama untuk berkolaborasi dengan tim Anda!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
