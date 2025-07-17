
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProcessingNotificationProps {
  isProcessing: boolean;
  isComplete: boolean;
  onViewResults: () => void;
}

export const ProcessingNotification = ({ isProcessing, isComplete, onViewResults }: ProcessingNotificationProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 500);

      return () => clearInterval(interval);
    } else if (isComplete) {
      setProgress(100);
    }
  }, [isProcessing, isComplete]);

  if (!isProcessing && !isComplete) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
        <CardContent className="p-6 text-center space-y-4">
          {isProcessing && (
            <>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">SoraData sedang memproses...</h3>
                <p className="text-sm text-gray-400">Menganalisis data Anda dengan AI</p>
              </div>
              <Progress value={progress} className="w-full h-2" />
              <p className="text-xs text-gray-500">{Math.round(progress)}% selesai</p>
            </>
          )}

          {isComplete && (
            <>
              <div className="flex justify-center">
                <div className="relative">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-white">Permintaan kamu telah siap</h3>
                <p className="text-sm text-gray-400">Analisis data berhasil diselesaikan</p>
                <Button 
                  onClick={onViewResults}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3"
                >
                  Lihat Hasil
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
