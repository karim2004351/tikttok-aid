# المرحلة 1: البناء
FROM node:20 AS builder

# إعداد مجلد العمل
WORKDIR /app

# نسخ الملفات وتعريف البنية
COPY package*.json ./
COPY tsconfig*.json ./
COPY . .

# تثبيت التبعيات
RUN npm install

# تشغيل البناء
RUN npm run build

# المرحلة 2: التشغيل
FROM node:20 AS runner

WORKDIR /app

# نسخ ملفات البناء من المرحلة الأولى
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# تثبيت التبعيات فقط للإنتاج
RUN npm install --omit=dev

# تشغيل الخادم (عدّل هذا حسب المسار الحقيقي للملف)
CMD ["node", "dist/server/index.js"]
