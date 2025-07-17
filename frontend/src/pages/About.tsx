
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Users, Zap, Heart, Globe, Award } from 'lucide-react';

const About = () => {
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
          <a href="/features" className="hover:text-blue-400 transition-colors text-white/80">Fitur</a>
          <a href="/pricing" className="hover:text-blue-400 transition-colors text-white/80">Harga</a>
          <a href="/about" className="text-blue-400">Tentang</a>
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

      {/* About Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Tentang SoraData
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Demokratisasi Analisis Data untuk Semua Orang Indonesia 🇮🇩
          </p>
        </div>

        {/* Main Description */}
        <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 mb-12">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              SoraData adalah platform AI Data Analyst Indonesia yang dirancang untuk membantu siapa saja—UMKM, pelajar, guru, organisasi, atau perusahaan—untuk memahami dan menganalisis data tanpa perlu keahlian teknis atau coding.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              Dengan SoraData, Anda cukup upload data Excel, CSV, atau JSON, lalu AI kami akan secara otomatis membersihkan data, membuat insight, menampilkan grafik, dan memberikan rekomendasi konkret—all in Bahasa Indonesia.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Semua proses berlangsung cepat, data Anda aman dan privasi terjamin. SoraData hadir untuk membuat data Anda benar-benar "berbicara", menjadi dasar pengambilan keputusan bisnis yang lebih baik, dan meningkatkan produktivitas tanpa ribet.
            </p>
          </div>
        </div>

        {/* Values/Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Globe,
              title: "100% Bahasa Indonesia",
              description: "Platform AI pertama yang benar-benar memahami konteks dan budaya Indonesia dalam analisis data"
            },
            {
              icon: Users,
              title: "Untuk Semua Kalangan",
              description: "Dari UMKM hingga perusahaan besar, dari pelajar hingga profesional—semua bisa menggunakan SoraData"
            },
            {
              icon: Zap,
              title: "Tanpa Coding",
              description: "Tidak perlu keahlian teknis atau programming. Cukup upload data, chat dengan AI, dan dapatkan insight"
            },
            {
              icon: Shield,
              title: "Data Aman & Privasi",
              description: "Keamanan data Anda adalah prioritas utama kami dengan enkripsi tingkat enterprise"
            },
            {
              icon: Award,
              title: "AI Terdepan",
              description: "Menggunakan teknologi AI terbaru yang dioptimalkan khusus untuk data dan konteks Indonesia"
            },
            {
              icon: Heart,
              title: "Made for Indonesia",
              description: "Dikembangkan oleh dan untuk Indonesia, memahami kebutuhan unik pasar lokal"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-slate-900/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/40 transition-all duration-300 group">
              <feature.icon className="w-12 h-12 text-blue-400 mb-4 group-hover:text-cyan-400 transition-colors" />
              <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-slate-900/50 to-blue-900/30 backdrop-blur-xl rounded-3xl p-12 border border-slate-600/50">
            <h3 className="text-3xl font-bold mb-4 text-white">
              Misi Kami
            </h3>
            <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Memberdayakan setiap orang Indonesia untuk membuat keputusan berbasis data yang lebih baik, 
              tanpa hambatan teknis, dalam bahasa yang mereka pahami, dengan teknologi yang mereka percayai.
            </p>
            
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 text-xl px-10 py-4"
              onClick={() => window.location.href = '/auth'}
            >
              Bergabung dengan SoraData
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
