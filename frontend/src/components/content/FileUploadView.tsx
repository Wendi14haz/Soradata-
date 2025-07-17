
import { useState } from 'react';
import { FileUploadWizard } from '@/components/upload/FileUploadWizard';
import { DataPreviewStep } from '@/components/upload/DataPreviewStep';
import { AnalysisWizard } from '@/components/analysis/AnalysisWizard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface FileUploadViewProps {
  onFileUploaded: (files: File[]) => void;
  onBack: () => void;
}

type Step = 'upload' | 'preview' | 'analysis' | 'results';

export const FileUploadView = ({ onFileUploaded, onBack }: FileUploadViewProps) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [uploadedFileData, setUploadedFileData] = useState<any>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const handleFileUploaded = async (fileData: any) => {
    console.log('File uploaded:', fileData);
    setUploadedFileData(fileData);
    setCurrentStep('preview');
    onFileUploaded([fileData]);
  };

  const handlePreviewNext = () => {
    setCurrentStep('analysis');
  };

  const handleAnalysisComplete = (results: any) => {
    setAnalysisResults(results);
    setCurrentStep('results');
  };

  const handleBackToStep = (step: Step) => {
    setCurrentStep(step);
  };

  const stepTitles = {
    upload: 'Upload Data',
    preview: 'Preview & Validate',
    analysis: 'Analyze Data',
    results: 'View Results'
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 border-b transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className={`transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Chat
              </Button>
              
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Data Analysis Wizard
                </span>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2">
              {Object.entries(stepTitles).map(([step, title], index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                      currentStep === step
                        ? 'bg-blue-500 text-white'
                        : Object.keys(stepTitles).indexOf(currentStep) > index
                        ? theme === 'dark' ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                        : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}. {title}
                  </div>
                  {index < Object.keys(stepTitles).length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentStep === 'upload' && (
          <FileUploadWizard onFileUploaded={handleFileUploaded} />
        )}
        
        {currentStep === 'preview' && uploadedFileData && (
          <DataPreviewStep
            fileData={uploadedFileData}
            onNext={handlePreviewNext}
            onBack={() => handleBackToStep('upload')}
          />
        )}
        
        {currentStep === 'analysis' && uploadedFileData && (
          <AnalysisWizard
            fileData={uploadedFileData}
            onComplete={handleAnalysisComplete}
            onBack={() => handleBackToStep('preview')}
          />
        )}
        
        {currentStep === 'results' && analysisResults && (
          <div className="space-y-6">
            <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                🎉 Analisis Selesai!
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Data Anda telah berhasil dianalisis. Anda dapat melihat hasil visualisasi di bawah ini.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Button
                onClick={() => handleBackToStep('analysis')}
                variant="outline"
                className="h-auto p-4"
              >
                <div className="text-center">
                  <div className="text-lg font-medium">Analisis Ulang</div>
                  <div className="text-sm text-gray-500 mt-1">Coba analisis dengan parameter berbeda</div>
                </div>
              </Button>
              
              <Button
                onClick={onBack}
                className="h-auto p-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <div className="text-center">
                  <div className="text-lg font-medium">Kembali ke Chat</div>
                  <div className="text-sm text-blue-100 mt-1">Lanjutkan diskusi dengan AI</div>
                </div>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
