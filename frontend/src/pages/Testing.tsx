
import { TestingDashboard } from '@/components/testing/TestingDashboard';
import { useTheme } from '@/contexts/ThemeContext';

const Testing = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto">
        <TestingDashboard />
      </div>
    </div>
  );
};

export default Testing;
