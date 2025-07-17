
import { useTheme } from '@/contexts/ThemeContext';

interface DashboardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: number;
}

export const DashboardGrid = ({ children, columns = 3, gap = 6 }: DashboardGridProps) => {
  const { theme } = useTheme();

  const getGridClass = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  const getGapClass = () => {
    switch (gap) {
      case 2:
        return 'gap-2';
      case 4:
        return 'gap-4';
      case 6:
        return 'gap-6';
      case 8:
        return 'gap-8';
      default:
        return 'gap-6';
    }
  };

  return (
    <div className={`grid ${getGridClass()} ${getGapClass()} w-full`}>
      {children}
    </div>
  );
};

interface GridItemProps {
  children: React.ReactNode;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3;
}

export const GridItem = ({ children, colSpan = 1, rowSpan = 1 }: GridItemProps) => {
  const getColSpanClass = () => {
    switch (colSpan) {
      case 2:
        return 'md:col-span-2';
      case 3:
        return 'md:col-span-2 lg:col-span-3';
      case 4:
        return 'md:col-span-2 lg:col-span-4';
      default:
        return '';
    }
  };

  const getRowSpanClass = () => {
    switch (rowSpan) {
      case 2:
        return 'row-span-2';
      case 3:
        return 'row-span-3';
      default:
        return '';
    }
  };

  return (
    <div className={`${getColSpanClass()} ${getRowSpanClass()} h-full flex flex-col`}>
      {children}
    </div>
  );
};
