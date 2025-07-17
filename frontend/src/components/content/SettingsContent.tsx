
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { User, Lock, Palette, Download, Settings, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { toast } from 'sonner';

export const SettingsContent = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setTimeout(() => {
      toast.success(t('common.success'));
      setIsLoading(false);
    }, 1000);
  };

  const handleChangePassword = async () => {
    setIsLoading(true); 
    setTimeout(() => {
      toast.success(t('common.success'));
      setIsLoading(false);
    }, 1000);
  };

  const handleDownloadData = () => {
    toast.success('Data sedang dipersiapkan untuk download');
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as 'id' | 'en');
    toast.success(language === 'id' ? 'Bahasa berhasil diubah' : 'Language changed successfully');
  };

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className={`border-b p-6 ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} backdrop-blur`}>
        <div className="flex items-center">
          <Settings className="w-6 h-6 mr-3" />
          <h2 className="text-2xl font-semibold">{t('settings.title')}</h2>
        </div>
        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Kelola preferensi dan pengaturan akun Anda
        </p>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* Language Settings */}
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              {t('settings.language')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {t('settings.language')}
                </Label>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                  Pilih bahasa untuk antarmuka aplikasi
                </p>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className={`w-40 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">🇮🇩 Bahasa Indonesia</SelectItem>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              {t('settings.theme')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {t('settings.dark_mode')}
                </Label>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                  Gunakan tema gelap untuk tampilan yang nyaman di mata
                </p>
              </div>
              <Switch 
                checked={theme === 'dark'} 
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Profile */}
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              {t('settings.profile')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="fullName" className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  Nama Lengkap
                </Label>
                <Input 
                  id="fullName" 
                  defaultValue={user?.user_metadata?.full_name || ''} 
                  className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div>
                <Label htmlFor="email" className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  Email
                </Label>
                <Input 
                  id="email" 
                  value={user?.email || ''} 
                  disabled 
                  className={`${theme === 'dark' ? 'bg-gray-600 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
                />
              </div>
            </div>
            <Button 
              onClick={handleSaveProfile} 
              disabled={isLoading} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? t('settings.saving') : t('settings.save_changes')}
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              {t('settings.security')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="currentPassword" className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  Password Saat Ini
                </Label>
                <Input 
                  id="currentPassword" 
                  type="password" 
                  className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div>
                <Label htmlFor="newPassword" className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  Password Baru
                </Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
            </div>
            <Button 
              onClick={handleChangePassword} 
              disabled={isLoading} 
              className="bg-red-600 hover:bg-red-700"
            >
              <Lock className="w-4 h-4 mr-2" />
              {isLoading ? 'Mengubah...' : 'Ubah Password'}
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="w-5 h-5 mr-2" />
              {t('settings.data_management')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleDownloadData}
              variant="outline" 
              className={`w-full ${theme === 'dark' ? 'border-gray-600 bg-gray-900 hover:bg-gray-800 text-slate-50' : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-900'}`}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Data Saya
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
