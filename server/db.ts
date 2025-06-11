
import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// إعداد Supabase
const supabaseUrl = 'https://cgzkebjyimgqijmfqsmk.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnemtlYmp5aW1ncWlqbWZxc21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MDcwNDIsImV4cCI6MjA2NTA4MzA0Mn0.CGjYd4JX-SuRlAUHrKb75kGxvn7UFUtVRKJeA6DiEds';

export const supabase = createClient(supabaseUrl, supabaseKey);

// إعداد قاعدة البيانات للـ Drizzle ORM
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString, { 
  max: 1,
  ssl: 'require'
});

export const db = drizzle(client, { schema });
