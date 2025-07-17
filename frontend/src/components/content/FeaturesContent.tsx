
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';

export const FeaturesContent = () => {
  const { theme } = useTheme();
  
  const features = [
    {
      title: "AI Chat Analytics",
      description: "Analisis data dengan percakapan natural dalam Bahasa Indonesia",
      badge: "Core"
    },
    {
      title: "Auto Data Cleaning",
      description: "Pembersihan data otomatis untuk hasil analisis yang akurat",
      badge: "Pro"
    },
    {
      title: "Smart Visualization",
      description: "Pembuatan grafik dan chart otomatis berdasarkan jenis data",
      badge: "Plus"
    },
    {
      title: "Collaborative Workspace",
      description: "Kolaborasi tim dalam satu workspace untuk analisis bersama",
      badge: "Business"
    },
    {
      title: "Custom AI Models",
      description: "Model AI yang disesuaikan dengan kebutuhan industri spesifik",
      badge: "Enterprise"
    },
    {
      title: "API Integration",
      description: "Integrasi dengan sistem existing melalui REST API",
      badge: "Business"
    }
  ];

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`border-b p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Fitur Lanjutan</h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Jelajahi semua fitur canggih SoraData untuk analisis data yang lebih mendalam</p>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className={`transition-colors hover:shadow-lg ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{feature.title}</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      feature.badge === 'Core' ? 'border-blue-500 text-blue-400' :
                      feature.badge === 'Pro' ? 'border-purple-500 text-purple-400' :
                      feature.badge === 'Plus' ? 'border-green-500 text-green-400' :
                      feature.badge === 'Business' ? 'border-orange-500 text-orange-400' :
                      'border-red-500 text-red-400'
                    }`}
                  >
                    {feature.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
