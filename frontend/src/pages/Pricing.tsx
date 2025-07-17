
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
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
      color: "gray",
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
      color: "purple",
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
      color: "green",
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
      color: "orange",
      popular: false,
      buttonText: "Hubungi Sales"
    }
  ];

  const getColorClasses = (color: string, popular: boolean) => {
    const colors = {
      gray: "border-gray-600 bg-gray-800/50",
      purple: "border-purple-500 bg-purple-500/10",
      green: "border-green-500 bg-green-500/10",
      orange: "border-orange-500 bg-orange-500/10"
    };
    
    if (popular) {
      return "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20";
    }
    
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const getButtonClasses = (color: string, popular: boolean) => {
    if (popular) {
      return "bg-purple-600 hover:bg-purple-700 text-white smart-button";
    }
    
    const colors = {
      gray: "bg-gray-600 hover:bg-gray-700 text-white smart-button",
      purple: "bg-purple-600 hover:bg-purple-700 text-white smart-button",
      green: "bg-green-600 hover:bg-green-700 text-white smart-button",
      orange: "bg-orange-600 hover:bg-orange-700 text-white smart-button"
    };
    
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/5592343a-9de5-48ce-8f71-58ce73f57dd1.png" 
              alt="SoraData Logo" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              SoraData
            </span>
          </Link>
          
          <Link to="/">
            <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white smart-button">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Kembali
            </Button>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
          Paket Harga
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> SoraData</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Pilih paket yang sesuai dengan kebutuhan analisis data Anda. Semua paket termasuk AI Analyst dalam Bahasa Indonesia.
        </p>
        
        <div className="flex items-center justify-center space-x-2 mb-8">
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 animate-pulse">
            🔥 Promo Terbatas
          </Badge>
          <span className="text-gray-300">Hemat hingga 67% untuk pelanggan baru!</span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${getColorClasses(plan.color, plan.popular)} transition-all duration-300 hover:scale-105`}>
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
                <CardTitle className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </CardTitle>
                
                <div className="space-y-2">
                  {plan.originalPrice && (
                    <div className="text-gray-400 line-through text-lg">
                      {plan.originalPrice}
                    </div>
                  )}
                  <div className="text-4xl font-bold text-white">
                    {plan.price}
                    <span className="text-lg text-gray-400 font-normal">{plan.period}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-3 text-gray-300">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className={`w-full py-3 font-medium ${getButtonClasses(plan.color, plan.popular)}`}>
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Pertanyaan Umum
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Apakah ada trial gratis?
              </h3>
              <p className="text-gray-300">
                Ya! Paket Free tersedia selamanya dengan limit 5 file per bulan. Tidak perlu kartu kredit.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Bisakah upgrade atau downgrade kapan saja?
              </h3>
              <p className="text-gray-300">
                Tentu! Anda bisa mengubah paket kapan saja tanpa penalti. Billing akan disesuaikan secara proporsional.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Apakah data saya aman?
              </h3>
              <p className="text-gray-300">
                Sangat aman. Kami menggunakan enkripsi end-to-end dan tidak menyimpan data Anda di server setelah analisis selesai.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Bagaimana cara pembayaran?
              </h3>
              <p className="text-gray-300">
                Kami menerima transfer bank, e-wallet (GoPay, OVO, DANA), dan kartu kredit. Pembayaran aman dengan SSL.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900/50 backdrop-blur border-t border-gray-800">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 SoraData. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
