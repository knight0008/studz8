const fs = require('fs');
const path = require('path');

console.log('🔧 إصلاح إعدادات Vercel للنشر...');

// إنشاء ملف vercel.json مبسط
const vercelConfig = {
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
};

try {
  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  console.log('✅ تم إنشاء ملف vercel.json مبسط');
} catch (error) {
  console.error('❌ خطأ في إنشاء ملف vercel.json:', error);
}

// التحقق من package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (!packageJson.scripts.build) {
    console.log('⚠️ سكريبت build غير موجود');
  } else {
    console.log('✅ سكريبت build موجود:', packageJson.scripts.build);
  }
  
  // التأكد من وجود vite
  if (!packageJson.devDependencies.vite && !packageJson.dependencies.vite) {
    console.log('⚠️ Vite غير مثبت');
  } else {
    console.log('✅ Vite مثبت');
  }
  
} catch (error) {
  console.error('❌ خطأ في قراءة package.json:', error);
}

// إنشاء ملف .vercelignore
const vercelIgnore = `
# Dependencies
node_modules/
npm-debug.log*

# Environment files
.env
.env.local
.env.development
.env.test

# Database
database/
*.sql

# WhatsApp tokens
tokens/
logs/

# Development files
server/
scripts/
docs/
*.md
!README.md

# OS generated files
.DS_Store
Thumbs.db
`;

try {
  fs.writeFileSync('.vercelignore', vercelIgnore.trim());
  console.log('✅ تم إنشاء ملف .vercelignore');
} catch (error) {
  console.error('❌ خطأ في إنشاء .vercelignore:', error);
}

console.log('\n📋 الخطوات التالية:');
console.log('1. npm run build (للتأكد من البناء)');
console.log('2. git add .');
console.log('3. git commit -m "Fix Vercel deployment config"');
console.log('4. git push origin main');
console.log('5. أعد النشر على Vercel');

console.log('\n💡 نصائح للنشر على Vercel:');
console.log('- استخدم Framework Preset: Vite');
console.log('- Build Command: npm run build');
console.log('- Output Directory: dist');
console.log('- Install Command: npm install');
console.log('- Root Directory: اتركه فارغ');