const fs = require('fs');
const path = require('path');

console.log('📋 قائمة التحقق من النشر\n');

const checks = [
  {
    name: 'ملف .env.production موجود',
    check: () => fs.existsSync('.env.production'),
    fix: 'قم بإنشاء ملف .env.production مع إعدادات Hostinger'
  },
  {
    name: 'ملف vercel.json موجود',
    check: () => fs.existsSync('vercel.json'),
    fix: 'قم بإنشاء ملف vercel.json'
  },
  {
    name: 'مجلد dist موجود',
    check: () => fs.existsSync('dist'),
    fix: 'قم بتشغيل: npm run build'
  },
  {
    name: 'مجلد tokens موجود',
    check: () => fs.existsSync('tokens'),
    fix: 'قم بإنشاء مجلد tokens: mkdir tokens'
  },
  {
    name: 'مجلد logs موجود',
    check: () => fs.existsSync('logs'),
    fix: 'قم بإنشاء مجلد logs: mkdir logs'
  },
  {
    name: 'venom-bot مثبت',
    check: () => {
      try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        return pkg.dependencies && pkg.dependencies['venom-bot'];
      } catch {
        return false;
      }
    },
    fix: 'قم بتثبيت venom-bot: npm install venom-bot'
  },
  {
    name: 'سكريبت إعداد Hostinger موجود',
    check: () => fs.existsSync('scripts/setup-hostinger-db.js'),
    fix: 'تم إنشاء السكريبت تلقائياً'
  },
  {
    name: 'سكريبت Venom المحلي موجود',
    check: () => fs.existsSync('scripts/venom-local-setup.js'),
    fix: 'تم إنشاء السكريبت تلقائياً'
  }
];

let allPassed = true;

checks.forEach((check, index) => {
  const passed = check.check();
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${index + 1}. ${check.name}`);
  
  if (!passed) {
    console.log(`   💡 الحل: ${check.fix}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 جميع الفحوصات نجحت! المشروع جاهز للنشر');
  console.log('\n📋 الخطوات التالية:');
  console.log('1. npm run db:setup:hostinger');
  console.log('2. npm run build');
  console.log('3. git add . && git commit -m "Ready for deployment"');
  console.log('4. git push origin main');
  console.log('5. نشر على Vercel من GitHub');
  console.log('6. npm run whatsapp:local (للواتساب المحلي)');
} else {
  console.log('⚠️ يجب إصلاح المشاكل أعلاه قبل النشر');
}

console.log('\n📞 للدعم الفني:');
console.log('📧 Sales@GO4Host.net');
console.log('📱 01272774494 - 01002246668');