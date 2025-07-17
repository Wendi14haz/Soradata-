import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Upload, Shield, BarChart3, Star, Eye, Sparkles } from 'lucide-react';
const Index = () => {
  const {
    user
  } = useAuth();

  // Redirect authenticated users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDM3LCA5OSwgMjM1LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-60 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-40 left-40 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>

      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <img src="/lovable-uploads/5592343a-9de5-48ce-8f71-58ce73f57dd1.png" alt="SoraData Logo" className="w-10 h-10 object-contain filter drop-shadow-lg" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SORADATA
          </h1>
        </div>
        <nav className="hidden md:flex space-x-6 items-center">
          <a href="/features" className="hover:text-blue-400 transition-colors text-white/80">Fitur</a>
          <a href="/pricing" className="hover:text-blue-400 transition-colors text-white/80">Harga</a>
          <a href="/about" className="hover:text-blue-400 transition-colors text-white/80">Tentang</a>
          <Button variant="outline" className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20 bg-slate-800/50 backdrop-blur-sm" onClick={() => window.location.href = '/auth'}>
            Masuk
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-12 min-h-[80vh] flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left Side - Content */}
          <div className="space-y-8">
            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm text-blue-300 backdrop-blur-sm">AI Data Analyst Indonesia</span>
              <span className="px-4 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full text-sm text-green-300 backdrop-blur-sm">
                100% Bahasa Indonesia
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  SORADATA
                </span>
              </h1>
              
              <h2 className="text-2xl lg:text-3xl text-white font-medium">
                Membuka makna di balik Data anda
              </h2>
              
              <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
                Kami hadir untuk siapapun yang ingin data mereka berbicara. Soradata adalah Teman baru Anda dalam memahami data: upload, diskusi dengan AI, dapatkan insight, grafik, dan laporan spesifik siap pakai.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 text-lg px-8 py-4" onClick={() => window.location.href = '/auth'}>
                <Upload className="w-5 h-5 mr-2" />
                Mulai aja dulu
              </Button>
              <Button size="lg" variant="outline" className="bg-slate-800/50 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:shadow-cyan-500/25 backdrop-blur-sm text-lg px-8 py-4" onClick={() => window.location.href = '/auth'}>
                <Eye className="w-5 h-5 mr-2" />
                Coba Demo
              </Button>
            </div>

            {/* Statistics */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-400 pt-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Data Aman & Privasi Terjamin</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>1397+ file dianalisis</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>92% kepuasan user</span>
              </div>
            </div>
          </div>

          {/* Right Side - Mockup */}
          <div className="relative">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 space-y-6 shadow-2xl">
              {/* Chat with AI Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Diskusikan dengan Soradata</h3>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
                  <div className="flex items-center space-x-3 mb-4">
                    <Upload className="w-8 h-8 text-blue-400" />
                    <span className="text-gray-300">Suarakan Data anda</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full">
                    <div className="w-0 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <input type="text" placeholder="Tanyakan apa saja tentang data Anda..." className="w-full bg-transparent text-gray-300 placeholder-gray-500 outline-none" disabled />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-700/50 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img src="/lovable-uploads/5592343a-9de5-48ce-8f71-58ce73f57dd1.png" alt="SoraData Logo" className="w-8 h-8 object-contain" />
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  SORADATA
                </h3>
              </div>
              <p className="text-gray-400 leading-relaxed">Demokratisasi Analisis Data untuk Semua Orang Indonesia

            </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Fitur</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/features" className="hover:text-blue-400 transition-colors">Chat AI</a></li>
                <li><a href="/features" className="hover:text-blue-400 transition-colors">Upload Data</a></li>
                <li><a href="/features" className="hover:text-blue-400 transition-colors">Visualisasi</a></li>
                <li><a href="/features" className="hover:text-blue-400 transition-colors">Export Report</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-blue-400 transition-colors">Tentang Kami</a></li>
                <li><a href="/pricing" className="hover:text-blue-400 transition-colors">Harga</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Kontak</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Kontak</h4>
              <div className="space-y-3 text-gray-400">
                <p className="flex items-center space-x-2">
                  <span>📧</span>
                  <a href="mailto:soradatai@gmail.com" className="hover:text-blue-400 transition-colors">soradataai@gmail.com</a>
                </p>
                <p className="flex items-center space-x-2">
                  <span>📱</span>
                  <a href="https://wa.me/6282227770850" className="hover:text-blue-400 transition-colors">
                    +62 822-2777-0850
                  </a>
                </p>
                <p className="flex items-center space-x-2">
                  <span>📍</span>
                  <span>Karawang, Indonesia</span>
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700/50 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SoraData. All rights reserved. Made with ❤️ for Indonesia.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;