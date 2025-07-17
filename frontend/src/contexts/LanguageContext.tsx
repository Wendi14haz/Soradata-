
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  id: {
    // Navigation
    'nav.new_chat': 'Chat Baru',
    'nav.history': 'Riwayat',
    'nav.data': 'Data Anda',
    'nav.settings': 'Pengaturan',
    'nav.profile': 'Profil',
    'nav.logout': 'Keluar',
    
    // Chat
    'chat.title': 'Chat dengan SoraData AI',
    'chat.placeholder': 'Ketik pesan Anda di sini...',
    'chat.send': 'Kirim',
    'chat.upload_file': 'Upload File',
    'chat.new_conversation': 'Percakapan Baru',
    'chat.no_history': 'Belum ada riwayat chat',
    'chat.start_new': 'Mulai chat baru untuk menyimpan percakapan',
    
    // Settings
    'settings.title': 'Pengaturan',
    'settings.theme': 'Tema Tampilan',
    'settings.language': 'Bahasa',
    'settings.dark_mode': 'Mode Gelap',
    'settings.profile': 'Profil Akun',
    'settings.security': 'Keamanan',
    'settings.data_management': 'Manajemen Data',
    'settings.save_changes': 'Simpan Perubahan',
    'settings.saving': 'Menyimpan...',
    
    // Data
    'data.title': 'Data Anda',
    'data.subtitle': 'Riwayat file dan analisis data Anda',
    'data.no_data': 'Belum ada data',
    'data.upload_first': 'Upload file pertama Anda untuk mulai analisis',
    'data.upload_new': 'Upload File Baru',
    'data.files_uploaded': 'File Terupload',
    'data.analyses_completed': 'Analisis Selesai',
    'data.total_insights': 'Total Insight',
    
    // Common
    'common.loading': 'Memuat...',
    'common.error': 'Terjadi kesalahan',
    'common.success': 'Berhasil',
    'common.cancel': 'Batal',
    'common.delete': 'Hapus',
    'common.edit': 'Edit',
    'common.save': 'Simpan',
  },
  en: {
    // Navigation
    'nav.new_chat': 'New Chat',
    'nav.history': 'History',
    'nav.data': 'Your Data',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    
    // Chat
    'chat.title': 'Chat with SoraData AI',
    'chat.placeholder': 'Type your message here...',
    'chat.send': 'Send',
    'chat.upload_file': 'Upload File',
    'chat.new_conversation': 'New Conversation',
    'chat.no_history': 'No chat history yet',
    'chat.start_new': 'Start a new chat to save conversations',
    
    // Settings
    'settings.title': 'Settings',
    'settings.theme': 'Display Theme',
    'settings.language': 'Language',
    'settings.dark_mode': 'Dark Mode',
    'settings.profile': 'Account Profile',
    'settings.security': 'Security',
    'settings.data_management': 'Data Management',
    'settings.save_changes': 'Save Changes',
    'settings.saving': 'Saving...',
    
    // Data
    'data.title': 'Your Data',
    'data.subtitle': 'History of your uploaded files and data analysis',
    'data.no_data': 'No data yet',
    'data.upload_first': 'Upload your first file to start analysis',
    'data.upload_new': 'Upload New File',
    'data.files_uploaded': 'Files Uploaded',
    'data.analyses_completed': 'Analyses Completed',
    'data.total_insights': 'Total Insights',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.save': 'Save',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved || 'id';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['id']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
