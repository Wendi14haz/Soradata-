
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced error logging
function logError(error: any, context: string, userId?: string) {
  const errorLog = {
    context,
    message: error.message || 'Unknown error',
    stack: error.stack,
    userId,
    timestamp: new Date().toISOString(),
    function: 'upload-file'
  };
  console.error('[SoraData Upload Error]', JSON.stringify(errorLog, null, 2));
}

// File validation with enhanced security
function validateFile(file: File): { isValid: boolean; error?: string } {
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_TYPES = [
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/json',
    'text/plain',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/svg+xml'
  ];

  if (file.size > MAX_SIZE) {
    return { 
      isValid: false, 
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (50MB)` 
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { 
      isValid: false, 
      error: `File type ${file.type} is not supported` 
    };
  }

  // Check for suspicious file names
  const suspiciousPatterns = /[<>:"|?*\\]/;
  if (suspiciousPatterns.test(file.name)) {
    return { 
      isValid: false, 
      error: 'File name contains invalid characters' 
    };
  }

  return { isValid: true };
}

// Enhanced file processing with better error handling
async function processFileContent(file: File): Promise<{
  content: string;
  metadata: any;
  processingTime: number;
}> {
  const startTime = Date.now();
  const fileName = file.name.toLowerCase();
  let content = '';
  let metadata = {
    originalName: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  };

  try {
    if (file.type === 'text/csv' || fileName.endsWith('.csv')) {
      content = await file.text();
      
      // Basic CSV validation
      const lines = content.split('\n');
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header and one data row');
      }
      
      metadata = {
        ...metadata,
        estimatedRows: lines.length - 1,
        estimatedColumns: lines[0] ? lines[0].split(',').length : 0
      };
      
    } else if (file.type === 'application/json' || fileName.endsWith('.json')) {
      content = await file.text();
      
      // Validate JSON
      try {
        const parsed = JSON.parse(content);
        metadata = {
          ...metadata,
          jsonType: Array.isArray(parsed) ? 'array' : 'object',
          estimatedRecords: Array.isArray(parsed) ? parsed.length : 1
        };
      } catch (jsonError) {
        throw new Error('Invalid JSON format');
      }
      
    } else if (file.type === 'text/plain' || fileName.endsWith('.txt')) {
      content = await file.text();
      metadata = {
        ...metadata,
        estimatedLines: content.split('\n').length,
        estimatedWords: content.split(/\s+/).length
      };
      
    } else if (file.type.includes('spreadsheet') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64String = btoa(String.fromCharCode(...uint8Array));
      
      content = JSON.stringify({
        type: 'excel',
        data: base64String,
        filename: file.name,
        size: file.size
      });
      
      metadata = {
        ...metadata,
        processingType: 'excel',
        requiresSpecialProcessing: true
      };
      
    } else if (file.type.startsWith('image/')) {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64String = btoa(String.fromCharCode(...uint8Array));
      
      content = JSON.stringify({
        type: 'image',
        data: base64String,
        mimeType: file.type,
        filename: file.name,
        size: file.size
      });
      
      metadata = {
        ...metadata,
        processingType: 'image',
        requiresSpecialProcessing: true
      };
      
    } else {
      // Fallback to text processing
      try {
        content = await file.text();
        metadata = {
          ...metadata,
          processingType: 'text_fallback',
          warning: 'File processed as plain text'
        };
      } catch (error) {
        throw new Error(`Unable to process file type ${file.type}`);
      }
    }

    const processingTime = Date.now() - startTime;
    return { content, metadata, processingTime };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logError(error, 'File processing failed', undefined);
    throw new Error(`File processing failed: ${error.message}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let userId: string | undefined;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Enhanced authentication with better error handling
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header provided')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid authentication credentials')
    }

    userId = user.id;

    // Get form data
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      throw new Error('No file provided in the request')
    }

    console.log(`[Upload Start] User: ${userId}, File: ${file.name}, Size: ${file.size}, Type: ${file.type}`)

    // Enhanced file validation
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Process file with enhanced error handling
    const { content, metadata, processingTime } = await processFileContent(file);

    console.log(`[Upload Success] User: ${userId}, File: ${file.name}, Processing Time: ${processingTime}ms`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: content,
        filename: file.name,
        type: file.type,
        size: file.size,
        metadata,
        processingTime
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    logError(error, 'Upload function error', userId);
    
    // Categorize errors for better user experience
    let statusCode = 400;
    let userMessage = 'An error occurred while processing your file';
    
    if (error.message.includes('authorization') || error.message.includes('authentication')) {
      statusCode = 401;
      userMessage = 'Please login to upload files';
    } else if (error.message.includes('size') || error.message.includes('type')) {
      statusCode = 413;
      userMessage = error.message;
    } else if (error.message.includes('Invalid') || error.message.includes('format')) {
      statusCode = 422;
      userMessage = error.message;
    }

    return new Response(
      JSON.stringify({ 
        error: userMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      },
    )
  }
})
