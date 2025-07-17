
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  color?: string;
}

export const MetricCard = ({ title, value, change, changeType, icon, color = '#3B82F6' }: MetricCardProps) => {
  const { theme } = useTheme();

  const getTrendIcon = () => {
    if (change === undefined) return null;
    
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-500';
      case 'decrease':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} h-full`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {title}
            </p>
            <p className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {change !== undefined && (
              <div className="flex items-center mt-2 space-x-1">
                {getTrendIcon()}
                <span className={`text-sm font-medium ${getChangeColor()}`}>
                  {Math.abs(change)}%
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div 
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
