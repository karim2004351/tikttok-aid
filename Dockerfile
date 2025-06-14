# المرحلة 1: البناء
FROM node:20 AS builder

# إعداد مجلد العمل
WORKDIR /app

# نسخ ملفات التعريف أولًا لتقليل إعادة التثبيت
COPY package*.json ./
COPY tsconfig*.json ./

# تثبيت التبعيات
RUN npm install

# نسخ بقية المشروع
COPY . .

# تشغيل البناء الكامل (واجهة + خادم)
RUN npm run build

# المرحلة 2: التشغيل الفعلي
FROM node:20 AS runner

# إعداد مجلد العمل
WORKDIR /app

# نسخ فقط الملفات اللازمة للتشغيل
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# تثبيت التبعيات فقط للإنتاج
RUN npm install --omit=dev

# إعداد متغير البيئة بشكل افتراضي
ENV NODE_ENV=production

# فتح المنفذ
EXPOSE 3000

# تشغيل الخادم
CMD ["node", "dist/server/index.js"]
