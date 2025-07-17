
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Calendar, FileText, BarChart3, Edit, Shield, Clock, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';
import { toast } from 'sonner';

export const ProfileContent = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || 'Pengguna SoraData',
    bio: 'Data analyst yang passionate dengan insights dan visualisasi data.'
  });

  // Mock data for demonstration
  const profileStats = {
    filesUploaded: 47,
    filesLimit: 50,
    analysisCompleted: 23,
    customPrompts: 8,
    totalActivity: 156,
    memberSince: "Januari 2024"
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success('Profil berhasil diperbarui');
      setIsEditing(false);
      setIsLoading(false);
    }, 1000);
  };

  const progressPercentage = profileStats.filesUploaded / profileStats.filesLimit * 100;

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`border-b p-4 ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Profil Pengguna
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Informasi lengkap dan statistik aktivitas Anda
        </p>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        {/* Profile Header */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-2xl">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName" className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        Nama Lengkap
                      </Label>
                      <Input 
                        id="fullName" 
                        value={profileData.fullName} 
                        onChange={e => setProfileData({
                          ...profileData,
                          fullName: e.target.value
                        })} 
                        className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio" className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        Bio
                      </Label>
                      <Input 
                        id="bio" 
                        value={profileData.bio} 
                        onChange={e => setProfileData({
                          ...profileData,
                          bio: e.target.value
                        })} 
                        className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} 
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {profileData.fullName}
                    </h3>
                    <p className={`mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {profileData.bio}
                    </p>
                  </>
                )}
                
                <div className={`flex items-center space-x-4 mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">Member sejak {profileStats.memberSince}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 mb-4">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    Free Plan
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    <Shield className="w-3 h-3 mr-1" />
                    Email Verified
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                {isEditing ? (
                  <>
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isLoading} 
                      className="bg-green-600 hover:bg-green-700 smart-button"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                    <Button 
                      onClick={() => setIsEditing(false)} 
                      variant="outline" 
                      className={`smart-button ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                      Batal
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setIsEditing(true)} 
                    className={`smart-button ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profil
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={`flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <FileText className="w-5 h-5 mr-2" />
                Upload File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Digunakan</span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {profileStats.filesUploaded} / {profileStats.filesLimit}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {profileStats.filesLimit - profileStats.filesUploaded} file tersisa bulan ini
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={`flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <BarChart3 className="w-5 h-5 mr-2" />
                Analisis Selesai
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-3xl font-bold text-blue-400 mb-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                  {profileStats.analysisCompleted}
                </div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total analisis berhasil
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Summary */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              Ringkasan Aktivitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className={`text-center p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <FileText className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {profileStats.filesUploaded}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  File Upload
                </div>
              </div>
              
              <div className={`text-center p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <BarChart3 className="w-8 h-8 mx-auto text-green-400 mb-2" />
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {profileStats.analysisCompleted}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Analisis
                </div>
              </div>
              
              <div className={`text-center p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <Clock className="w-8 h-8 mx-auto text-purple-400 mb-2" />
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {profileStats.totalActivity}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Aktivitas
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "Upload file", file: "sales-data-q4.xlsx", time: "2 jam lalu" },
                { action: "Analisis selesai", file: "customer-survey.csv", time: "5 jam lalu" },
                { action: "Export report", file: "revenue-analysis.pdf", time: "1 hari lalu" },
                { action: "Upload file", file: "inventory-data.json", time: "2 hari lalu" }
              ].map((activity, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}
                >
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {activity.action}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {activity.file}
                    </p>
                  </div>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              Aksi Akun
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button 
                variant="outline" 
                className={`smart-button ${theme === 'dark' ? 'border-gray-600 text-gray-300 bg-gray-900 hover:bg-gray-800' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
              >
                Ganti Password
              </Button>
              <Button 
                variant="outline" 
                className={`smart-button ${theme === 'dark' ? 'border-gray-600 text-gray-300 bg-gray-900 hover:bg-gray-800' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
              >
                Kelola Akun
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 smart-button">
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
