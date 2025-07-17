
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { action, data } = await req.json()

    switch (action) {
      case 'health_check':
        return await handleHealthCheck(supabaseClient)
      
      case 'system_metrics':
        return await handleSystemMetrics(supabaseClient, data)
      
      case 'cleanup_old_data':
        return await handleCleanup(supabaseClient)
      
      case 'usage_analytics':
        return await handleUsageAnalytics(supabaseClient, data)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function handleHealthCheck(supabase: any) {
  const startTime = Date.now()
  
  // Check database connectivity
  const { error: dbError } = await supabase
    .from('system_metrics')
    .select('count')
    .limit(1)
  
  if (dbError) {
    return new Response(
      JSON.stringify({ 
        status: 'unhealthy', 
        error: dbError.message,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 503 }
    )
  }

  const responseTime = Date.now() - startTime

  // Get system statistics
  const { data: metrics } = await supabase
    .from('system_metrics')
    .select('*')
    .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Last hour
    .order('created_at', { ascending: false })

  const { data: apiLogs } = await supabase
    .from('api_usage_logs')
    .select('*')
    .gte('created_at', new Date(Date.now() - 3600000).toISOString())
    .order('created_at', { ascending: false })

  const totalRequests = apiLogs?.length || 0
  const errorRequests = apiLogs?.filter((log: any) => log.status_code >= 400).length || 0
  const avgResponseTime = apiLogs?.length > 0 
    ? apiLogs.reduce((sum: number, log: any) => sum + (log.response_time_ms || 0), 0) / apiLogs.length
    : 0

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: {
      connected: true,
      responseTime: `${responseTime}ms`
    },
    metrics: {
      totalRequests,
      errorRate: totalRequests > 0 ? Math.round((errorRequests / totalRequests) * 100) : 0,
      averageResponseTime: Math.round(avgResponseTime),
      activeMetrics: metrics?.length || 0
    },
    system: {
      memory: Deno.memoryUsage(),
      uptime: performance.now()
    }
  }

  return new Response(
    JSON.stringify(health),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleSystemMetrics(supabase: any, data: any) {
  const { timeRange = '1h', metricTypes = [] } = data

  let fromDate: Date
  switch (timeRange) {
    case '1h':
      fromDate = new Date(Date.now() - 3600000)
      break
    case '24h':
      fromDate = new Date(Date.now() - 86400000)
      break
    case '7d':
      fromDate = new Date(Date.now() - 604800000)
      break
    default:
      fromDate = new Date(Date.now() - 3600000)
  }

  let query = supabase
    .from('system_metrics')
    .select('*')
    .gte('created_at', fromDate.toISOString())
    .order('created_at', { ascending: false })

  if (metricTypes.length > 0) {
    query = query.in('metric_name', metricTypes)
  }

  const { data: metrics, error } = await query

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  // Aggregate metrics by type
  const aggregated = metrics?.reduce((acc: any, metric: any) => {
    if (!acc[metric.metric_name]) {
      acc[metric.metric_name] = {
        name: metric.metric_name,
        type: metric.metric_type,
        values: [],
        latest: metric.metric_value,
        count: 0,
        sum: 0,
        avg: 0,
        min: metric.metric_value,
        max: metric.metric_value
      }
    }

    const item = acc[metric.metric_name]
    item.values.push({
      value: metric.metric_value,
      timestamp: metric.created_at,
      tags: metric.tags
    })
    item.count++
    item.sum += parseFloat(metric.metric_value)
    item.avg = item.sum / item.count
    item.min = Math.min(item.min, metric.metric_value)
    item.max = Math.max(item.max, metric.metric_value)

    return acc
  }, {})

  return new Response(
    JSON.stringify({
      timeRange,
      metricsCount: metrics?.length || 0,
      metrics: Object.values(aggregated || {}),
      generatedAt: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCleanup(supabase: any) {
  const cutoffDate = new Date(Date.now() - 2592000000) // 30 days ago

  try {
    // Clean up old metrics
    const { error: metricsError } = await supabase
      .from('system_metrics')
      .delete()
      .lt('created_at', cutoffDate.toISOString())

    // Clean up old API logs
    const { error: logsError } = await supabase
      .from('api_usage_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())

    // Clean up old processing logs
    const { error: processingError } = await supabase
      .from('file_processing_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())

    // Clean up completed/failed notifications older than 7 days
    const notificationCutoff = new Date(Date.now() - 604800000) // 7 days ago
    const { error: notificationError } = await supabase
      .from('notification_queue')
      .delete()
      .lt('created_at', notificationCutoff.toISOString())
      .in('status', ['completed', 'failed'])

    const errors = [metricsError, logsError, processingError, notificationError].filter(Boolean)

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          errors: errors.map(e => e.message),
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cleanup completed successfully',
        cutoffDate: cutoffDate.toISOString(),
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}

async function handleUsageAnalytics(supabase: any, data: any) {
  const { userId, timeRange = '7d' } = data

  let fromDate: Date
  switch (timeRange) {
    case '1d':
      fromDate = new Date(Date.now() - 86400000)
      break
    case '7d':
      fromDate = new Date(Date.now() - 604800000)
      break
    case '30d':
      fromDate = new Date(Date.now() - 2592000000)
      break
    default:
      fromDate = new Date(Date.now() - 604800000)
  }

  let query = supabase
    .from('api_usage_logs')
    .select('*')
    .gte('created_at', fromDate.toISOString())
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data: logs, error } = await query

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  // Analyze usage patterns
  const analytics = {
    totalRequests: logs?.length || 0,
    uniqueUsers: new Set(logs?.map((log: any) => log.user_id)).size,
    topEndpoints: getTopEndpoints(logs || []),
    errorRate: calculateErrorRate(logs || []),
    averageResponseTime: calculateAverageResponseTime(logs || []),
    requestsByHour: getRequestsByHour(logs || []),
    timeRange,
    generatedAt: new Date().toISOString()
  }

  return new Response(
    JSON.stringify(analytics),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function getTopEndpoints(logs: any[]) {
  const endpoints = logs.reduce((acc: any, log: any) => {
    acc[log.endpoint] = (acc[log.endpoint] || 0) + 1
    return acc
  }, {})

  return Object.entries(endpoints)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([endpoint, count]) => ({ endpoint, count }))
}

function calculateErrorRate(logs: any[]) {
  if (logs.length === 0) return 0
  const errors = logs.filter(log => log.status_code >= 400).length
  return Math.round((errors / logs.length) * 100)
}

function calculateAverageResponseTime(logs: any[]) {
  if (logs.length === 0) return 0
  const total = logs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0)
  return Math.round(total / logs.length)
}

function getRequestsByHour(logs: any[]) {
  const hourly = logs.reduce((acc: any, log: any) => {
    const hour = new Date(log.created_at).getHours()
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {})

  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    requests: hourly[i] || 0
  }))
}
