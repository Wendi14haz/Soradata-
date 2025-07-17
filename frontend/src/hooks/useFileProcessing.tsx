
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { FileProcessor } from '@/utils/fileProcessor';
import { AdvancedCacheManager } from '@/utils/cacheManager';

interface ProcessedFileData {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  processedData: any[];
  metadata: {
    rowCount: number;
    columnCount: number;
    columns: string[];
    dataTypes: Record<string, string>;
  };
  preview: any[];
}

export const useFileProcessing = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFileData[]>([]);

  const processAndSaveFile = async (file: File): Promise<ProcessedFileData | null> => {
    if (!user) return null;

    setIsProcessing(true);
    try {
      // Process file using FileProcessor
      const processed = await FileProcessor.processFile(file);
      
      if (processed.errors.length > 0) {
        toast.error('❌ Error memproses file', {
          description: processed.errors.join(', ')
        });
        return null;
      }

      // Generate file hash for caching
      const fileContent = await file.text();
      const fileHash = btoa(fileContent).substring(0, 32);

      // Cache processed data
      AdvancedCacheManager.cacheFileProcessing(fileHash, {
        processedData: processed.data,
        metadata: processed.metadata,
        preview: processed.preview
      });

      // Save to database
      const { data: savedFile, error } = await supabase
        .from('user_files')
        .insert({
          user_id: user.id,
          filename: file.name,
          original_filename: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: `temp/${fileHash}`,
          processed: true,
          row_count: processed.metadata.rowCount,
          column_count: processed.metadata.columnCount,
          file_metadata: {
            ...processed.metadata,
            processedData: processed.data.slice(0, 1000), // Store first 1000 rows
            preview: processed.preview,
            fileHash
          }
        })
        .select()
        .single();

      if (error) throw error;

      const fileData: ProcessedFileData = {
        id: savedFile.id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        processedData: processed.data,
        metadata: processed.metadata,
        preview: processed.preview
      };

      setProcessedFiles(prev => [...prev, fileData]);
      
      toast.success('✅ File berhasil diproses!', {
        description: `${processed.metadata.rowCount} baris data siap untuk dianalisis`
      });

      return fileData;

    } catch (error: any) {
      toast.error('❌ Gagal memproses file', {
        description: error.message
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const getProcessedFile = (fileId: string): ProcessedFileData | null => {
    return processedFiles.find(f => f.id === fileId) || null;
  };

  return {
    processAndSaveFile,
    getProcessedFile,
    isProcessing,
    processedFiles
  };
};
