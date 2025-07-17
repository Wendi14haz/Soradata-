
import { EnhancedMonitor } from './enhancedMonitor';

export interface JobConfig {
  id: string;
  type: string;
  payload: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  scheduledAt?: Date;
}

export interface JobResult {
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
  attempts: number;
}

export interface JobStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  result?: JobResult;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface JobProcessor {
  type: string;
  process: (payload: any, onProgress?: (progress: number) => void) => Promise<any>;
}

export class EnhancedJobManager {
  private static instance: EnhancedJobManager;
  private jobs = new Map<string, JobStatus>();
  private processors = new Map<string, JobProcessor>();
  private queue: JobConfig[] = [];
  private isProcessing = false;
  private maxConcurrent = 3;
  private running = new Set<string>();

  private constructor() {
    this.startProcessing();
    this.setupDefaultProcessors();
  }

  static getInstance(): EnhancedJobManager {
    if (!this.instance) {
      this.instance = new EnhancedJobManager();
    }
    return this.instance;
  }

  registerProcessor(processor: JobProcessor): void {
    this.processors.set(processor.type, processor);
  }

  async enqueue(config: Omit<JobConfig, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    const job: JobConfig = { ...config, id };
    
    // Sort by priority and scheduled time
    const insertIndex = this.findInsertIndex(job);
    this.queue.splice(insertIndex, 0, job);

    this.jobs.set(id, {
      id,
      status: 'pending',
      progress: 0,
      createdAt: new Date()
    });

    EnhancedMonitor.recordMetric({
      name: 'job_enqueued',
      value: 1,
      category: 'business',
      tags: { type: config.type, priority: config.priority }
    });

    return id;
  }

  getJobStatus(id: string): JobStatus | null {
    return this.jobs.get(id) || null;
  }

  async cancelJob(id: string): Promise<boolean> {
    const job = this.jobs.get(id);
    if (!job) return false;

    if (job.status === 'running') {
      // Mark for cancellation
      job.status = 'cancelled';
      return true;
    }

    if (job.status === 'pending') {
      // Remove from queue
      const queueIndex = this.queue.findIndex(q => q.id === id);
      if (queueIndex >= 0) {
        this.queue.splice(queueIndex, 1);
      }
      job.status = 'cancelled';
      return true;
    }

    return false;
  }

  private findInsertIndex(job: JobConfig): number {
    const priorities = { critical: 0, high: 1, normal: 2, low: 3 };
    const jobPriority = priorities[job.priority];
    const scheduledTime = job.scheduledAt?.getTime() || Date.now();

    for (let i = 0; i < this.queue.length; i++) {
      const queuedJob = this.queue[i];
      const queuedPriority = priorities[queuedJob.priority];
      const queuedTime = queuedJob.scheduledAt?.getTime() || Date.now();

      if (jobPriority < queuedPriority || 
          (jobPriority === queuedPriority && scheduledTime < queuedTime)) {
        return i;
      }
    }

    return this.queue.length;
  }

  private async startProcessing(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const processJobs = async () => {
      try {
        await this.processNextJobs();
      } catch (error) {
        console.error('Error in job processing:', error);
      }
      
      setTimeout(processJobs, 1000); // Check every second
    };

    processJobs();
  }

  private async processNextJobs(): Promise<void> {
    while (this.running.size < this.maxConcurrent && this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) break;

      // Check if job is scheduled for future
      if (job.scheduledAt && job.scheduledAt.getTime() > Date.now()) {
        // Put it back in queue
        this.queue.unshift(job);
        break;
      }

      this.processJob(job);
    }
  }

  private async processJob(config: JobConfig): Promise<void> {
    const status = this.jobs.get(config.id);
    if (!status) return;

    this.running.add(config.id);
    status.status = 'running';
    status.startedAt = new Date();

    const processor = this.processors.get(config.type);
    if (!processor) {
      status.status = 'failed';
      status.error = `No processor found for job type: ${config.type}`;
      this.running.delete(config.id);
      return;
    }

    const startTime = Date.now();
    let attempts = 0;

    const executeJob = async (): Promise<void> => {
      attempts++;
      
      try {
        // Setup timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Job timeout')), config.timeout);
        });

        const progressCallback = (progress: number) => {
          status.progress = Math.max(0, Math.min(100, progress));
        };

        const result = await Promise.race([
          processor.process(config.payload, progressCallback),
          timeoutPromise
        ]);

        status.status = 'completed';
        status.progress = 100;
        status.completedAt = new Date();
        status.result = {
          success: true,
          result,
          duration: Date.now() - startTime,
          attempts
        };

        EnhancedMonitor.recordMetric({
          name: 'job_completed',
          value: 1,
          category: 'business',
          tags: { type: config.type, duration: (Date.now() - startTime).toString() }
        });

      } catch (error: any) {
        if (attempts < config.maxRetries) {
          // Retry with exponential backoff
          const delay = config.retryDelay * Math.pow(2, attempts - 1);
          setTimeout(() => executeJob(), delay);
          return;
        }

        status.status = 'failed';
        status.completedAt = new Date();
        status.error = error.message;
        status.result = {
          success: false,
          error: error.message,
          duration: Date.now() - startTime,
          attempts
        };

        EnhancedMonitor.recordMetric({
          name: 'job_failed',
          value: 1,
          category: 'error',
          tags: { type: config.type, error: error.message }
        });
      } finally {
        this.running.delete(config.id);
      }
    };

    executeJob();
  }

  private setupDefaultProcessors(): void {
    // File processing job
    this.registerProcessor({
      type: 'file_processing',
      process: async (payload: { fileName: string; fileSize: number }, onProgress) => {
        onProgress?.(10);
        
        // Simulate file processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        onProgress?.(50);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        onProgress?.(90);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        onProgress?.(100);
        
        return { processed: true, fileName: payload.fileName };
      }
    });

    // Data analysis job
    this.registerProcessor({
      type: 'data_analysis',
      process: async (payload: { data: any[]; analysisType: string }, onProgress) => {
        onProgress?.(20);
        
        // Simulate analysis steps
        for (let i = 0; i < 5; i++) {
          await new Promise(resolve => setTimeout(resolve, 800));
          onProgress?.((i + 1) * 20);
        }
        
        return { analysis: 'completed', insights: ['insight1', 'insight2'] };
      }
    });

    // Email notification job
    this.registerProcessor({
      type: 'email_notification',
      process: async (payload: { to: string; subject: string; body: string }) => {
        // Simulate email sending
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { sent: true, messageId: crypto.randomUUID() };
      }
    });
  }

  getQueueStats(): {
    pending: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  } {
    const stats = {
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 0
    };

    for (const job of this.jobs.values()) {
      stats[job.status]++;
    }

    return stats;
  }

  clearCompleted(): void {
    const keysToDelete: string[] = [];
    
    for (const [id, job] of this.jobs.entries()) {
      if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
        keysToDelete.push(id);
      }
    }

    keysToDelete.forEach(key => this.jobs.delete(key));
  }
}

// Export singleton instance
export const jobManager = EnhancedJobManager.getInstance();
