
import { useTheme } from '@/contexts/ThemeContext';

interface FunnelChartProps {
  data: { name: string; value: number; percentage?: number }[];
  title?: string;
  colors?: string[];
}

export const FunnelChart = ({ data, title, colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'] }: FunnelChartProps) => {
  const { theme } = useTheme();
  
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className="w-full h-full">
      {title && (
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
      )}
      <div className="space-y-2">
        {data.map((item, index) => {
          const widthPercentage = (item.value / maxValue) * 100;
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {item.name}
                  </span>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.value.toLocaleString()} {item.percentage && `(${item.percentage}%)`}
                  </span>
                </div>
                <div className={`h-8 rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full rounded-lg transition-all duration-300 flex items-center justify-center"
                    style={{
                      width: `${widthPercentage}%`,
                      backgroundColor: colors[index % colors.length]
                    }}
                  >
                    <span className="text-white text-xs font-medium">
                      {item.percentage ? `${item.percentage}%` : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
