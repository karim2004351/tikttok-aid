import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const SALT_ROUNDS = 10;

interface AuthUser {
  id: number;
  email: string;
  username: string;
  displayName: string;
  passwordHash: string;
  isPremium: boolean;
  createdAt: Date;
}

interface UserSession {
  id: number;
  userId: number;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: Partial<AuthUser>;
  token?: string;
}

// Memory storage
const memoryUsers: Map<number, AuthUser> = new Map();
const memorySessions: Map<string, UserSession> = new Map();
let nextUserId = 1;
let nextSessionId = 1;

// إنشاء المستخدم الأساسي
const defaultUser: AuthUser = {
  id: 1,
  email: "karimtik091980@gmail.com",
  username: "karimtik091980",
  displayName: "Karim",
  passwordHash: "$2b$10$h2R97Vk4QznyWg0NSVtPIOo0.jzdZEE8WPIunReOGSqilluSUywgK", // password: password
  isPremium: true,
  createdAt: new Date()
};

// إضافة مستخدم تجريبي إضافي
const testUser: AuthUser = {
  id: 2,
  email: "karimtiger@example.com",
  username: "karimtiger",
  displayName: "Karim Tiger",
  passwordHash: "$2b$10$h2R97Vk4QznyWg0NSVtPIOo0.jzdZEE8WPIunReOGSqilluSUywgK", // password: password
  isPremium: true,
  createdAt: new Date()
};

memoryUsers.set(1, defaultUser);
memoryUsers.set(2, testUser);
nextUserId = 3;

export class MemoryAuthSystem {
  // تسجيل مستخدم جديد
  async registerUser(email: string, username: string, password: string, displayName?: string): Promise<AuthResponse> {
    try {
      // فحص إذا كان المستخدم موجود بالفعل
      const existingUser = Array.from(memoryUsers.values()).find(u => u.email === email);
      if (existingUser) {
        return {
          success: false,
          message: "البريد الإلكتروني مستخدم بالفعل"
        };
      }

      // فحص اسم المستخدم
      const existingUsername = Array.from(memoryUsers.values()).find(u => u.username === username);
      if (existingUsername) {
        return {
          success: false,
          message: "اسم المستخدم مستخدم بالفعل"
        };
      }

      // تشفير كلمة المرور
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // إنشاء المستخدم الجديد
      const newUser: AuthUser = {
        id: nextUserId++,
        email,
        username,
        displayName: displayName || username,
        passwordHash: hashedPassword,
        isPremium: false,
        createdAt: new Date()
      };

      memoryUsers.set(newUser.id, newUser);

      // إنشاء token
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // إنشاء جلسة
      const session: UserSession = {
        id: nextSessionId++,
        userId: newUser.id,
        token,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 أيام
      };

      memorySessions.set(token, session);

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
      const user = Array.from(memoryUsers.values()).find(u => 
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
      const session: UserSession = {
        id: nextSessionId++,
        userId: user.id,
        token,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      memorySessions.set(token, session);

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
      const session = memorySessions.get(token);
      if (!session) {
        return null;
      }

      // فحص انتهاء صلاحية الجلسة
      if (session.expiresAt < new Date()) {
        memorySessions.delete(token);
        return null;
      }

      const user = memoryUsers.get(session.userId);
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
      memorySessions.delete(token);
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
    return memoryUsers.get(userId) || null;
  }

  // تحديث معلومات المستخدم
  async updateUser(userId: number, updates: Partial<AuthUser>): Promise<AuthResponse> {
    try {
      const user = memoryUsers.get(userId);
      if (!user) {
        return {
          success: false,
          message: "المستخدم غير موجود"
        };
      }

      const updatedUser = { ...user, ...updates };
      memoryUsers.set(userId, updatedUser);

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

export const memoryAuthSystem = new MemoryAuthSystem();