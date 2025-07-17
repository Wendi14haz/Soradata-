
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { Check, Crown, Star, Zap, Building } from "lucide-react";

export const PricingContent = () => {
  const { theme } = useTheme();
  
  const plans = [
    {
      name: "Free",
      originalPrice: null,
      price: "Rp0",
      period: "/bulan",
      discount: null,
      features: [
        "5 file per bulan",
        "Chat AI dasar",
        "Export PNG",
        "Data hingga 1MB",
        "Riwayat 7 hari"
      ],
      icon: Star,
      popular: false,
      buttonText: "Mulai Gratis"
    },
    {
      name: "Plus",
      originalPrice: "Rp89.000",
      price: "Rp29.000",
      period: "/bulan",
      discount: "67%",
      features: [
        "50 file per bulan",
        "Chat AI unlimited",
        "Export semua format",
        "Data hingga 10MB",
        "Riwayat analisis unlimited",
        "Grafik interaktif",
        "Email support"
      ],
      icon: Crown,
      popular: true,
      buttonText: "Upgrade ke Plus"
    },
    {
      name: "Pro",
      originalPrice: "Rp179.000",
      price: "Rp79.000",
      period: "/bulan",
      discount: "56%",
      features: [
        "500 file per bulan",
        "AI insights advanced",
        "Kolaborasi tim (5 anggota)",
        "Data hingga 100MB",
        "Custom branding",
        "API access",
        "Priority support",
        "Advanced visualizations"
      ],
      icon: Zap,
      popular: false,
      buttonText: "Upgrade ke Pro"
    },
    {
      name: "Business",
      originalPrice: "Rp499.000",
      price: "Rp259.000",
      period: "/bulan",
      discount: "48%",
      features: [
        "Unlimited files",
        "AI insights enterprise",
        "Kolaborasi tim unlimited",
        "Data hingga 1GB",
        "White label solution",
        "Dedicated API",
        "24/7 phone support",
        "Custom integrations",
        "SLA guarantee"
      ],
      icon: Building,
      popular: false,
      buttonText: "Hubungi Sales"
    }
  ];

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`border-b p-6 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Data Harga</h2>
        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Pilih paket yang sesuai dengan kebutuhan analisis data Anda
        </p>
        
        <div className="flex items-center justify-center space-x-2 mt-4">
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 animate-pulse">
            🔥 Promo Terbatas
          </Badge>
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Hemat hingga 67% untuk pelanggan baru!
          </span>
        </div>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={index} 
                className={`relative transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'ring-2 ring-purple-500/20 border-purple-500' 
                    : theme === 'dark' 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                } ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                {/* Discount Badge */}
                {plan.discount && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <Badge className="bg-red-500 text-white animate-pulse">
                      Diskon {plan.discount}
                    </Badge>
                  </div>
                )}
                
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-purple-500 text-white px-4 py-1">
                      ⭐ Populer
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-3">
                    <IconComponent className={`w-8 h-8 ${
                      plan.popular ? 'text-purple-500' : 'text-blue-500'
                    }`} />
                  </div>
                  
                  <CardTitle className={`text-xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {plan.name}
                  </CardTitle>
                  
                  <div className="space-y-2">
                    {plan.originalPrice && (
                      <div className={`line-through text-base ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {plan.originalPrice}
                      </div>
                    )}
                    <div className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {plan.price}
                      <span className={`text-sm font-normal ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {plan.period}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className={`flex items-start space-x-3 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full py-3 font-medium ${
                      plan.popular
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className={`mt-16 pt-16 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="max-w-4xl mx-auto">
            <h3 className={`text-2xl font-bold text-center mb-12 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Pertanyaan Umum
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Apakah ada trial gratis?
                </h4>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  Ya! Paket Free tersedia selamanya dengan limit 5 file per bulan. Tidak perlu kartu kredit.
                </p>
              </div>
              
              <div className="space-y-4">
                <h4 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Bisakah upgrade atau downgrade kapan saja?
                </h4>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  Tentu! Anda bisa mengubah paket kapan saja tanpa penalti. Billing akan disesuaikan secara proporsional.
                </p>
              </div>
              
              <div className="space-y-4">
                <h4 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Apakah data saya aman?
                </h4>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  Sangat aman. Kami menggunakan enkripsi end-to-end dan tidak menyimpan data Anda di server setelah analisis selesai.
                </p>
              </div>
              
              <div className="space-y-4">
                <h4 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Bagaimana cara pembayaran?
                </h4>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  Kami menerima transfer bank, e-wallet (GoPay, OVO, DANA), dan kartu kredit. Pembayaran aman dengan SSL.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
