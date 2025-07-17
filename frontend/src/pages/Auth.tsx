
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Auth() {
  const {
    user,
    signIn,
    signUp,
    signInWithGoogle
  } = useAuth();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const {
      error
    } = await signIn(email, password);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Berhasil!",
        description: "Anda telah berhasil masuk."
      });
      window.location.href = '/dashboard';
    }
    setLoading(false);
  };
  
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const job = formData.get('job') as string;
    const businessName = formData.get('businessName') as string;
    
    const {
      error
    } = await signUp(email, password, fullName);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Berhasil!",
        description: "Akun telah dibuat. Silakan cek email untuk konfirmasi."
      });
    }
    setLoading(false);
  };
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    const {
      error
    } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      {/* Tombol Kembali ke Beranda di pojok atas kiri */}
      <div className="w-full flex justify-start mb-4">
        <Button 
          variant="ghost" 
          onClick={() => window.location.href = '/'} 
          className="bg-slate-900 hover:bg-slate-800 text-slate-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </Button>
      </div>
      
      {/* Konten utama di tengah */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="bg-gray-800/80 border-gray-700 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <img src="/lovable-uploads/1b0ffbd6-3ffe-4364-9da8-268b349f70e5.png" alt="SoraData Logo" className="w-10 h-10 object-contain" />
                <CardTitle className="text-2xl font-bold text-white">SoraData</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                AI Data Analyst Indonesia 🇮🇩
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-blue-600">Masuk</TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-blue-600">Daftar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-200">Email</Label>
                      <Input id="email" name="email" type="email" required placeholder="nama@email.com" className="bg-gray-700 border-gray-600 text-white placeholder-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-200">Password</Label>
                      <Input id="password" name="password" type="password" required placeholder="Masukkan password" className="bg-gray-700 border-gray-600 text-white placeholder-gray-400" />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                      {loading ? "Memproses..." : "Masuk"}
                    </Button>
                  </form>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-800 px-2 text-gray-400">Atau</span>
                    </div>
                  </div>
                  
                  <Button type="button" variant="outline" onClick={handleGoogleSignIn} disabled={loading} className="w-full border-gray-600 bg-indigo-950 hover:bg-indigo-800 text-slate-50">
                    Masuk dengan Google
                  </Button>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-gray-200">Nama Lengkap</Label>
                      <Input id="fullName" name="fullName" type="text" required placeholder="Nama lengkap Anda" className="bg-gray-700 border-gray-600 text-white placeholder-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="job" className="text-gray-200">Pekerjaan Anda</Label>
                      <Input id="job" name="job" type="text" required placeholder="Pekerjaan/Profesi Anda" className="bg-gray-700 border-gray-600 text-white placeholder-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessName" className="text-gray-200">Nama Business Anda</Label>
                      <Input id="businessName" name="businessName" type="text" required placeholder="Nama perusahaan/bisnis Anda" className="bg-gray-700 border-gray-600 text-white placeholder-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-200">Email</Label>
                      <Input id="email" name="email" type="email" required placeholder="nama@email.com" className="bg-gray-700 border-gray-600 text-white placeholder-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-200">Password</Label>
                      <Input id="password" name="password" type="password" required placeholder="Masukkan password" minLength={6} className="bg-gray-700 border-gray-600 text-white placeholder-gray-400" />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                      {loading ? "Memproses..." : "Daftar"}
                    </Button>
                  </form>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-800 px-2 text-gray-400">Atau</span>
                    </div>
                  </div>
                  
                  <Button type="button" variant="outline" onClick={handleGoogleSignIn} disabled={loading} className="w-full border-gray-600 bg-blue-950 hover:bg-blue-800 text-slate-50">
                    Daftar dengan Google
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
