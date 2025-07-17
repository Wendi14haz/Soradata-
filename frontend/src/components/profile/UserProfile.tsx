
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { User, Mail, Calendar, Star, FileText, BarChart3, Sparkles, Save, Shield, CheckCircle, AlertTriangle, Edit, Lock, Settings } from 'lucide-react';
import { toast } from 'sonner';

export const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setProfile(data);
      setFullName(data?.full_name || user?.user_metadata?.full_name || '');
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Get files count
      const { count: filesCount } = await supabase
        .from('user_files')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Get analyses count
      const { count: analysesCount } = await supabase
        .from('data_analyses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Get custom prompts count
      const { count: promptsCount } = await supabase
        .from('custom_prompts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      setStats({
        filesCount: filesCount || 0,
        analysesCount: analysesCount || 0,
        promptsCount: promptsCount || 0
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          full_name: fullName,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast.success('✅ Profil berhasil diperbarui!');
      await fetchProfile();
    } catch (error: any) {
      toast.error(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'Tidak diketahui';

  const subscriptionPlan = profile?.subscription_plan || 'Free';
  const planLimits = {
    Free: { files: 5, color: 'bg-gray-500' },
    Plus: { files: 50, color: 'bg-purple-500' },
    Pro: { files: 500, color: 'bg-green-500' },
    Business: { files: 1000, color: 'bg-orange-500' }
  };
  
  const currentPlan = planLimits[subscriptionPlan as keyof typeof planLimits] || planLimits.Free;
  const usageProgress = (stats.filesCount / currentPlan.files) * 100;

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <User className="h-5 w-5 text-blue-400" />
            👤 Profil Pengguna
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6 space-y-4 lg:space-y-0">
            {/* Avatar and Basic Info */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-3xl">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-2 -right-2">
                  {user?.email_confirmed_at ? (
                    <CheckCircle className="w-6 h-6 text-green-500 bg-gray-800 rounded-full" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-yellow-500 bg-gray-800 rounded-full" />
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-white">
                    {fullName || user?.email}
                  </h2>
                  <Badge className={`${currentPlan.color} text-white`}>
                    {subscriptionPlan}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    Member sejak {memberSince}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Shield className="w-4 h-4" />
                    {user?.email_confirmed_at ? (
                      <span className="text-green-400">Email Terverifikasi</span>
                    ) : (
                      <span className="text-yellow-400">Email Belum Terverifikasi</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col space-y-2 lg:min-w-[200px]">
              <Button className="bg-blue-600 hover:bg-blue-700 smart-button" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profil
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 smart-button" size="sm">
                <Lock className="w-4 h-4 mr-2" />
                Ganti Password
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 smart-button" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Kelola Akun
              </Button>
            </div>
          </div>

          {/* Edit Profile Section */}
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nama Lengkap
              </label>
              <div className="flex gap-2">
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap Anda"
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Button
                  onClick={updateProfile}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 smart-button"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="h-5 w-5 text-green-400" />
            📊 Statistik Penggunaan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-6 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-400">{stats.filesCount}</p>
              <p className="text-sm text-gray-300">File Diupload</p>
            </div>
            
            <div className="text-center p-6 bg-purple-500/20 rounded-lg border border-purple-500/30">
              <BarChart3 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-400">{stats.analysesCount}</p>
              <p className="text-sm text-gray-300">Analisis Selesai</p>
            </div>
            
            <div className="text-center p-6 bg-orange-500/20 rounded-lg border border-orange-500/30">
              <Sparkles className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-orange-400">{stats.promptsCount}</p>
              <p className="text-sm text-gray-300">Custom Prompts</p>
            </div>
          </div>

          {/* Usage Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-300">
                📁 Upload Limit ({subscriptionPlan})
              </span>
              <span className="text-sm text-gray-400">
                {stats.filesCount} / {currentPlan.files} files
              </span>
            </div>
            <Progress value={Math.min(usageProgress, 100)} className="w-full h-2" />
            {usageProgress >= 90 && (
              <p className="text-xs text-yellow-400">
                ⚠️ Anda hampir mencapai batas upload. Pertimbangkan untuk upgrade paket.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Star className="h-5 w-5 text-yellow-400" />
            ⭐ Aksi Akun
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!user?.email_confirmed_at && (
              <div className="flex items-center justify-between p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                <div>
                  <h3 className="font-medium text-white">📧 Verifikasi Email</h3>
                  <p className="text-sm text-yellow-300">Verifikasi email Anda untuk keamanan akun yang lebih baik</p>
                </div>
                <Button className="bg-yellow-600 hover:bg-yellow-700 smart-button">
                  Verifikasi
                </Button>
              </div>
            )}
            
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-white">🚀 Upgrade ke Plan Pro</h3>
                <p className="text-sm text-gray-400">Dapatkan fitur unlimited dan prioritas support</p>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 smart-button">
                Upgrade Sekarang
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-white">📧 Newsletter SoraData</h3>
                <p className="text-sm text-gray-400">Dapatkan tips analisis data dan update fitur terbaru</p>
              </div>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-600 smart-button">
                Berlangganan
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-white">💬 Feedback & Saran</h3>
                <p className="text-sm text-gray-400">Bantu kami meningkatkan SoraData</p>
              </div>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-600 smart-button">
                Kirim Feedback
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
