import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique(),
  username: text("username").unique(),
  password: text("password"), // for local authentication
  displayName: text("display_name"),
  profilePicture: text("profile_picture"),
  provider: text("provider").notNull(), // google, tiktok, local
  providerId: text("provider_id").unique(),
  isVerified: boolean("is_verified").default(false),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at").defaultNow(),
  preferences: text("preferences"), // JSON string for user preferences
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionToken: text("session_token").notNull().unique(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  repositoryUrl: text("repository_url").notNull(),
  branch: text("branch").notNull().default("main"),
  environment: text("environment").notNull().default("staging"),
  status: text("status").notNull().default("pending"), // pending, running, success, failed
  progress: integer("progress").notNull().default(0),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  logs: text("logs").array().default([]),
  commitHash: text("commit_hash"),
  duration: integer("duration"), // in seconds
  type: text("type").notNull().default("admin"), // admin, free
  userIdentifier: text("user_identifier"), // لتتبع المستخدمين المجانيين
});

export const freePublishAttempts = pgTable("free_publish_attempts", {
  id: serial("id").primaryKey(),
  userIdentifier: text("user_identifier").notNull(),
  videoUrl: text("video_url").notNull(),
  targetVideoUrl: text("target_video_url").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  verificationStatus: text("verification_status").notNull().default("pending"), // pending, verified, failed
  hasUsedFreePublish: boolean("has_used_free_publish").notNull().default(false),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: text("updated_by"),
});

export const publishingProcesses = pgTable("publishing_processes", {
  id: serial("id").primaryKey(),
  deploymentId: integer("deployment_id").references(() => deployments.id),
  videoUrl: text("video_url").notNull(),
  totalSites: integer("total_sites").default(0),
  completedSites: integer("completed_sites").default(0),
  successfulSites: integer("successful_sites").default(0),
  failedSites: integer("failed_sites").default(0),
  status: text("status").default("running"), // running, paused, stopped, completed
  currentSite: text("current_site"),
  postsPerSite: integer("posts_per_site").default(50),
  totalPosts: integer("total_posts").default(0),
  successfulPosts: integer("successful_posts").default(0),
  progress: integer("progress").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  details: text("details"), // JSON string with detailed progress
});



export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  displayName: true,
  profilePicture: true,
  provider: true,
  providerId: true,
  isVerified: true,
  isPremium: true,
  preferences: true,
});

export const loginUserSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export const registerUserSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  displayName: z.string().optional(),
});

export const insertDeploymentSchema = createInsertSchema(deployments).pick({
  repositoryUrl: true,
  branch: true,
  environment: true,
}).extend({
  repositoryUrl: z.string().url("Invalid repository URL"),
  branch: z.string().min(1, "Branch is required"),
  environment: z.enum(["staging", "production"], {
    required_error: "Environment must be staging or production",
  }),
});

export const insertPublishingProcessSchema = createInsertSchema(publishingProcesses).pick({
  deploymentId: true,
  videoUrl: true,
  totalSites: true,
  postsPerSite: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type Deployment = typeof deployments.$inferSelect;
export type InsertPublishingProcess = z.infer<typeof insertPublishingProcessSchema>;
export type PublishingProcess = typeof publishingProcesses.$inferSelect;
