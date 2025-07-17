
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';

interface DataTableProps {
  data: any[];
  title?: string;
  maxRows?: number;
}

export const DataTable = ({ data, title, maxRows = 10 }: DataTableProps) => {
  const { theme } = useTheme();

  if (!data || data.length === 0) {
    return (
      <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardContent className="p-6 text-center">
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tidak ada data untuk ditampilkan</p>
        </CardContent>
      </Card>
    );
  }

  const columns = Object.keys(data[0]);
  const displayData = data.slice(0, maxRows);

  return (
    <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {title && (
        <CardHeader>
          <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}>
                {columns.map((column) => (
                  <TableHead 
                    key={column}
                    className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} font-semibold`}
                  >
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((row, index) => (
                <TableRow 
                  key={index}
                  className={`${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  {columns.map((column) => (
                    <TableCell 
                      key={column}
                      className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}
                    >
                      {row[column]?.toString() || '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {data.length > maxRows && (
          <div className={`p-4 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Menampilkan {maxRows} dari {data.length} baris
          </div>
        )}
      </CardContent>
    </Card>
  );
};
