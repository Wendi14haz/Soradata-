
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useTheme } from '@/contexts/ThemeContext';

interface HorizontalBarChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  title?: string;
  color?: string;
}

export const HorizontalBarChart = ({ data, dataKey, nameKey, title, color = '#3B82F6' }: HorizontalBarChartProps) => {
  const { theme } = useTheme();

  return (
    <div className="w-full h-full">
      {title && (
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
      )}
      <ChartContainer config={{}} className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
            <XAxis 
              type="number"
              stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              fontSize={12}
            />
            <YAxis 
              type="category"
              dataKey={nameKey}
              stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              fontSize={12}
              width={100}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};
