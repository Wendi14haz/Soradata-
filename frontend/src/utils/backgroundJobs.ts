
import { supabase } from '@/integrations/supabase/client';
import { BackendMonitor } from './backendMonitor';

export interface Job {
  id: string;
  type: string;
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  scheduledAt: Date;
  processedAt?: Date;
  error?: string;
}

export interface JobProcessor {
  process(payload: any): Promise<any>;
}

export class BackgroundJobManager {
  private static processors = new Map<string, JobProcessor>();
  private static isProcessing = false;
  private static processingInterval = 5000; // 5 seconds
  private static jobQueue: Job[] = [];

  static {
    // Start background processing
    this.startProcessing();
  }

  static registerProcessor(jobType: string, processor: JobProcessor): void {
    this.processors.set(jobType, processor);
  }

  static async enqueue(jobType: string, payload: any, options: {
    maxAttempts?: number;
    scheduledAt?: Date;
  } = {}): Promise<string> {
    const jobId = crypto.randomUUID();
    
    try {
      // Use chat_sessions table as a temporary queue since notification_queue is not in types
      await supabase.from('chat_sessions').insert({
        id: jobId,
        user_id: payload.userId || '00000000-0000-0000-0000-000000000000',
        title: `Job: ${jobType}`,
        created_at: options.scheduledAt?.toISOString() || new Date().toISOString()
      });

      // Store job details in memory for now
      const job: Job = {
        id: jobId,
        type: jobType,
        payload,
        status: 'pending',
        attempts: 0,
        maxAttempts: options.maxAttempts || 3,
        scheduledAt: options.scheduledAt || new Date()
      };

      this.jobQueue.push(job);

      BackendMonitor.recordMetric({
        name: 'background_jobs_enqueued',
        value: 1,
        type: 'counter',
        tags: { jobType }
      });

      return jobId;
    } catch (error) {
      console.error('Failed to enqueue job:', error);
      throw error;
    }
  }

  private static async startProcessing(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const processJobs = async () => {
      try {
        await this.processNextJobs();
      } catch (error) {
        console.error('Error processing jobs:', error);
      }
      
      setTimeout(processJobs, this.processingInterval);
    };

    processJobs();
  }

  private static async processNextJobs(): Promise<void> {
    const pendingJobs = this.jobQueue.filter(job => 
      job.status === 'pending' && 
      job.scheduledAt <= new Date()
    ).slice(0, 10);

    for (const job of pendingJobs) {
      await this.processJob(job);
    }
  }

  private static async processJob(job: Job): Promise<void> {
    const processor = this.processors.get(job.type);
    if (!processor) {
      console.warn(`No processor found for job type: ${job.type}`);
      return;
    }

    // Update job status
    job.status = 'processing';
    const startTime = Date.now();

    try {
      const result = await processor.process(job.payload);
      
      job.status = 'completed';
      job.processedAt = new Date();
      job.payload.result = result;

      BackendMonitor.recordMetric({
        name: 'background_jobs_completed',
        value: 1,
        type: 'counter',
        tags: { jobType: job.type }
      });

      BackendMonitor.recordMetric({
        name: 'background_job_duration',
        value: Date.now() - startTime,
        type: 'histogram',
        tags: { jobType: job.type, status: 'success' }
      });

    } catch (error) {
      job.attempts += 1;

      if (job.attempts >= job.maxAttempts) {
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : 'Unknown error';

        BackendMonitor.recordMetric({
          name: 'background_jobs_failed',
          value: 1,
          type: 'counter',
          tags: { jobType: job.type }
        });
      } else {
        // Retry with exponential backoff
        const retryDelay = Math.pow(2, job.attempts) * 1000; // 2^attempts seconds
        job.scheduledAt = new Date(Date.now() + retryDelay);
        job.status = 'pending';

        BackendMonitor.recordMetric({
          name: 'background_jobs_retried',
          value: 1,
          type: 'counter',
          tags: { jobType: job.type, attempt: job.attempts.toString() }
        });
      }

      BackendMonitor.recordMetric({
        name: 'background_job_duration',
        value: Date.now() - startTime,
        type: 'histogram',
        tags: { jobType: job.type, status: 'error' }
      });
    }
  }

  static async getJobStatus(jobId: string): Promise<Job | null> {
    const job = this.jobQueue.find(j => j.id === jobId);
    return job || null;
  }

  static async cancelJob(jobId: string): Promise<boolean> {
    const jobIndex = this.jobQueue.findIndex(j => j.id === jobId);
    if (jobIndex === -1) return false;

    const job = this.jobQueue[jobIndex];
    if (job.status === 'pending') {
      job.status = 'failed';
      job.error = 'Cancelled by user';
      return true;
    }

    return false;
  }
}

// Built-in job processors
export class FileProcessingJobProcessor implements JobProcessor {
  async process(payload: any): Promise<any> {
    const { fileName, fileSize, processingType, userId } = payload;
    
    console.log(`Processing file: ${fileName} (${processingType})`);

    const startTime = Date.now();

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const processingTime = Date.now() - startTime;

      console.log(`Completed processing file: ${fileName} in ${processingTime}ms`);

      return { processingTime, status: 'completed' };
    } catch (error) {
      console.error(`Failed to process file: ${fileName}`, error);
      throw error;
    }
  }
}

// Register built-in processors
BackgroundJobManager.registerProcessor('file_processing', new FileProcessingJobProcessor());
