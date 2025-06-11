import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const SALT_ROUNDS = 10;
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

interface AuthUser {
  id: number;
  email: string;
  username: string;
  displayName: string;
  passwordHash: string;
  isPremium: boolean;
  createdAt: string;
}

interface UserSession {
  id: number;
  userId: number;
  token: string;
  createdAt: string;
  expiresAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: Partial<AuthUser>;
  token?: string;
}

// إنشاء مجلد البيانات إذا لم يكن موجوداً
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// تحميل المستخدمين من الملف
function loadUsers(): Map<number, AuthUser> {
  ensureDataDir();
  const users = new Map<number, AuthUser>();
  
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      const usersArray: AuthUser[] = JSON.parse(data);
      usersArray.forEach(user => users.set(user.id, user));
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
  
  return users;
}

// حفظ المستخدمين في الملف
function saveUsers(users: Map<number, AuthUser>) {
  ensureDataDir();
  const usersArray = Array.from(users.values());
  fs.writeFileSync(USERS_FILE, JSON.stringify(usersArray, null, 2));
}

// تحميل الجلسات من الملف
function loadSessions(): Map<string, UserSession> {
  ensureDataDir();
  const sessions = new Map<string, UserSession>();
  
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf8');
      const sessionsArray: UserSession[] = JSON.parse(data);
      sessionsArray.forEach(session => sessions.set(session.token, session));
    }
  } catch (error) {
    console.error('Error loading sessions:', error);
  }
  
  return sessions;
}

// حفظ الجلسات في الملف
function saveSessions(sessions: Map<string, UserSession>) {
  ensureDataDir();
  const sessionsArray = Array.from(sessions.values());
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessionsArray, null, 2));
}

// الحصول على ID التالي للمستخدم
function getNextUserId(users: Map<number, AuthUser>): number {
  const ids = Array.from(users.keys());
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

// الحصول على ID التالي للجلسة
function getNextSessionId(sessions: Map<string, UserSession>): number {
  const ids = Array.from(sessions.values()).map(s => s.id);
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

export class PersistentAuthSystem {
  private users: Map<number, AuthUser>;
  private sessions: Map<string, UserSession>;

  constructor() {
    this.users = loadUsers();
    this.sessions = loadSessions();
    
    // إنشاء مستخدم افتراضي إذا لم يكن موجوداً
    if (this.users.size === 0) {
      this.createDefaultUser();
    }
  }

  private async createDefaultUser() {
    const hashedPassword = await bcrypt.hash('Karim2004@', SALT_ROUNDS);
    
    const defaultUser: AuthUser = {
      id: 1,
      email: "karimtik091980@gmail.com",
      username: "karimtik091980",
      displayName: "Karim",
      passwordHash: hashedPassword,
      isPremium: true,
      createdAt: new Date().toISOString()
    };

    this.users.set(1, defaultUser);
    saveUsers(this.users);
  }

  // تسجيل مستخدم جديد
  async registerUser(email: string, username: string, password: string, displayName?: string): Promise<AuthResponse> {
    try {
      // فحص إذا كان المستخدم موجود بالفعل
      const existingUser = Array.from(this.users.values()).find(u => u.email === email);
      if (existingUser) {
        return {
          success: false,
          message: "البريد الإلكتروني مستخدم بالفعل"
        };
      }

      // فحص اسم المستخدم
      const existingUsername = Array.from(this.users.values()).find(u => u.username === username);
      if (existingUsername) {
        return {
          success: false,
          message: "اسم المستخدم مستخدم بالفعل"
        };
      }

      // تشفير كلمة المرور
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // إنشاء المستخدم الجديد
      const nextId = getNextUserId(this.users);
      const newUser: AuthUser = {
        id: nextId,
        email,
        username,
        displayName: displayName || username,
        passwordHash: hashedPassword,
        isPremium: false,
        createdAt: new Date().toISOString()
      };

      this.users.set(newUser.id, newUser);
      saveUsers(this.users);

      // إنشاء token
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // إنشاء جلسة
      const sessionId = getNextSessionId(this.sessions);
      const session: UserSession = {
        id: sessionId,
        userId: newUser.id,
        token,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      this.sessions.set(token, session);
      saveSessions(this.sessions);

      return {
        success: true,
        message: "تم إنشاء الحساب بنجاح",
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          displayName: newUser.displayName,
          isPremium: newUser.isPremium
        },
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
  async loginUser(emailOrUsername: string, password: string): Promise<AuthResponse> {
    try {
      // البحث عن المستخدم
      const user = Array.from(this.users.values()).find(u => 
        u.email === emailOrUsername || u.username === emailOrUsername
      );

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

      // إنشاء token جديد
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // إنشاء جلسة جديدة
      const sessionId = getNextSessionId(this.sessions);
      const session: UserSession = {
        id: sessionId,
        userId: user.id,
        token,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      this.sessions.set(token, session);
      saveSessions(this.sessions);

      return {
        success: true,
        message: "تم تسجيل الدخول بنجاح",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          isPremium: user.isPremium
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
      const session = this.sessions.get(token);
      if (!session) {
        return null;
      }

      // فحص انتهاء صلاحية الجلسة
      if (new Date(session.expiresAt) < new Date()) {
        this.sessions.delete(token);
        saveSessions(this.sessions);
        return null;
      }

      const user = this.users.get(session.userId);
      return user || null;

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
      this.sessions.delete(token);
      saveSessions(this.sessions);
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

  // الحصول على معلومات المستخدم
  async getUserById(userId: number): Promise<AuthUser | null> {
    return this.users.get(userId) || null;
  }

  // تحديث معلومات المستخدم
  async updateUser(userId: number, updates: Partial<AuthUser>): Promise<AuthResponse> {
    try {
      const user = this.users.get(userId);
      if (!user) {
        return {
          success: false,
          message: "المستخدم غير موجود"
        };
      }

      const updatedUser = { ...user, ...updates };
      this.users.set(userId, updatedUser);
      saveUsers(this.users);

      return {
        success: true,
        message: "تم تحديث المعلومات بنجاح",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          displayName: updatedUser.displayName,
          isPremium: updatedUser.isPremium
        }
      };

    } catch (error) {
      console.error('Update user error:', error);
      return {
        success: false,
        message: "حدث خطأ أثناء تحديث المعلومات"
      };
    }
  }
}

export const persistentAuthSystem = new PersistentAuthSystem();