import Papa from 'papaparse';

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  qualityScore: number;
  summary: {
    totalChecks: number;
    issuesFound: number;
    missingValuePercentage: number;
    outlierCount: number;
    duplicateCount: number;
    formatIssues: number;
  };
}

export interface ValidationIssue {
  type: 'missing_value' | 'outlier' | 'duplicate' | 'format' | 'data_type';
  severity: 'low' | 'medium' | 'high';
  column: string;
  row?: number;
  value?: any;
  message: string;
  suggestion?: string;
  [key: string]: any; // Add index signature for Json compatibility
}

export interface ValidationRules {
  missingValueThreshold: number; // percentage
  outlierZScoreThreshold: number;
  allowedDateFormats: string[];
  duplicateCheckColumns: string[];
}

export class DataQualityValidator {
  private rules: ValidationRules;

  constructor(rules: ValidationRules = {
    missingValueThreshold: 10,
    outlierZScoreThreshold: 3,
    allowedDateFormats: ['YYYY-MM-DD', 'DD/MM/YYYY'],
    duplicateCheckColumns: ['id_transaksi', 'tanggal']
  }) {
    this.rules = rules;
  }

  validateData(data: any[]): ValidationResult {
    if (!data || data.length === 0) {
      return {
        isValid: false,
        issues: [{
          type: 'format',
          severity: 'high',
          column: 'general',
          message: 'Data kosong atau tidak valid',
          suggestion: 'Pastikan file berisi data yang valid'
        }],
        qualityScore: 0,
        summary: {
          totalChecks: 1,
          issuesFound: 1,
          missingValuePercentage: 100,
          outlierCount: 0,
          duplicateCount: 0,
          formatIssues: 1
        }
      };
    }

    const issues: ValidationIssue[] = [];
    const columns = Object.keys(data[0] || {});
    let totalChecks = 0;

    // 1. Check missing values
    const missingValueResults = this.checkMissingValues(data, columns);
    issues.push(...missingValueResults.issues);
    totalChecks += missingValueResults.checks;

    // 2. Check outliers for numeric columns
    const outlierResults = this.checkOutliers(data, columns);
    issues.push(...outlierResults.issues);
    totalChecks += outlierResults.checks;

    // 3. Check duplicates
    const duplicateResults = this.checkDuplicates(data);
    issues.push(...duplicateResults.issues);
    totalChecks += duplicateResults.checks;

    // 4. Check data formats
    const formatResults = this.checkDataFormats(data, columns);
    issues.push(...formatResults.issues);
    totalChecks += formatResults.checks;

    // Calculate quality score
    const qualityScore = Math.max(0, Math.min(100, 
      ((totalChecks - issues.length) / totalChecks) * 100
    ));

    const summary = {
      totalChecks,
      issuesFound: issues.length,
      missingValuePercentage: missingValueResults.percentage,
      outlierCount: outlierResults.outlierCount,
      duplicateCount: duplicateResults.duplicateCount,
      formatIssues: formatResults.formatIssues
    };

    return {
      isValid: issues.filter(i => i.severity === 'high').length === 0,
      issues,
      qualityScore,
      summary
    };
  }

  private checkMissingValues(data: any[], columns: string[]) {
    const issues: ValidationIssue[] = [];
    let totalChecks = 0;
    let totalMissing = 0;

    columns.forEach(column => {
      const missingCount = data.filter(row => 
        row[column] === null || 
        row[column] === undefined || 
        row[column] === '' ||
        (typeof row[column] === 'string' && row[column].trim() === '')
      ).length;

      const missingPercentage = (missingCount / data.length) * 100;
      totalMissing += missingCount;
      totalChecks++;

      if (missingPercentage > this.rules.missingValueThreshold) {
        issues.push({
          type: 'missing_value',
          severity: missingPercentage > 25 ? 'high' : 'medium',
          column,
          message: `Kolom '${column}' memiliki ${missingPercentage.toFixed(1)}% data kosong`,
          suggestion: `Pertimbangkan untuk mengisi nilai kosong atau menghapus kolom jika tidak penting`
        });
      }
    });

    return {
      issues,
      checks: totalChecks,
      percentage: (totalMissing / (data.length * columns.length)) * 100
    };
  }

