
import { useState, useCallback } from 'react';
import { DataQualityValidator, ValidationResult } from '@/utils/dataQualityValidator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useDataQuality = () => {
  const { user } = useAuth();
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const validateData = useCallback(async (data: any[], fileId?: string) => {
    if (!user) {
      toast.error('User tidak terautentikasi');
      return null;
    }

    setIsValidating(true);
    
    try {
      const validator = new DataQualityValidator();
      const result = validator.validateData(data);
      
      setValidationResult(result);

      // Save to database if fileId is provided
      if (fileId) {
        const { error } = await supabase
          .from('data_quality_reports')
          .insert({
            user_id: user.id,
            file_id: fileId,
            validation_results: JSON.parse(JSON.stringify({
              issues: result.issues,
              summary: result.summary,
              qualityScore: result.qualityScore,
              isValid: result.isValid
            })),
            quality_score: result.qualityScore,
            issues_found: result.issues.length,
            total_checks: result.summary.totalChecks
          });

        if (error) {
          console.error('Error saving quality report:', error);
          toast.error('Gagal menyimpan laporan kualitas data');
        } else {
          toast.success('Laporan kualitas data berhasil disimpan');
        }
      }

      return result;
    } catch (error) {
      console.error('Error validating data:', error);
      toast.error('Gagal memvalidasi data');
      return null;
    } finally {
      setIsValidating(false);
    }
  }, [user]);

  const getQualityHistory = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('data_quality_reports')
        .select(`
          *,
          user_files (
            original_filename,
            upload_date
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching quality history:', error);
      return [];
    }
  }, [user]);

  return {
    validateData,
    getQualityHistory,
    isValidating,
    validationResult,
    setValidationResult
  };
};
