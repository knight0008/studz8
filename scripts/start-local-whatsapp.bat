@echo off
echo 🚀 بدء تشغيل نظام الواتساب المحلي
echo =====================================

echo 📁 التحقق من المجلدات...
if not exist "tokens" mkdir tokens
if not exist "logs" mkdir logs

echo 🔧 تحميل متغيرات البيئة...
if exist ".env.local" (
    echo ✅ ملف .env.local موجود
) else (
    echo ❌ ملف .env.local غير موجود
    echo قم بإنشاء ملف .env.local أولاً
    pause
    exit /b 1
)

echo 🌐 بدء تشغيل الخادم المحلي...
start cmd /k "npm run dev:server"

echo ⏳ انتظار 5 ثواني لتشغيل الخادم...
timeout /t 5 /nobreak

echo 📱 بدء تشغيل Venom Bot...
npm run whatsapp:local

echo ✅ تم تشغيل النظام بنجاح!
echo 💡 يمكنك الآن استخدام النظام على Vercel مع الواتساب المحلي
pause