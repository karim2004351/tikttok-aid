import { users, deployments, systemSettings, type User, type InsertUser, type Deployment, type InsertDeployment } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

interface Operation {
  id: string;
  videoUrl: string;
  title: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  publisherType: 'admin' | 'user' | 'free';
  publisherName: string;
  publishedSites: number;
  totalSites: number;
  startTime: string;
  endTime?: string;
  errors: string[];
  successRate: number;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getDeployments(): Promise<Deployment[]>;
  getDeployment(id: number): Promise<Deployment | undefined>;
  createDeployment(deployment: InsertDeployment): Promise<Deployment>;
  updateDeployment(id: number, updates: Partial<Deployment>): Promise<Deployment | undefined>;
  addLogToDeployment(id: number, logEntry: string): Promise<void>;
  deleteDeployment(id: number): Promise<boolean>;
  clearAllDeployments(): Promise<boolean>;
  
  // Free publish methods
  checkFreePublishEligibility(userIdentifier: string): Promise<boolean>;
  recordFreePublishAttempt(userIdentifier: string, videoUrl: string, targetVideoUrl: string): Promise<void>;
  markFreePublishAsUsed(userIdentifier: string): Promise<void>;
  
  // System settings methods
  getSystemSetting(key: string): Promise<string | null>;
  setSystemSetting(key: string, value: string, updatedBy?: string): Promise<void>;
  
  // Operations analytics methods
  getOperations(): Promise<Operation[]>;
  getAllOperations(): Promise<any[]>;
  getOperation(id: string): Promise<any>;
  createOperation(operation: Omit<Operation, 'id'>): Promise<Operation>;
  updateOperation(id: string, updates: any): Promise<any>;
  deleteOperation(id: string): Promise<boolean>;
  updateOperationStatus(id: string, status: Operation['status'], errors?: string[]): Promise<void>;
  bulkOperationAction(action: string, operationIds: string[]): Promise<any>;
  singleOperationAction(id: string, action: string): Promise<any>;
  getActiveUsersCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getDeployments(): Promise<Deployment[]> {
    const result = await db.select().from(deployments).orderBy(deployments.startedAt);
    return result.sort((a, b) => 
      new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime()
    );
  }

  async getDeployment(id: number): Promise<Deployment | undefined> {
    const [deployment] = await db.select().from(deployments).where(eq(deployments.id, id));
    return deployment || undefined;
  }

  async createDeployment(insertDeployment: InsertDeployment): Promise<Deployment> {
    const [deployment] = await db
      .insert(deployments)
      .values({
        ...insertDeployment,
        status: "pending",
        progress: 0,
        logs: [],
      })
      .returning();
    return deployment;
  }

  async updateDeployment(id: number, updates: Partial<Deployment>): Promise<Deployment | undefined> {
    const [deployment] = await db
      .update(deployments)
      .set(updates)
      .where(eq(deployments.id, id))
      .returning();
    return deployment || undefined;
  }

  async addLogToDeployment(id: number, logEntry: string): Promise<void> {
    const deployment = await this.getDeployment(id);
    if (!deployment) return;

    const updatedLogs = [...(deployment.logs || []), logEntry];
    await db
      .update(deployments)
      .set({ logs: updatedLogs })
      .where(eq(deployments.id, id));
  }

  async checkFreePublishEligibility(userIdentifier: string): Promise<boolean> {
    return true;
  }

  async recordFreePublishAttempt(userIdentifier: string, videoUrl: string, targetVideoUrl: string): Promise<void> {
    // يمكن إضافة تسجيل المحاولات في قاعدة البيانات
  }

  async markFreePublishAsUsed(userIdentifier: string): Promise<void> {
    // يمكن إضافة تحديث حالة الاستخدام في قاعدة البيانات
  }

