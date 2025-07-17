
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Enhanced error logging and monitoring
function logError(error: any, context: string, userId?: string, metadata?: any) {
  const errorLog = {
    context,
    message: error.message || 'Unknown error',
    stack: error.stack,
    userId,
    metadata,
    timestamp: new Date().toISOString(),
    function: 'analyze-data'
  };
  console.error('[SoraData Analysis Error]', JSON.stringify(errorLog, null, 2));
}

function logSuccess(context: string, userId?: string, metadata?: any) {
  const successLog = {
    context,
    userId,
    metadata,
    timestamp: new Date().toISOString(),
    function: 'analyze-data'
  };
  console.log('[SoraData Analysis Success]', JSON.stringify(successLog, null, 2));
}

// Enhanced data validation and preprocessing
function validateAndPreprocessData(data: any[]): {
  isValid: boolean;
  processedData: any[];
  metadata: any;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      isValid: false,
      processedData: [],
      metadata: {},
      warnings: ['Data is empty or invalid']
    };
  }

  // Remove null/undefined rows
  const cleanData = data.filter(row => row && typeof row === 'object');
  
  if (cleanData.length === 0) {
    return {
      isValid: false,
      processedData: [],
      metadata: {},
      warnings: ['No valid data rows found']
    };
  }

  // Analyze data structure
  const columns = Object.keys(cleanData[0] || {});
  const numericColumns = columns.filter(col => {
    const sampleValues = cleanData.slice(0, 10).map(row => row[col]);
    const numericCount = sampleValues.filter(val => 
      typeof val === 'number' || (!isNaN(Number(val)) && val !== '' && val !== null)
    ).length;
    return numericCount / sampleValues.length > 0.7;
  });

  const categoricalColumns = columns.filter(col => !numericColumns.includes(col));

  // Check data quality
  if (cleanData.length < data.length) {
    warnings.push(`Removed ${data.length - cleanData.length} invalid rows`);
  }

  const metadata = {
    totalRows: cleanData.length,
    totalColumns: columns.length,
    numericColumns: numericColumns.length,
    categoricalColumns: categoricalColumns.length,
    columns,
    dataTypes: {
      numeric: numericColumns,
      categorical: categoricalColumns
    }
  };

  return {
    isValid: true,
    processedData: cleanData,
    metadata,
    warnings
  };
}

// Enhanced AI prompt generation
function generateEnhancedPrompt(data: any[], userMessage: string, metadata: any): string {
  const basePrompt = `Kamu adalah SoraData AI, asisten analisis data yang ahli dan responsif.

DATA YANG DIANALISIS:
- ${metadata.totalRows} baris data
- ${metadata.totalColumns} kolom (${metadata.numericColumns} numerik, ${metadata.categoricalColumns} kategorikal)
- Kolom numerik: ${metadata.dataTypes.numeric.join(', ') || 'tidak ada'}
- Kolom kategorikal: ${metadata.dataTypes.categorical.join(', ') || 'tidak ada'}

Sample data (3 baris pertama):
${JSON.stringify(data.slice(0, 3), null, 2)}

INSTRUKSI ANALISIS:
1. Berikan insight yang actionable dan mudah dipahami
2. Fokus pada pola, tren, dan anomali yang signifikan
3. Sertakan rekomendasi konkret berdasarkan data
4. Gunakan bahasa Indonesia yang ramah dan profesional
5. Jika ada masalah data, sebutkan dengan solusi perbaikan

PERTANYAAN USER: ${userMessage}

Berikan analisis yang komprehensif namun tetap mudah dipahami:`;

  return basePrompt;
}

// Cache implementation for frequently requested analyses
const analysisCache = new Map<string, { result: string; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCacheKey(data: any[], userMessage: string): string {
  const dataHash = JSON.stringify({
    rowCount: data.length,
    columns: Object.keys(data[0] || {}),
    sample: data.slice(0, 2)
  });
  return btoa(dataHash + userMessage).substring(0, 32);
}

function getCachedResult(cacheKey: string): string | null {
  const cached = analysisCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }
  if (cached) {
    analysisCache.delete(cacheKey);
  }
  return null;
}

function setCachedResult(cacheKey: string, result: string): void {
  analysisCache.set(cacheKey, {
    result,
    timestamp: Date.now()
  });
  
  // Cleanup old entries
  if (analysisCache.size > 100) {
    const entries = Array.from(analysisCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    entries.slice(0, 20).forEach(([key]) => analysisCache.delete(key));
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let userId: string | undefined;
  const startTime = Date.now();

  try {
    const { data, userMessage } = await req.json();
    
    // Validate input
    if (!userMessage || typeof userMessage !== 'string') {
      throw new Error('User message is required and must be a string');
    }

    // Validate and preprocess data
    const validation = validateAndPreprocessData(data);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({
          analysis: `Maaf, ada masalah dengan data Anda: ${validation.warnings.join(', ')}. Silakan coba upload file yang berbeda atau periksa format data Anda.`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[Analyze Data] Processing request:", { 
      dataRows: validation.processedData.length, 
      columns: validation.metadata.totalColumns,
      userMessage: userMessage.substring(0, 100),
      warnings: validation.warnings
    });

    // Check cache first
    const cacheKey = getCacheKey(validation.processedData, userMessage);
    const cachedResult = getCachedResult(cacheKey);
    
    if (cachedResult) {
      logSuccess("Cache hit", userId, { cacheKey, processingTime: Date.now() - startTime });
      return new Response(
        JSON.stringify({ 
          analysis: cachedResult,
          cached: true,
          processingTime: Date.now() - startTime
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate enhanced prompt
    const enhancedPrompt = generateEnhancedPrompt(
      validation.processedData, 
      userMessage, 
      validation.metadata
    );

    // Call OpenAI with enhanced error handling
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: enhancedPrompt,
          },
          {
            role: "user", 
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const aiData = await response.json();

    if (!aiData || !aiData.choices || !aiData.choices[0]) {
      throw new Error("Invalid response structure from OpenAI API");
    }

    let analysis = aiData.choices[0].message.content;

    // Add warnings if any
    if (validation.warnings.length > 0) {
      analysis += `\n\n⚠️ Catatan: ${validation.warnings.join(', ')}`;
    }

    // Cache the result
    setCachedResult(cacheKey, analysis);

    const processingTime = Date.now() - startTime;
    
    logSuccess("Analysis completed", userId, { 
      processingTime,
      dataRows: validation.processedData.length,
      tokensUsed: aiData.usage?.total_tokens 
    });

    // Check if user is requesting visualization
    const isVisualizationRequest = userMessage.toLowerCase().includes('visualisasi') || 
                                 userMessage.toLowerCase().includes('grafik') ||
                                 userMessage.toLowerCase().includes('chart');

    return new Response(
      JSON.stringify({ 
        analysis,
        shouldShowVisualization: isVisualizationRequest,
        dataForVisualization: isVisualizationRequest ? validation.processedData.slice(0, 100) : null,
        metadata: validation.metadata,
        processingTime,
        cached: false
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logError(error, "Analysis function error", userId, { processingTime });
    
    let userMessage = 'Terjadi kesalahan saat menganalisis data Anda.';
    let statusCode = 500;
    
    if (error.message.includes('OpenAI API')) {
      userMessage = 'Layanan AI sedang mengalami gangguan. Coba lagi dalam beberapa saat.';
      statusCode = 503;
    } else if (error.message.includes('required') || error.message.includes('invalid')) {
      userMessage = error.message;
      statusCode = 400;
    }

    return new Response(
      JSON.stringify({
        analysis: userMessage,
        error: true,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        processingTime
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
