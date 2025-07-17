
// Enhanced file processing with better error handling and optimization
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ProcessedFileData {
  data: any[];
  metadata: {
    fileName: string;
    fileSize: number;
    rowCount: number;
    columnCount: number;
    columns: string[];
    processingTime: number;
    dataTypes: Record<string, string>;
  };
  preview: any[];
  errors: string[];
  warnings: string[];
}

export class FileProcessor {
  private static readonly MAX_PREVIEW_ROWS = 100;
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  static async processFile(file: File): Promise<ProcessedFileData> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate file size
      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (50MB)`);
      }

      let data: any[] = [];
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.csv')) {
        data = await this.processCSV(file);
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        data = await this.processExcel(file);
      } else if (fileName.endsWith('.json')) {
        data = await this.processJSON(file);
      } else {
        throw new Error(`Unsupported file format: ${file.name}`);
      }

      // Validate processed data
      if (!data || data.length === 0) {
        throw new Error('File appears to be empty or could not be processed');
      }

      // Detect data types and issues
      const columns = Object.keys(data[0] || {});
      const dataTypes = this.detectDataTypes(data, columns);
      
      // Check for common issues
      this.validateDataQuality(data, columns, warnings);

      const processingTime = Date.now() - startTime;

      return {
        data,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          rowCount: data.length,
          columnCount: columns.length,
          columns,
          processingTime,
          dataTypes
        },
        preview: data.slice(0, this.MAX_PREVIEW_ROWS),
        errors,
        warnings
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        data: [],
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          rowCount: 0,
          columnCount: 0,
          columns: [],
          processingTime,
          dataTypes: {}
        },
        preview: [],
        errors: [error instanceof Error ? error.message : 'Unknown processing error'],
        warnings
      };
    }
  }

  private static async processCSV(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value) => {
          // Auto-convert numeric strings to numbers
          const trimmed = value.trim();
          if (trimmed === '') return null;
          
          // Check if it's a number
          const num = Number(trimmed);
          if (!isNaN(num) && isFinite(num)) {
            return num;
          }
          
          return trimmed;
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }
          resolve(results.data);
        },
        error: (error) => reject(new Error(`CSV parsing error: ${error.message}`))
      });
    });
  }

  private static async processExcel(file: File): Promise<any[]> {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { 
        type: 'buffer',
        cellText: false,
        cellDates: true 
      });
      
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error('Excel file contains no worksheets');
      }

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
        raw: false
      });

      if (jsonData.length === 0) {
        throw new Error('Excel worksheet is empty');
      }

      // Convert to object format with headers
      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1);
      
      return dataRows.map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          const value = (row as any[])[index];
          obj[header || `Column_${index + 1}`] = value;
        });
        return obj;
      });

    } catch (error) {
      throw new Error(`Excel processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async processJSON(file: File): Promise<any[]> {
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      if (Array.isArray(jsonData)) {
        return jsonData;
      } else if (typeof jsonData === 'object') {
        // If it's a single object, wrap it in an array
        return [jsonData];
      } else {
        throw new Error('JSON file must contain an array or object');
      }
    } catch (error) {
      throw new Error(`JSON processing error: ${error instanceof Error ? error.message : 'Invalid JSON format'}`);
    }
  }

  private static detectDataTypes(data: any[], columns: string[]): Record<string, string> {
    const dataTypes: Record<string, string> = {};
    
    columns.forEach(column => {
      const sampleValues = data.slice(0, 100).map(row => row[column]).filter(val => val !== null && val !== undefined);
      
      if (sampleValues.length === 0) {
        dataTypes[column] = 'empty';
        return;
      }

      const numericCount = sampleValues.filter(val => typeof val === 'number' || !isNaN(Number(val))).length;
      const dateCount = sampleValues.filter(val => {
        if (val instanceof Date) return true;
        if (typeof val === 'string') {
          const date = new Date(val);
          return !isNaN(date.getTime());
        }
        return false;
      }).length;

      const numericRatio = numericCount / sampleValues.length;
      const dateRatio = dateCount / sampleValues.length;

      if (numericRatio > 0.8) {
        dataTypes[column] = 'numeric';
      } else if (dateRatio > 0.8) {
        dataTypes[column] = 'date';
      } else {
        dataTypes[column] = 'text';
      }
    });

    return dataTypes;
  }

  private static validateDataQuality(data: any[], columns: string[], warnings: string[]) {
    const totalRows = data.length;
    
    columns.forEach(column => {
      const nullCount = data.filter(row => row[column] === null || row[column] === undefined || row[column] === '').length;
      const nullPercentage = (nullCount / totalRows) * 100;
      
      if (nullPercentage > 20) {
        warnings.push(`Column '${column}' has ${nullPercentage.toFixed(1)}% missing values`);
      }
    });

    // Check for potential duplicates
    const duplicateCheck = new Set();
    let duplicateCount = 0;
    
    data.forEach(row => {
      const rowString = JSON.stringify(row);
      if (duplicateCheck.has(rowString)) {
        duplicateCount++;
      } else {
        duplicateCheck.add(rowString);
      }
    });

    if (duplicateCount > 0) {
      warnings.push(`Found ${duplicateCount} potential duplicate rows`);
    }
  }
}