  async getSystemSetting(key: string): Promise<string | null> {
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key));
    return setting?.value || null;
  }

  async setSystemSetting(key: string, value: string, updatedBy?: string): Promise<void> {
    await db
      .insert(systemSettings)
      .values({ key, value, updatedBy, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: { 
          value, 
          updatedBy, 
          updatedAt: new Date() 
        }
      });
  }

  async deleteDeployment(id: number): Promise<boolean> {
    try {
      await db.delete(deployments).where(eq(deployments.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting deployment:', error);
      return false;
    }
  }

  async clearAllDeployments(): Promise<boolean> {
    try {
      await db.delete(deployments);
      return true;
    } catch (error) {
      console.error('Error clearing deployments:', error);
      return false;
    }
  }

  // Operations analytics methods implementation
  private operations: Map<string, Operation> = new Map();
  private currentOperationId = 1;

  async getAllOperations(): Promise<any[]> {
    if (this.operations.size === 0) {
      await this.initializeMockOperations();
    }
    return Array.from(this.operations.values()).map(op => ({
      id: op.id,
      type: 'deployment',
      title: op.title,
      status: op.status,
      progress: Math.floor((op.publishedSites / op.totalSites) * 100),
      startTime: op.startTime,
      endTime: op.endTime,
      executor: {
        type: op.publisherType === 'admin' ? 'admin' : 'user',
        username: op.publisherName,
        userId: op.id
      },
      details: {
        videoUrl: op.videoUrl,
        targetSites: op.totalSites,
        successCount: op.publishedSites,
        failureCount: op.totalSites - op.publishedSites,
        logs: op.errors
      },
      resources: {
        cpu: Math.floor(Math.random() * 30 + 20),
        memory: Math.floor(Math.random() * 40 + 30),
        network: Math.floor(Math.random() * 50 + 10)
      }
    })).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  async getOperation(id: string): Promise<any> {
    const operation = this.operations.get(id);
    if (!operation) return null;
    
    return {
      id: operation.id,
      type: 'deployment',
      title: operation.title,
      status: operation.status,
      progress: Math.floor((operation.publishedSites / operation.totalSites) * 100),
      startTime: operation.startTime,
      endTime: operation.endTime,
      executor: {
        type: operation.publisherType === 'admin' ? 'admin' : 'user',
        username: operation.publisherName,
        userId: operation.id
      },
      details: {
        videoUrl: operation.videoUrl,
        targetSites: operation.totalSites,
        successCount: operation.publishedSites,
        failureCount: operation.totalSites - operation.publishedSites,
        logs: operation.errors
      },
      resources: {
        cpu: Math.floor(Math.random() * 30 + 20),
        memory: Math.floor(Math.random() * 40 + 30),
        network: Math.floor(Math.random() * 50 + 10)
      }
    };
  }

  async updateOperation(id: string, updates: any): Promise<any> {
    const operation = this.operations.get(id);
    if (!operation) return null;

    const updatedOperation = { ...operation, ...updates };
    this.operations.set(id, updatedOperation);
    return updatedOperation;
  }

  async deleteOperation(id: string): Promise<boolean> {
    return this.operations.delete(id);
  }

  async getActiveUsersCount(): Promise<number> {
    return Math.floor(Math.random() * 50 + 10);
  }

  async getOperations(): Promise<Operation[]> {
    if (this.operations.size === 0) {
      await this.initializeMockOperations();
    }
    return Array.from(this.operations.values()).sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  async createOperation(operation: Omit<Operation, 'id'>): Promise<Operation> {
    const id = `op_${this.currentOperationId++}`;
    const newOperation: Operation = { ...operation, id };
    this.operations.set(id, newOperation);
    return newOperation;
  }

  async updateOperationStatus(id: string, status: Operation['status'], errors?: string[]): Promise<void> {
    const operation = this.operations.get(id);
    if (operation) {
      operation.status = status;
      if (errors) {
        operation.errors = errors;
      }
      if (status === 'completed' || status === 'failed') {
        operation.endTime = new Date().toISOString();
      }
      this.operations.set(id, operation);
    }
  }

  async bulkOperationAction(action: string, operationIds: string[]): Promise<any> {
    const results = [];
    for (const id of operationIds) {
      const result = await this.singleOperationAction(id, action);
      results.push(result);
    }
    return results;
  }

  async singleOperationAction(id: string, action: string): Promise<any> {
    const operation = this.operations.get(id);
    if (!operation) {
      throw new Error('Operation not found');
    }

    switch (action) {
      case 'pause':
        if (operation.status === 'running') {
          operation.status = 'paused';
        }
        break;
      case 'resume':
        if (operation.status === 'paused') {
          operation.status = 'running';
        }
        break;
      case 'restart':
        operation.status = 'running';
        operation.startTime = new Date().toISOString();
        operation.endTime = undefined;
        operation.publishedSites = 0;
        operation.errors = [];
        break;
      case 'delete':
        this.operations.delete(id);
        return { deleted: true };
    }

    this.operations.set(id, operation);
    return { updated: true, operation };
  }

  private async initializeMockOperations(): Promise<void> {
    const mockOperations: Omit<Operation, 'id'>[] = [
      {
        videoUrl: 'https://www.tiktok.com/@user1/video/123',
        title: 'فيديو ترفيهي عن الطبخ العربي',
        status: 'running',
        publisherType: 'user',
        publisherName: 'أحمد محمد',
        publishedSites: 245,
        totalSites: 350,
        startTime: new Date(Date.now() - 3600000).toISOString(),
        errors: [],
        successRate: 70
      },
      {
        videoUrl: 'https://youtube.com/watch?v=abc123',
        title: 'دليل شامل للتسويق الرقمي',
        status: 'completed',
        publisherType: 'admin',
        publisherName: 'المدير الرئيسي',
        publishedSites: 500,
        totalSites: 500,
        startTime: new Date(Date.now() - 7200000).toISOString(),
        endTime: new Date(Date.now() - 1800000).toISOString(),
        errors: [],
        successRate: 100
      },
      {
        videoUrl: 'https://www.tiktok.com/@user2/video/456',
        title: 'نصائح للحياة الصحية',
        status: 'failed',
        publisherType: 'free',
        publisherName: 'زائر مجهول',
        publishedSites: 45,
        totalSites: 150,
        startTime: new Date(Date.now() - 5400000).toISOString(),
        endTime: new Date(Date.now() - 3600000).toISOString(),
        errors: ['فشل في الاتصال بالموقع', 'رابط الفيديو غير صحيح'],
        successRate: 30
      },
      {
        videoUrl: 'https://youtube.com/watch?v=def456',
        title: 'شرح برمجة التطبيقات',
        status: 'paused',
        publisherType: 'user',
        publisherName: 'سارة أحمد',
        publishedSites: 120,
        totalSites: 280,
        startTime: new Date(Date.now() - 1800000).toISOString(),
        errors: [],
        successRate: 43
      },
      {
        videoUrl: 'https://www.tiktok.com/@user3/video/789',
        title: 'مراجعة أحدث الهواتف الذكية',
        status: 'running',
        publisherType: 'admin',
        publisherName: 'فريق التقنية',
        publishedSites: 380,
        totalSites: 450,
        startTime: new Date(Date.now() - 900000).toISOString(),
        errors: [],
        successRate: 84
      }
    ];

    for (const mockOp of mockOperations) {
      await this.createOperation(mockOp);
    }
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private deployments: Map<number, Deployment>;
  private currentUserId: number;
  private currentDeploymentId: number;

  constructor() {
    this.users = new Map();
    this.deployments = new Map();
    this.currentUserId = 1;
    this.currentDeploymentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getDeployments(): Promise<Deployment[]> {
    return Array.from(this.deployments.values()).sort((a, b) => 
      new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime()
    );
  }

  async getDeployment(id: number): Promise<Deployment | undefined> {
    return this.deployments.get(id);
  }

  async createDeployment(insertDeployment: InsertDeployment): Promise<Deployment> {
    const id = this.currentDeploymentId++;
    const deployment: Deployment = {
      ...insertDeployment,
      id,
      type: "admin",
      userIdentifier: null,
      status: "pending",
      progress: 0,
      startedAt: new Date(),
      completedAt: null,
      logs: [],
      commitHash: null,
      duration: null,
    };
    this.deployments.set(id, deployment);
    return deployment;
  }

  async updateDeployment(id: number, updates: Partial<Deployment>): Promise<Deployment | undefined> {
    const deployment = this.deployments.get(id);
    if (!deployment) return undefined;

    const updatedDeployment = { ...deployment, ...updates };
    this.deployments.set(id, updatedDeployment);
    return updatedDeployment;
  }

  async addLogToDeployment(id: number, logEntry: string): Promise<void> {
    const deployment = this.deployments.get(id);
    if (!deployment) return;

    const updatedLogs = [...(deployment.logs || []), logEntry];
    const updatedDeployment = { ...deployment, logs: updatedLogs };
    this.deployments.set(id, updatedDeployment);
  }

  async checkFreePublishEligibility(userIdentifier: string): Promise<boolean> {
    return true;
  }

  async recordFreePublishAttempt(userIdentifier: string, videoUrl: string, targetVideoUrl: string): Promise<void> {
    // تسجيل محاولة النشر المجاني
  }

  async markFreePublishAsUsed(userIdentifier: string): Promise<void> {
    // تحديث حالة استخدام النشر المجاني
  }

  async getSystemSetting(key: string): Promise<string | null> {
    return null;
  }

  async setSystemSetting(key: string, value: string, updatedBy?: string): Promise<void> {
    // حفظ الإعدادات
  }

  async deleteDeployment(id: number): Promise<boolean> {
    return this.deployments.delete(id);
  }

  async clearAllDeployments(): Promise<boolean> {
    this.deployments.clear();
    return true;
  }

  // Operations analytics methods implementation for MemStorage
  private operations: Map<string, Operation> = new Map();
  private currentOperationId = 1;

  async getOperations(): Promise<Operation[]> {
    return Array.from(this.operations.values()).sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  async createOperation(operation: Omit<Operation, 'id'>): Promise<Operation> {
    const id = `op_${this.currentOperationId++}`;
    const newOperation: Operation = { ...operation, id };
    this.operations.set(id, newOperation);
    return newOperation;
  }

  async updateOperationStatus(id: string, status: Operation['status'], errors?: string[]): Promise<void> {
    const operation = this.operations.get(id);
    if (operation) {
      operation.status = status;
      if (errors) {
        operation.errors = errors;
      }
      if (status === 'completed' || status === 'failed') {
        operation.endTime = new Date().toISOString();
      }
      this.operations.set(id, operation);
    }
  }

  async bulkOperationAction(action: string, operationIds: string[]): Promise<any> {
    const results = [];
    for (const id of operationIds) {
      const result = await this.singleOperationAction(id, action);
      results.push(result);
    }
    return results;
  }

  async singleOperationAction(id: string, action: string): Promise<any> {
    const operation = this.operations.get(id);
    if (!operation) {
      throw new Error('Operation not found');
    }

    switch (action) {
      case 'pause':
        if (operation.status === 'running') {
          operation.status = 'paused';
        }
        break;
      case 'resume':
        if (operation.status === 'paused') {
          operation.status = 'running';
        }
        break;
      case 'restart':
        operation.status = 'running';
        operation.startTime = new Date().toISOString();
        operation.endTime = undefined;
        operation.publishedSites = 0;
        operation.errors = [];
        break;
      case 'delete':
        this.operations.delete(id);
        return { deleted: true };
    }

    this.operations.set(id, operation);
    return { updated: true, operation };
  }
}

export const storage = new DatabaseStorage();
