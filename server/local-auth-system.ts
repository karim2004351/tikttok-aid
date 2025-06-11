import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { users, userSessions, type User } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const SALT_ROUNDS = 10;

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: Partial<User>;
  token?: string;
}

export class LocalAuthSystem {
  // تسجيل مستخدم جديد
  async registerUser(email: string, username: string, password: string, displayName?: string): Promise<AuthResponse> {
    try {
      // فحص إذا كان المستخدم موجود بالفعل
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return {
          success: false,
          message: "البريد الإلكتروني مستخدم بالفعل"
        };
      }

      // فحص اسم المستخدم
      const existingUsername = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUsername.length > 0) {
        return {
          success: false,
          message: "اسم المستخدم مستخدم بالفعل"
        };
      }

      // تشفير كلمة المرور
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // إنشاء المستخدم الجديد
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          username,
          password: hashedPassword,
          displayName: displayName || username,
          provider: "local",
          isVerified: false,
          isPremium: false,
        })
        .returning();

      // إنشاء token
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // حفظ الجلسة
      await this.createSession(newUser.id, token);

      return {
        success: true,
        message: "تم إنشاء الحساب بنجاح",
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          displayName: newUser.displayName,
          isVerified: newUser.isVerified,
          isPremium: newUser.isPremium,
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
  async loginUser(email: string, password: string): Promise<AuthResponse> {
    try {
      // البحث عن المستخدم
      const [user] = await db
        .select()
        .from(users)
        .where(and(
          eq(users.email, email),
          eq(users.provider, "local")
        ))
        .limit(1);

      if (!user) {
        return {
          success: false,
          message: "البريد الإلكتروني غير مسجل"
        };
      }

      if (!user.password) {
        return {
          success: false,
          message: "كلمة المرور غير محددة لهذا الحساب"
        };
      }

      // فحص كلمة المرور
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: "كلمة المرور غير صحيحة"
        };
      }

      // إنشاء token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // حفظ الجلسة
      await this.createSession(user.id, token);

      // تحديث آخر تسجيل دخول
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

      return {
        success: true,
        message: "تم تسجيل الدخول بنجاح",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          isVerified: user.isVerified,
          isPremium: user.isPremium,
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

  // التحقق من صحة الـ token
  async verifyToken(token: string): Promise<{ valid: boolean; user?: Partial<User> }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // البحث عن المستخدم
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (!user) {
        return { valid: false };
      }

      return {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          isVerified: user.isVerified,
          isPremium: user.isPremium,
        }
      };
    } catch (error) {
      return { valid: false };
    }
  }

  // إنشاء جلسة جديدة
  private async createSession(userId: number, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // تنتهي بعد 7 أيام

    await db
      .insert(userSessions)
      .values({
        userId,
        sessionToken: token,
        expiresAt,
      });
  }

  // تسجيل الخروج
  async logoutUser(token: string): Promise<{ success: boolean }> {
    try {
      // حذف الجلسة
      await db
        .delete(userSessions)
        .where(eq(userSessions.sessionToken, token));

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  }

  // الحصول على معلومات المستخدم من الـ token
  async getUserFromToken(token: string): Promise<Partial<User> | null> {
    const verification = await this.verifyToken(token);
    return verification.valid ? verification.user || null : null;
  }
}

export const localAuthSystem = new LocalAuthSystem();