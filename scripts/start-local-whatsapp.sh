#!/bin/bash

echo "🚀 بدء تشغيل نظام الواتساب المحلي"
echo "====================================="

echo "📁 التحقق من المجلدات..."
mkdir -p tokens
mkdir -p logs

echo "🔧 تحميل متغيرات البيئة..."
if [ -f ".env.local" ]; then
    echo "✅ ملف .env.local موجود"
else
    echo "❌ ملف .env.local غير موجود"
    echo "قم بإنشاء ملف .env.local أولاً"
    exit 1
fi

echo "🌐 بدء تشغيل الخادم المحلي..."
npm run dev:server &
SERVER_PID=$!

echo "⏳ انتظار 5 ثواني لتشغيل الخادم..."
sleep 5

echo "📱 بدء تشغيل Venom Bot..."
npm run whatsapp:local

echo "✅ تم تشغيل النظام بنجاح!"
echo "💡 يمكنك الآن استخدام النظام على Vercel مع الواتساب المحلي"

# إيقاف الخادم عند الانتهاء
kill $SERVER_PID 2>/dev/null