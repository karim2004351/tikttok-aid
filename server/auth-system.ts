import express from 'express';
import session from 'express-session';
import { db } from './db';
import { users, userSessions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

interface OAuthUser {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
  provider: 'google' | 'local';
}

export class AuthSystem {
  private app: express.Application;

  constructor(app: express.Application) {
    this.app = app;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(session({
      secret: process.env.SESSION_SECRET || 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }));
  }

  private setupRoutes() {
    // Google OAuth
    this.app.get('/api/auth/google', (req, res) => {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId) {
        return res.status(500).json({ error: 'Google OAuth not configured' });
      }

      const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
      const scope = 'openid email profile';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
      
      res.redirect(authUrl);
    });

    this.app.get('/api/auth/google/callback', async (req, res) => {
      try {
        const { code } = req.query;
        if (!code) {
          return res.redirect('/auth-login?error=no_code');
        }

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            code: code as string,
            grant_type: 'authorization_code',
            redirect_uri: `${req.protocol}://${req.get('host')}/api/auth/google/callback`,
          }),
        });

        const tokens = await tokenResponse.json();
        
        if (!tokens.access_token) {
          return res.redirect('/auth-login?error=token_error');
        }

        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });

        const googleUser = await userResponse.json();
        
        const user = await this.findOrCreateUser({
          id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          provider: 'google'
        });

        await this.createSession(user.id, req, tokens.access_token, tokens.refresh_token);
        res.redirect('/dashboard');
      } catch (error) {
        console.error('Google OAuth error:', error);
        res.redirect('/auth-login?error=oauth_failed');
      }
    });





    // User info endpoint
    this.app.get('/api/auth/user', async (req, res) => {
      try {
        const sessionToken = req.headers.authorization?.replace('Bearer ', '');
        if (!sessionToken) {
          return res.status(401).json({ error: 'No session token' });
        }

        const [session] = await db
          .select()
          .from(userSessions)
          .where(eq(userSessions.sessionToken, sessionToken))
          .limit(1);

        if (!session || new Date() > session.expiresAt) {
          return res.status(401).json({ error: 'Invalid or expired session' });
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, session.userId!))
          .limit(1);

        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }

        res.json({
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          profilePicture: user.profilePicture,
          provider: user.provider,
          isVerified: user.isVerified,
          isPremium: user.isPremium,
          createdAt: user.createdAt
        });
      } catch (error) {
        console.error('User info error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Logout endpoint
    this.app.post('/api/auth/logout', async (req, res) => {
      try {
        const sessionToken = req.headers.authorization?.replace('Bearer ', '');
        if (sessionToken) {
          await db
            .delete(userSessions)
            .where(eq(userSessions.sessionToken, sessionToken));
        }
        
        req.session.destroy(() => {
          res.json({ success: true });
        });
      } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }

  private async findOrCreateUser(oauthUser: OAuthUser) {
    try {
      // Try to find existing user
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.providerId, oauthUser.id))
        .limit(1);

      if (existingUser) {
        // Update last login
        await db
          .update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, existingUser.id));
        
        return existingUser;
      }

      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          email: oauthUser.email,
          username: oauthUser.email?.split('@')[0] || `user_${Date.now()}`,
          displayName: oauthUser.name,
          profilePicture: oauthUser.picture,
          provider: oauthUser.provider,
          providerId: oauthUser.id,
          isVerified: true,
          isPremium: false,
        })
        .returning();

      return newUser;
    } catch (error) {
      console.error('Error finding/creating user:', error);
      throw error;
    }
  }

  private async createSession(userId: number, req: any, accessToken?: string, refreshToken?: string) {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(userSessions).values({
      userId,
      sessionToken,
      accessToken,
      refreshToken,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Store session token in HTTP session
    (req.session as any).sessionToken = sessionToken;
    
    return sessionToken;
  }
}

export const setupAuth = (app: express.Application) => {
  return new AuthSystem(app);
};