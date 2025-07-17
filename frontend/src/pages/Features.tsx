
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain, Upload, Eye, Sparkles, Target, Download } from 'lucide-react';

const Features = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between backdrop-blur-sm border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/5592343a-9de5-48ce-8f71-58ce73f57dd1.png" 
            alt="SoraData Logo" 
            className="w-10 h-10 object-contain filter drop-shadow-lg"
          />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SORADATA
          </h1>
        </div>
        <nav className="hidden md:flex space-x-6 items-center">
          <a href="/" className="hover:text-blue-400 transition-colors text-white/80">Beranda</a>
          <a href="#harga" className="hover:text-blue-400 transition-colors text-white/80">Harga</a>
          <a href="#tentang" className="hover:text-blue-400 transition-colors text-white/80">Tentang</a>
          <Button 
            variant="outline" 
            className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20 bg-slate-800/50 backdrop-blur-sm"
            onClick={() => window.location.href = '/auth'}
          >
            Masuk
          </Button>
        </nav>
      </header>

      {/* Back Button */}
      <div className="container mx-auto px-6 py-6">
        <Button 
          variant="ghost" 
          className="text-gray-400 hover:text-white"
          onClick={() => window.location.href = '/'}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </Button>
      </div>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Fitur Unggulan SoraData
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Platform analisis data terlengkap dengan AI chat berbahasa Indonesia
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: "Chat AI Bahasa Indonesia",
              description: "Tanyakan apa saja tentang data Anda dalam bahasa Indonesia yang natural dan mudah dipahami"
            },
            {
              icon: Upload,
              title: "Upload & Parsing Otomatis", 
              description: "Dukung Excel, CSV, JSON dengan parsing otomatis dan cepat tanpa perlu setup rumit"
            },
            {
              icon: Eye,
              title: "Visualisasi Otomatis",
              description: "Bar, line, pie, boxplot, heatmap dibuat otomatis sesuai karakteristik data Anda"
            },
            {
              icon: Sparkles,
              title: "Storytelling Insight",
              description: "Penjelasan mudah dipahami dalam bahasa awam untuk semua kalangan dan profesi"
            },
            {
              icon: Target,
              title: "Rekomendasi Actionable",
              description: "AI memberikan saran konkret yang bisa langsung ditindaklanjuti untuk bisnis Anda"
            },
            {
              icon: Download,
              title: "Export Fleksibel",
              description: "Download laporan dalam format PDF, Word, Excel, atau PNG sesuai kebutuhan"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-slate-900/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group">
              <feature.icon className="w-12 h-12 text-blue-400 mb-4 group-hover:text-cyan-400 transition-colors" />
              <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-slate-900/50 to-blue-900/30 backdrop-blur-xl rounded-3xl p-12 border border-slate-600/50">
            <h3 className="text-3xl font-bold mb-4 text-white">
              Siap mencoba semua fitur ini?
            </h3>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Mulai analisis data Anda sekarang juga dengan teknologi AI terdepan
            </p>
            
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 text-xl px-10 py-4"
              onClick={() => window.location.href = '/auth'}
            >
              <Upload className="w-6 h-6 mr-3" />
              Mulai Sekarang
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