  private checkOutliers(data: any[], columns: string[]) {
    const issues: ValidationIssue[] = [];
    let checks = 0;
    let outlierCount = 0;

    columns.forEach(column => {
      const numericValues = data
        .map(row => parseFloat(row[column]))
        .filter(val => !isNaN(val));

      if (numericValues.length > 10) { // Only check if we have enough numeric data
        const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        const stdDev = Math.sqrt(
          numericValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericValues.length
        );

        data.forEach((row, index) => {
          const value = parseFloat(row[column]);
          if (!isNaN(value)) {
            const zScore = Math.abs((value - mean) / stdDev);
            if (zScore > this.rules.outlierZScoreThreshold) {
              outlierCount++;
              issues.push({
                type: 'outlier',
                severity: zScore > 4 ? 'high' : 'medium',
                column,
                row: index + 1,
                value,
                message: `Nilai ${value} di baris ${index + 1} adalah outlier (Z-score: ${zScore.toFixed(2)})`,
                suggestion: 'Periksa apakah nilai ini benar atau perlu diperbaiki'
              });
            }
          }
        });
        checks++;
      }
    });

    return { issues, checks, outlierCount };
  }

  private checkDuplicates(data: any[]) {
    const issues: ValidationIssue[] = [];
    let duplicateCount = 0;

    // Check for complete row duplicates
    const seen = new Set();
    const duplicateRows: number[] = [];

    data.forEach((row, index) => {
      const rowString = JSON.stringify(row);
      if (seen.has(rowString)) {
        duplicateRows.push(index + 1);
      } else {
        seen.add(rowString);
      }
    });

    duplicateCount = duplicateRows.length;

    if (duplicateRows.length > 0) {
      issues.push({
        type: 'duplicate',
        severity: duplicateRows.length > data.length * 0.1 ? 'high' : 'medium',
        column: 'all',
        message: `Ditemukan ${duplicateRows.length} baris duplikat`,
        suggestion: 'Hapus baris duplikat untuk meningkatkan kualitas data'
      });
    }

    // Check for duplicates in key columns if they exist
    this.rules.duplicateCheckColumns.forEach(column => {
      if (data[0] && data[0].hasOwnProperty(column)) {
        const values = data.map(row => row[column]).filter(val => val !== null && val !== undefined);
        const uniqueValues = new Set(values);
        const duplicatesInColumn = values.length - uniqueValues.size;

        if (duplicatesInColumn > 0) {
          duplicateCount += duplicatesInColumn;
          issues.push({
            type: 'duplicate',
            severity: 'high',
            column,
            message: `Kolom '${column}' memiliki ${duplicatesInColumn} nilai duplikat`,
            suggestion: `Pastikan kolom '${column}' berisi nilai unik`
          });
        }
      }
    });

    return { issues, checks: 1 + this.rules.duplicateCheckColumns.length, duplicateCount };
  }

  private checkDataFormats(data: any[], columns: string[]) {
    const issues: ValidationIssue[] = [];
    let checks = 0;
    let formatIssues = 0;

    columns.forEach(column => {
      const sampleValues = data.slice(0, 100).map(row => row[column]).filter(val => val !== null && val !== undefined);
      
      if (sampleValues.length === 0) return;

      // Check if column should be numeric but contains non-numeric values
      const numericPattern = /^-?\d*\.?\d+$/;
      const potentiallyNumeric = sampleValues.filter(val => 
        typeof val === 'string' && numericPattern.test(val.replace(/,/g, ''))
      ).length;

      if (potentiallyNumeric > sampleValues.length * 0.7) {
        const nonNumeric = sampleValues.filter(val => 
          typeof val === 'string' && !numericPattern.test(val.replace(/,/g, ''))
        );

        if (nonNumeric.length > 0) {
          formatIssues++;
          issues.push({
            type: 'data_type',
            severity: 'medium',
            column,
            message: `Kolom '${column}' tampak numerik tapi berisi ${nonNumeric.length} nilai non-numerik`,
            suggestion: 'Standardisasi format angka dan hapus karakter non-numerik'
          });
        }
      }

      // Check date formats
      const datePattern = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/;
      const potentiallyDate = sampleValues.filter(val => 
        typeof val === 'string' && (val.includes('-') || val.includes('/')) && val.length >= 8
      ).length;

      if (potentiallyDate > sampleValues.length * 0.5) {
        const invalidDates = sampleValues.filter(val => 
          typeof val === 'string' && !datePattern.test(val) && val.length >= 8
        );

        if (invalidDates.length > 0) {
          formatIssues++;
          issues.push({
            type: 'format',
            severity: 'medium',
            column,
            message: `Kolom '${column}' berisi ${invalidDates.length} format tanggal yang tidak konsisten`,
            suggestion: 'Gunakan format YYYY-MM-DD atau DD/MM/YYYY secara konsisten'
          });
        }
      }

      checks++;
    });

    return { issues, checks, formatIssues };
  }
}
