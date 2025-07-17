
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json().catch(() => ({}));
    const { message, chatHistory, filesContent, fileData } = requestBody;
    
    console.log('Chat AI request received:', {
      messageLength: message?.length || 0,
      historyLength: chatHistory?.length || 0,
      hasFiles: !!filesContent,
      hasFileData: !!fileData
    });

    // Validate required fields
    if (!message || typeof message !== 'string') {
      throw new Error('Message is required and must be a string');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Process files content if present
    let processedFiles = '';
    if (filesContent) {
      console.log('Processing files content...');
      
      try {
        // Try to parse as JSON first (for processed data)
        if (typeof filesContent === 'string') {
          const fileData = JSON.parse(filesContent);
          
          if (fileData.type === 'processed_data') {
            processedFiles = `
DATA FILE ANALYSIS:
Filename: ${fileData.filename}
Rows: ${fileData.rowCount} rows
Columns: ${fileData.columns?.join(', ') || 'Unknown columns'}
Sample Data: ${JSON.stringify(fileData.sampleData?.slice(0, 3) || [])}

Please analyze this data and provide insights based on the user's question.
`;
          } else if (fileData.type === 'excel') {
            processedFiles = `
EXCEL FILE ANALYSIS:
Filename: ${fileData.filename}
Size: ${fileData.size} bytes
The user has uploaded an Excel file. Please provide analysis guidance.
`;
          } else if (fileData.type === 'word') {
            processedFiles = `
WORD DOCUMENT ANALYSIS:
Filename: ${fileData.filename}
Size: ${fileData.size} bytes
The user has uploaded a Word document for analysis.
`;
          }
        } else {
          // Handle object format
          processedFiles = `
FILE CONTENT ANALYSIS:
Content: ${JSON.stringify(filesContent).substring(0, 1000)}...

Please analyze this data and provide insights based on the user's question.
`;
        }
      } catch (parseError) {
        console.log('Processing as plain text content');
        processedFiles = `
FILE CONTENT ANALYSIS:
Raw content: ${String(filesContent).substring(0, 2000)}${String(filesContent).length > 2000 ? '...' : ''}

Please analyze this data and provide insights based on the user's question.
`;
      }
    }

    // Handle fileData (processed file data)
    if (fileData && fileData.processedData) {
      console.log('Processing structured file data...');
      processedFiles += `

STRUCTURED DATA ANALYSIS:
Filename: ${fileData.fileName || 'Unknown'}
Rows: ${fileData.processedData.length} rows
Columns: ${fileData.metadata?.columns?.join(', ') || 'Unknown columns'}
Sample Data: ${JSON.stringify(fileData.processedData.slice(0, 5))}

Please provide detailed analysis of this structured data.
`;
    }

    // Build conversation context
    let conversationContext = '';
    if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
      conversationContext = '\n\nPrevious conversation context:\n';
      chatHistory.slice(-3).forEach((msg, index) => {
        if (msg && typeof msg === 'object') {
          const role = msg.isUser ? 'User' : 'Assistant';
          const content = String(msg.text || '').substring(0, 150);
          conversationContext += `${role}: ${content}${content.length >= 150 ? '...' : ''}\n`;
        }
      });
    }

    const systemPrompt = `You are SoraData AI, a helpful Indonesian data analysis assistant. You specialize in:
- Analyzing data from various file formats (CSV, Excel, JSON, Word, images)
- Providing clear insights and actionable recommendations in Indonesian language
- Explaining complex data patterns in simple terms
- Creating data visualization suggestions
- Answering questions about business intelligence and data analysis

IMPORTANT: Always respond in Indonesian language (Bahasa Indonesia).
Be friendly, professional, and provide practical insights.
If you receive file content, analyze it thoroughly and provide relevant insights.

${processedFiles ? `\n\nFILE DATA TO ANALYZE:\n${processedFiles}` : ''}
${conversationContext}`;

    console.log('Calling OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');

    const aiResponse = data.choices?.[0]?.message?.content || 'Maaf, saya tidak dapat memproses permintaan Anda saat ini. Silakan coba lagi.';

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Error in chat-ai function:', error);
    
    // Return a user-friendly error response
    const errorMessage = error.message?.includes('API') 
      ? 'Terjadi masalah dengan layanan AI. Silakan coba lagi dalam beberapa saat.'
      : 'Maaf, terjadi kesalahan dalam memproses permintaan Anda. Silakan coba lagi.';

    return new Response(
      JSON.stringify({ 
        response: errorMessage,
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 to prevent frontend errors
      },
    );
  }
});
