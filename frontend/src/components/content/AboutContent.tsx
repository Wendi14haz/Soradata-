
import { useTheme } from '@/contexts/ThemeContext';

export const AboutContent = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`border-b p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Tentang SoraData</h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Kenali lebih dalam platform AI Data Analyst Indonesia</p>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6 max-w-3xl">
          <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Apa itu SoraData?</h3>
            <p className={`leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              SoraData adalah platform AI Data Analyst Indonesia yang dirancang untuk membantu siapa saja—UMKM, pelajar, guru, organisasi, atau perusahaan—untuk memahami dan menganalisis data tanpa perlu keahlian teknis atau coding.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Bagaimana Cara Kerja?</h3>
            <p className={`leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Dengan SoraData, Anda cukup upload data Excel, CSV, atau JSON, lalu AI kami akan secara otomatis membersihkan data, membuat insight, menampilkan grafik, dan memberikan rekomendasi konkret—all in Bahasa Indonesia.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Keunggulan SoraData</h3>
            <p className={`leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Semua proses berlangsung cepat, data Anda aman dan privasi terjamin. SoraData hadir untuk membuat data Anda benar-benar "berbicara", menjadi dasar pengambilan keputusan bisnis yang lebih baik, dan meningkatkan produktivitas tanpa ribet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
