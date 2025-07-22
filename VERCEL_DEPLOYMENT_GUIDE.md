# 🚀 دليل نشر المشروع على Vercel مع Hostinger MySQL

## 📋 المتطلبات الأساسية

### 1. حسابات مطلوبة:
- ✅ حساب Vercel (مجاني)
- ✅ حساب Hostinger مع قاعدة بيانات MySQL
- ✅ حساب GitHub (لربط المشروع)

### 2. أدوات مطلوبة:
- ✅ Node.js (الإصدار 16 أو أحدث)
- ✅ Git
- ✅ Google Chrome (للـ Venom Bot المحلي)

## 🗄️ الخطوة 1: إعداد قاعدة البيانات Hostinger

### 1.1 تسجيل الدخول إلى Hostinger
1. اذهب إلى [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. سجل الدخول بحسابك
3. اذهب إلى قسم "Databases" أو "قواعد البيانات"

### 1.2 التحقق من إعدادات قاعدة البيانات
تأكد من أن البيانات التالية صحيحة:
```
Host: 92.113.22.21
Username: u723596365_HossamStudent
Password: h?9a[ssGJrO
Database: u723596365_HossamStudent
Port: 3306
```

### 1.3 إعداد قاعدة البيانات
```bash
# في مجلد المشروع، قم بتشغيل:
npm run db:setup:hostinger
```

هذا الأمر سيقوم بـ:
- ✅ الاتصال بقاعدة البيانات Hostinger
- ✅ إنشاء جميع الجداول المطلوبة
- ✅ إدراج البيانات التجريبية
- ✅ التحقق من صحة الإعداد

## 📁 الخطوة 2: إعداد المشروع للنشر

### 2.1 تحديث متغيرات البيئة
تم إنشاء ملفات البيئة التالية:
- `.env.production` - للإنتاج على Vercel
- `.env.local` - للتطوير المحلي

### 2.2 بناء المشروع
```bash
# بناء المشروع للإنتاج
npm run build

# اختبار البناء محلياً
npm run preview
```

## 🌐 الخطوة 3: رفع المشروع على GitHub

### 3.1 إنشاء مستودع GitHub جديد
1. اذهب إلى [github.com](https://github.com)
2. اضغط على "New repository"
3. اختر اسم للمستودع (مثل: `attendance-system`)
4. اجعله عام أو خاص حسب رغبتك
5. اضغط "Create repository"

### 3.2 رفع الكود
```bash
# في مجلد المشروع
git init
git add .
git commit -m "Initial commit - Attendance System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/attendance-system.git
git push -u origin main
```

## 🚀 الخطوة 4: النشر على Vercel

### 4.1 إنشاء حساب Vercel
1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل الدخول باستخدام GitHub
3. اربط حسابك مع GitHub

### 4.2 استيراد المشروع
1. في لوحة تحكم Vercel، اضغط "New Project"
2. اختر مستودع `attendance-system` من GitHub
3. اضغط "Import"

### 4.3 إعداد متغيرات البيئة في Vercel
في صفحة إعدادات المشروع، اذهب إلى "Environment Variables" وأضف:

```
NODE_ENV=production
DB_HOST=92.113.22.21
DB_USER=u723596365_HossamStudent
DB_PASSWORD=h?9a[ssGJrO
DB_NAME=u723596365_HossamStudent
DB_PORT=3306
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
```

### 4.4 إعدادات البناء
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Root Directory**: `./` (اتركه فارغ)

### 4.5 النشر
1. اضغط "Deploy"
2. انتظر حتى يكتمل البناء (عادة 2-5 دقائق)
3. ستحصل على رابط التطبيق (مثل: `https://attendance-system.vercel.app`)

## 📱 الخطوة 5: إعداد Venom Bot المحلي

### 5.1 تثبيت المتطلبات المحلية
```bash
# تأكد من تثبيت venom-bot
npm install venom-bot

# تأكد من وجود Google Chrome
# Windows: تحميل من الموقع الرسمي
# Linux: sudo apt install google-chrome-stable
```

### 5.2 إعداد Venom Bot
```bash
# تشغيل إعداد Venom Bot المحلي
npm run whatsapp:local
```

### 5.3 ربط الواتساب
1. ستظهر QR Code في Terminal
2. افتح واتساب على هاتفك
3. اذهب إلى: الإعدادات > الأجهزة المرتبطة > ربط جهاز
4. امسح QR Code
5. انتظر رسالة "تم الاتصال بنجاح"

## 🔧 الخطوة 6: ربط النظام المحلي بـ Vercel

### 6.1 تحديث إعدادات API
في ملف `.env.local`، حدث الرابط:
```env
VITE_API_URL=https://your-vercel-app.vercel.app/api
```

### 6.2 تشغيل النظام المحلي
```bash
# تشغيل الخادم المحلي للواتساب فقط
npm run dev:server

# في terminal آخر، تشغيل الواجهة الأمامية
npm run dev
```

## 🧪 الخطوة 7: اختبار النظام

### 7.1 اختبار الواجهة الأمامية
1. افتح `https://your-vercel-app.vercel.app`
2. سجل الدخول بـ:
   - اسم المستخدم: `admin`
   - كلمة المرور: `admin123`

### 7.2 اختبار قاعدة البيانات
1. تحقق من عرض البيانات (الطلاب، الفصول، إلخ)
2. جرب إضافة طالب جديد
3. جرب إنشاء جلسة جديدة

### 7.3 اختبار Venom Bot
1. اذهب إلى "إدارة الواتساب"
2. تأكد من ظهور "متصل" في حالة الاتصال
3. جرب إرسال رسالة اختبار

## 🔄 الخطوة 8: سير العمل المتكامل

### 8.1 الاستخدام اليومي
1. **الواجهة الأمامية**: استخدم الرابط على Vercel
2. **قاعدة البيانات**: تعمل على Hostinger تلقائياً
3. **الواتساب**: يعمل من جهازك المحلي

### 8.2 إرسال التقارير
1. في النظام على Vercel، اذهب إلى "إدارة الجلسات"
2. اختر الجلسة المطلوبة
3. اضغط "إرسال تقرير الجلسة كاملاً"
4. سيتم الإرسال من جهازك المحلي

## 🛠️ استكشاف الأخطاء وحلها

### مشكلة: خطأ في قاعدة البيانات
```bash
# اختبار الاتصال بـ Hostinger
node -e "
const mysql = require('mysql2/promise');
mysql.createConnection({
  host: '92.113.22.21',
  user: 'u723596365_HossamStudent',
  password: 'h?9a[ssGJrO',
  database: 'u723596365_HossamStudent'
}).then(() => console.log('✅ اتصال ناجح')).catch(console.error);
"
```

### مشكلة: Venom Bot لا يتصل
```bash
# تنظيف ملفات التوكن
npm run whatsapp:clean

# إعادة تشغيل الإعداد
npm run whatsapp:local
```

### مشكلة: خطأ في النشر على Vercel
1. تحقق من متغيرات البيئة في Vercel
2. تحقق من سجلات البناء (Build Logs)
3. تأكد من صحة ملف `vercel.json`

## 📊 مراقبة النظام

### 1. مراقبة Vercel
- لوحة تحكم Vercel: مراقبة الأداء والأخطاء
- Analytics: إحصائيات الاستخدام

### 2. مراقبة Hostinger
- cPanel: مراقبة استخدام قاعدة البيانات
- Logs: سجلات الأخطاء

### 3. مراقبة Venom Bot المحلي
- Terminal: سجلات الاتصال والرسائل
- ملف `logs/venom-errors.json`: سجل الأخطاء

## 🔐 الأمان والنسخ الاحتياطي

### 1. النسخ الاحتياطي
```bash
# نسخ احتياطي لقاعدة البيانات
mysqldump -h 92.113.22.21 -u u723596365_HossamStudent -p u723596365_HossamStudent > backup_$(date +%Y%m%d).sql

# نسخ احتياطي لملفات Venom
tar -czf venom_backup_$(date +%Y%m%d).tar.gz tokens/ logs/
```

### 2. الأمان
- ✅ تغيير كلمات المرور الافتراضية
- ✅ استخدام HTTPS فقط
- ✅ مراقبة سجلات الدخول
- ✅ تحديث المكتبات بانتظام

## 🎯 الخطوات التالية

### 1. تخصيص النظام
- تحديث اسم المدرسة في الإعدادات
- إضافة شعار المدرسة
- تخصيص قوالب الرسائل

### 2. التدريب
- تدريب المستخدمين على النظام
- إنشاء دليل المستخدم
- إعداد جلسات تدريبية

### 3. الصيانة
- مراقبة الأداء يومياً
- نسخ احتياطية أسبوعية
- تحديثات شهرية

---

## 🎉 تهانينا!

تم إعداد نظام إدارة الحضور بنجاح مع:
- ✅ واجهة أمامية على Vercel
- ✅ قاعدة بيانات على Hostinger
- ✅ Venom Bot محلي للواتساب
- ✅ تكامل كامل بين جميع المكونات

**روابط مهمة:**
- التطبيق: `https://your-vercel-app.vercel.app`
- قاعدة البيانات: Hostinger cPanel
- الواتساب: جهازك المحلي

**بيانات الدخول:**
- المدير: `admin` / `admin123`
- المشرف 1: `supervisor1` / `admin123`
- المشرف 2: `supervisor2` / `admin123`