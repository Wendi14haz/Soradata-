import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Lightbulb, FileText, TrendingUp, ThumbsUp, ThumbsDown, Copy, Download } from 'lucide-react';

interface ChatActionButtonsProps {
  onVisualize: () => void;
  onInsights: () => void;
  onSummary: () => void;
  onTrends: () => void;
  onLike: () => void;
  onDislike: () => void;
  onCopy: () => void;
  onDownload: () => void;
}

export const ChatActionButtons = ({
  onVisualize,
  onInsights,
  onSummary,
  onTrends,
  onLike,
  onDislike,
  onCopy,
  onDownload
}: ChatActionButtonsProps) => {
  return (
    <Card className="mt-4 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={onVisualize} variant="outline" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" /> Visualisasi
          </Button>
          <Button onClick={onInsights} variant="outline" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-purple-500" /> Insight
          </Button>
          <Button onClick={onSummary} variant="outline" className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-500" /> Ringkasan
          </Button>
          <Button onClick={onTrends} variant="outline" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500" /> Tren
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-dashed dark:border-gray-700">
          <Button onClick={onLike} size="icon" variant="ghost">
            <ThumbsUp className="w-4 h-4" />
          </Button>
          <Button onClick={onDislike} size="icon" variant="ghost">
            <ThumbsDown className="w-4 h-4" />
          </Button>
          <Button onClick={onCopy} size="icon" variant="ghost">
            <Copy className="w-4 h-4" />
          </Button>
          <Button onClick={onDownload} size="icon" variant="ghost">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
