import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, User, Settings, Database, LogOut, Plus, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
interface HeaderBarProps {
  onProfile: () => void;
  onSettings: () => void;
  onData: () => void;
  onToggleSidebar: () => void;
  conversationTitle?: string;
  onNewChat?: () => void;
}
export const HeaderBar = ({
  onProfile,
  onSettings,
  onData,
  onToggleSidebar,
  conversationTitle = "Mau analisa data apa hari ini?",
  onNewChat
}: HeaderBarProps) => {
  const {
    user
  } = useAuth();
  const {
    theme
  } = useTheme();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };
  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      // Fallback: dispatch event
      window.dispatchEvent(new CustomEvent('newChatCreated'));
    }
  };
  return <div className={`fixed top-0 left-0 right-0 z-50 h-16 border-b ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between h-full px-4">
        {/* Left Section - Logo and Menu */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className={`h-10 w-10 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <img src="/lovable-uploads/5592343a-9de5-48ce-8f71-58ce73f57dd1.png" alt="SoraData" className="h-8 w-8 object-contain" />
            <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              SoraData
            </span>
          </div>
        </div>

        {/* Center Section - Conversation Title & New Chat Button */}
        <div className="flex items-center space-x-4">
          
          
          <div className="hidden md:flex items-center space-x-2">
            <MessageSquare className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <h1 className={`text-lg font-medium truncate max-w-md ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              {conversationTitle}
            </h1>
          </div>
        </div>

        {/* Right Section - User Menu */}
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={`w-56 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`} align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    {user?.user_metadata?.full_name || user?.email}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator className={theme === 'dark' ? 'border-gray-700' : ''} />
              <DropdownMenuItem onClick={onProfile} className={`cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' : ''}`}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onData} className={`cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' : ''}`}>
                <Database className="mr-2 h-4 w-4" />
                Data Files
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSettings} className={`cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' : ''}`}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className={theme === 'dark' ? 'border-gray-700' : ''} />
              <DropdownMenuItem onClick={handleSignOut} className={`cursor-pointer text-red-600 hover:text-red-700 ${theme === 'dark' ? 'hover:bg-gray-700' : ''}`}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>;
};