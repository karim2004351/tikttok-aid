import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const SALT_ROUNDS = 10;
const DB_PATH = path.join(process.cwd(), 'database.sqlite');

interface AuthUser {
  id: number;
  email: string;
  username: string;
  displayName: string;
  passwordHash: string;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string;
  lastLogin: string | null;
  loginCount: number;
}

interface UserSession {
  id: number;
  userId: number;
  token: string;
  createdAt: string;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
}

interface PublishingProcess {
  id: number;
  userId: number;
  videoUrl: string;
  title: string;
  hashtags: string;
  totalSites: number;
  completedSites: number;
  successfulSites: number;
  failedSites: number;
  status: string;
  progress: number;
  startedAt: string;
  completedAt: string | null;
  details: string | null;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: Partial<AuthUser>;
  token?: string;
}

export class SQLiteAuthSystem {
  private db: Database.Database;

  constructor() {
    this.db = new Database(DB_PATH);
    this.initializeTables();
    this.createDefaultUsers();
  }

  private initializeTables() {
    // جدول المستخدمين
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        displayName TEXT NOT NULL,
        passwordHash TEXT NOT NULL,
        isPremium INTEGER DEFAULT 0,
        isAdmin INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        lastLogin TEXT,
        loginCount INTEGER DEFAULT 0
      )
    `);

    // جدول الجلسات
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        expiresAt TEXT NOT NULL,
        ipAddress TEXT,
        userAgent TEXT,
        FOREIGN KEY (userId) REFERENCES users (id)
      )
    `);

    // جدول عمليات النشر
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS publishing_processes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        videoUrl TEXT NOT NULL,
        title TEXT,
        hashtags TEXT,
        totalSites INTEGER DEFAULT 0,
        completedSites INTEGER DEFAULT 0,
        successfulSites INTEGER DEFAULT 0,
        failedSites INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        progress INTEGER DEFAULT 0,
        startedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        completedAt TEXT,
        details TEXT,
        FOREIGN KEY (userId) REFERENCES users (id)
      )
    `);

    // جدول سجل النشاطات
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        action TEXT NOT NULL,
        details TEXT,
        ipAddress TEXT,
        userAgent TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id)
      )
    `);
  }

  private async createDefaultUsers() {
    const existingUser = this.db.prepare('SELECT id FROM users WHERE email = ?').get('karimtik091980@gmail.com');
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('Karim2004@', SALT_ROUNDS);
      const adminHashedPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
      
      // إنشاء المستخدم الأساسي
      this.db.prepare(`
        INSERT INTO users (email, username, displayName, passwordHash, isPremium, isAdmin)
        VALUES (?, ?, ?, ?, 1, 0)
      `).run('karimtik091980@gmail.com', 'karimtik091980', 'Karim', hashedPassword);
      
      // إنشاء مستخدم المدير
      this.db.prepare(`
        INSERT INTO users (email, username, displayName, passwordHash, isPremium, isAdmin)
        VALUES (?, ?, ?, ?, 1, 1)
      `).run('kleberphone@gmail.com', 'kleberphone', 'المدير', hashedPassword);
    }
  }

  // تسجيل مستخدم جديد
  async registerUser(email: string, username: string, password: string, displayName?: string, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    try {
      // فحص إذا كان المستخدم موجود بالفعل
      const existingUser = this.db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
      if (existingUser) {
        return {
          success: false,
          message: "البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل"
        };
      }

      // تشفير كلمة المرور
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // إنشاء المستخدم الجديد
      const result = this.db.prepare(`
        INSERT INTO users (email, username, displayName, passwordHash, isPremium, isAdmin)
        VALUES (?, ?, ?, ?, 0, 0)
      `).run(email, username, displayName || username, hashedPassword);

      const userId = result.lastInsertRowid as number;

      // تسجيل النشاط
      this.logActivity(userId, 'register', `تم إنشاء حساب جديد`, ipAddress, userAgent);

      // إنشاء token
      const token = jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // إنشاء جلسة
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      this.db.prepare(`
        INSERT INTO sessions (userId, token, expiresAt, ipAddress, userAgent)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, token, expiresAt, ipAddress, userAgent);

      const user = this.db.prepare('SELECT id, email, username, displayName, isPremium, isAdmin FROM users WHERE id = ?').get(userId) as AuthUser;

      return {
        success: true,
        message: "تم إنشاء الحساب بنجاح",
        user,
        token
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: "حدث خطأ أثناء إنشاء الحساب"
      };
    }
  }

  // تسجيل الدخول
  async loginUser(emailOrUsername: string, password: string, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    try {
      // البحث عن المستخدم
      const user = this.db.prepare(`
        SELECT * FROM users WHERE email = ? OR username = ?
      `).get(emailOrUsername, emailOrUsername) as AuthUser;

      if (!user) {
        return {
          success: false,
          message: "البريد الإلكتروني أو كلمة المرور غير صحيحة"
        };
      }

      // فحص كلمة المرور
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return {
          success: false,
          message: "البريد الإلكتروني أو كلمة المرور غير صحيحة"
        };
      }

      // تحديث آخر تسجيل دخول وعدد مرات الدخول
      this.db.prepare(`
        UPDATE users SET lastLogin = CURRENT_TIMESTAMP, loginCount = loginCount + 1 WHERE id = ?
      `).run(user.id);

      // تسجيل النشاط
      this.logActivity(user.id, 'login', `تم تسجيل الدخول`, ipAddress, userAgent);

      // إنشاء token جديد
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // إنشاء جلسة جديدة
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      this.db.prepare(`
        INSERT INTO sessions (userId, token, expiresAt, ipAddress, userAgent)
        VALUES (?, ?, ?, ?, ?)
      `).run(user.id, token, expiresAt, ipAddress, userAgent);

      return {
        success: true,
        message: "تم تسجيل الدخول بنجاح",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          isPremium: user.isPremium,
          isAdmin: user.isAdmin
        },
        token
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: "حدث خطأ أثناء تسجيل الدخول"
      };
    }
  }

  // التحقق من صحة Token
  async validateToken(token: string): Promise<AuthUser | null> {
    try {
      const session = this.db.prepare(`
        SELECT s.*, u.* FROM sessions s
        JOIN users u ON s.userId = u.id
        WHERE s.token = ? AND s.expiresAt > CURRENT_TIMESTAMP
      `).get(token) as any;

      if (!session) {
        return null;
      }

      return {
        id: session.userId,
        email: session.email,
        username: session.username,
        displayName: session.displayName,
        passwordHash: session.passwordHash,
        isPremium: session.isPremium,
        isAdmin: session.isAdmin,
        createdAt: session.createdAt,
        lastLogin: session.lastLogin,
        loginCount: session.loginCount
      };

    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  }

  // الحصول على المستخدم من Token
  async getUserFromToken(token: string): Promise<AuthUser | null> {
    return this.validateToken(token);
  }

  // تسجيل الخروج
  async logoutUser(token: string): Promise<AuthResponse> {
    try {
      const session = this.db.prepare('SELECT userId FROM sessions WHERE token = ?').get(token) as any;
      
      if (session) {
        this.logActivity(session.userId, 'logout', 'تم تسجيل الخروج');
      }

      this.db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
      
      return {
        success: true,
        message: "تم تسجيل الخروج بنجاح"
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: "حدث خطأ أثناء تسجيل الخروج"
      };
    }
  }

  // إضافة عملية نشر جديدة
  addPublishingProcess(userId: number, videoUrl: string, title: string, hashtags: string): number {
    const result = this.db.prepare(`
      INSERT INTO publishing_processes (userId, videoUrl, title, hashtags, totalSites, status)
      VALUES (?, ?, ?, ?, 1185, 'جاري النشر')
    `).run(userId, videoUrl, title, hashtags);
    
    this.logActivity(userId, 'start_publishing', `بدء عملية نشر جديدة: ${title}`);
    
    return result.lastInsertRowid as number;
  }

  // تحديث حالة عملية النشر
  updatePublishingProcess(processId: number, updates: Partial<PublishingProcess>) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    this.db.prepare(`UPDATE publishing_processes SET ${fields} WHERE id = ?`)
      .run(...values, processId);
  }

  // الحصول على عمليات النشر للمستخدم
  getUserPublishingProcesses(userId: number): PublishingProcess[] {
    return this.db.prepare(`
      SELECT * FROM publishing_processes WHERE userId = ? ORDER BY startedAt DESC
    `).all(userId) as PublishingProcess[];
  }

  // تسجيل النشاط
  private logActivity(userId: number | null, action: string, details?: string, ipAddress?: string, userAgent?: string) {
    this.db.prepare(`
      INSERT INTO activity_logs (userId, action, details, ipAddress, userAgent)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, action, details, ipAddress, userAgent);
  }

  // دوال المدير - الحصول على جميع المستخدمين
  getAllUsers(): AuthUser[] {
    return this.db.prepare(`
      SELECT id, email, username, displayName, isPremium, isAdmin, createdAt, lastLogin, loginCount
      FROM users ORDER BY createdAt DESC
    `).all() as AuthUser[];
  }

  // دوال المدير - الحصول على إحصائيات المستخدمين
  getUserStats() {
    const totalUsers = this.db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    const premiumUsers = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE isPremium = 1').get() as any;
    const activeToday = this.db.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE lastLogin > date('now', '-1 day')
    `).get() as any;
    const newThisWeek = this.db.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE createdAt > date('now', '-7 days')
    `).get() as any;

    return {
      totalUsers: totalUsers.count,
      premiumUsers: premiumUsers.count,
      activeToday: activeToday.count,
      newThisWeek: newThisWeek.count
    };
  }

  // دوال المدير - الحصول على سجل الأنشطة
  getActivityLogs(limit: number = 100) {
    return this.db.prepare(`
      SELECT a.*, u.username, u.displayName
      FROM activity_logs a
      LEFT JOIN users u ON a.userId = u.id
      ORDER BY a.createdAt DESC
      LIMIT ?
    `).all(limit);
  }

  // دوال المدير - الحصول على جميع عمليات النشر
  getAllPublishingProcesses() {
    return this.db.prepare(`
      SELECT p.*, u.username, u.displayName
      FROM publishing_processes p
      JOIN users u ON p.userId = u.id
      ORDER BY p.startedAt DESC
    `).all();
  }

  // دوال المدير - الحصول على إحصائيات النشر
  getPublishingStats() {
    const totalProcesses = this.db.prepare('SELECT COUNT(*) as count FROM publishing_processes').get() as any;
    const completedProcesses = this.db.prepare(`
      SELECT COUNT(*) as count FROM publishing_processes WHERE status = 'مكتمل'
    `).get() as any;
    const activeProcesses = this.db.prepare(`
      SELECT COUNT(*) as count FROM publishing_processes WHERE status = 'جاري النشر'
    `).get() as any;
    const failedProcesses = this.db.prepare(`
      SELECT COUNT(*) as count FROM publishing_processes WHERE status = 'فشل'
    `).get() as any;

    return {
      totalProcesses: totalProcesses.count,
      completedProcesses: completedProcesses.count,
      activeProcesses: activeProcesses.count,
      failedProcesses: failedProcesses.count
    };
  }

  // إغلاق قاعدة البيانات
  close() {
    this.db.close();
  }
}

export const sqliteAuthSystem = new SQLiteAuthSystem();