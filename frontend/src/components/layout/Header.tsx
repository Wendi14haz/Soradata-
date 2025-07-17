
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings, HelpCircle } from 'lucide-react';

export default function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-gray-700 bg-gray-900 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/5592343a-9de5-48ce-8f71-58ce73f57dd1.png" 
              alt="SoraData Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SoraData
              </h1>
              <p className="text-xs text-gray-400">AI Data Analyst Indonesia 🇮🇩</p>
            </div>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-sm text-gray-300">{user.user_metadata?.full_name || 'Pengguna'}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-gray-600 hover:border-blue-500 smart-button">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700 z-50" align="end" forceMount>
                <DropdownMenuItem className="flex items-center text-gray-300 hover:bg-gray-700">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil Saya</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center text-gray-300 hover:bg-gray-700">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Pengaturan</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center text-gray-300 hover:bg-gray-700">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Bantuan</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem onClick={signOut} className="flex items-center text-red-400 hover:bg-red-600/20">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
