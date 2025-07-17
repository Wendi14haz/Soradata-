
import React, { useCallback, forwardRef, useImperativeHandle, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Image, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileUpload?: (file: File) => void;
  onFileUploaded?: (fileData: any) => void;
  acceptedTypes?: string;
  maxSize?: number;
  isLoading?: boolean;
}

export interface FileUploadHandles {
  open: () => void;
}

export const FileUpload = forwardRef<FileUploadHandles, FileUploadProps>(({
  onFileUpload,
  onFileUploaded,
  acceptedTypes = ".csv,.xlsx,.xls,.json,.txt,.png,.jpg,.jpeg,.gif,.bmp,.webp,.svg",
  maxSize = 10 * 1024 * 1024, // 10MB default
  isLoading = false
}, ref) => {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setUploadSuccess(false);

      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please login first to upload files.');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Call upload function
      const { data, error } = await supabase.functions.invoke('upload-file', {
        body: formData,
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to upload file');
      }

      if (!data) {
        throw new Error('No response from upload service');
      }

      setUploadSuccess(true);
      
      toast({
        title: "File uploaded successfully!",
        description: `${file.name} has been processed successfully.`,
      });

      // Call callbacks
      if (onFileUpload) {
        onFileUpload(file);
      }
      
      if (onFileUploaded) {
        onFileUploaded(data);
      }

      // Reset success state after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);

    } catch (error: any) {
      let errorMessage = 'An error occurred while uploading the file';
      
      if (error.message.includes('not authenticated')) {
        errorMessage = 'You must login first to upload files';
      } else if (error.message.includes('too large')) {
        errorMessage = `File is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB`;
      } else if (error.message.includes('invalid type')) {
        errorMessage = 'File format is not supported';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      let errorMessage = 'File cannot be uploaded';
      
      if (rejection.errors) {
        const error = rejection.errors[0];
        if (error.code === 'file-too-large') {
          errorMessage = `File is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB`;
        } else if (error.code === 'file-invalid-type') {
          errorMessage = 'File format is not supported';
        }
      }
      
      toast({
        title: "File rejected",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    if (acceptedFiles.length > 0) {
      uploadFile(acceptedFiles[0]);
    }
  }, [onFileUpload, onFileUploaded, maxSize, toast]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    maxSize,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json'],
      'text/plain': ['.txt'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg']
    },
    multiple: false,
    noClick: true,
    disabled: uploading || isLoading
  });

  useImperativeHandle(ref, () => ({
    open
  }));

  const isProcessing = uploading || isLoading;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardContent className="p-8">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 scale-105' 
              : uploadSuccess
              ? 'border-green-500 bg-green-50 dark:bg-green-950'
              : isProcessing
              ? 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 cursor-not-allowed'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-102'
          }`}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            {/* Icons */}
            <div className="flex space-x-3">
              {uploadSuccess ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : isProcessing ? (
                <div className="relative">
                  <Upload className="w-16 h-16 text-gray-400" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400" />
                  <FileText className="w-12 h-12 text-gray-400" />
                  <Image className="w-12 h-12 text-gray-400" />
                </>
              )}
            </div>
            
            {/* Status Messages */}
            {uploadSuccess ? (
              <div className="space-y-2">
                <p className="text-green-600 dark:text-green-400 font-semibold text-lg">
                  Upload Successful!
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your file has been processed and is ready for analysis
                </p>
              </div>
            ) : isProcessing ? (
              <div className="space-y-2">
                <p className="text-blue-600 dark:text-blue-400 font-semibold">
                  Processing file...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please wait while we analyze your data
                </p>
              </div>
            ) : isDragActive ? (
              <p className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                Drop your file here...
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                  Drag & drop your file or click to browse
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Supports: CSV, Excel, JSON, TXT, Images (PNG, JPG, etc.)
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Maximum file size: {Math.round(maxSize / (1024 * 1024))}MB
                </p>
              </div>
            )}
            
            {/* Action Button */}
            <Button 
              variant={uploadSuccess ? "default" : "outline"}
              className={`mt-6 px-6 py-2 transition-all ${
                uploadSuccess 
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "hover:bg-blue-50 hover:border-blue-400 dark:hover:bg-blue-950"
              }`}
              disabled={isProcessing} 
              onClick={open}
            >
              {isProcessing ? 'Processing...' : uploadSuccess ? 'Upload Another' : 'Browse Files'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

FileUpload.displayName = 'FileUpload';
