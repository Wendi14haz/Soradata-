
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ProFeaturesGuardProps {
  children: React.ReactNode;
}

export const ProFeaturesGuard = ({ children }: ProFeaturesGuardProps) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  // For demo purposes, check if user email contains "pro" or is the test user
  const isPro = user?.email?.includes('pro') || user?.email === 'protester@soradata.id';
  
  if (!isPro) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Card className={`max-w-md w-full text-center ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardContent className="p-8">
            <div className="mb-6">
              <Lock className="w-20 h-20 mx-auto text-yellow-500 mb-4" />
              <Crown className="w-12 h-12 mx-auto text-yellow-500 -mt-8 ml-8" />
            </div>
            
            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Fitur PRO Terkunci 🔒
            </h2>
            
            <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-yellow-900/30 border border-yellow-600' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800'}`}>
                ⚠️ Fitur ini hanya tersedia untuk pengguna PRO. Silakan upgrade untuk mengaksesnya.
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <Crown className="w-4 h-4 text-yellow-500" />
                <span>Analisis AI Lanjutan</span>
              </div>
              <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <Crown className="w-4 h-4 text-yellow-500" />
                <span>Visualisasi Interaktif</span>
              </div>
              <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <Crown className="w-4 h-4 text-yellow-500" />
                <span>Prediksi & Forecasting</span>
              </div>
              <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <Crown className="w-4 h-4 text-yellow-500" />
                <span>Chat dengan Data</span>
              </div>
            </div>
            
            <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade ke PRO
            </Button>
            
            <p className={`text-xs mt-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              💡 Tip: Gunakan email protester@soradata.id untuk testing
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
