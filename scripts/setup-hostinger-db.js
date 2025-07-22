const mysql = require('mysql2/promise');
require('dotenv').config();

// إعدادات قاعدة البيانات Hostinger
const dbConfig = {
  host: '92.113.22.21',
  user: 'u723596365_HossamStudent',
  password: 'h?9a[ssGJrO',
  database: 'u723596365_HossamStudent',
  port: 3306,
  charset: 'utf8mb4',
  timezone: '+00:00',
  ssl: {
    rejectUnauthorized: false
  }
};

async function setupHostingerDatabase() {
  let connection;
  
  try {
    console.log('🔗 الاتصال بقاعدة البيانات Hostinger...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ تم الاتصال بنجاح!');
    
    // قراءة ملف SQL
    const fs = require('fs');
    const path = require('path');
    const sqlFile = path.join(__dirname, '../supabase/migrations/20250721201640_lucky_mud.sql');
    
    if (!fs.existsSync(sqlFile)) {
      throw new Error('ملف SQL غير موجود: ' + sqlFile);
    }
    
    let sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // إزالة أوامر إنشاء قاعدة البيانات (لأنها موجودة بالفعل في Hostinger)
    sqlContent = sqlContent.replace(/CREATE DATABASE.*?;/gi, '');
    sqlContent = sqlContent.replace(/USE attendance_system;/gi, '');
    
    // تقسيم الاستعلامات
    const queries = sqlContent
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--') && !query.startsWith('/*'));
    
    console.log(`📊 سيتم تنفيذ ${queries.length} استعلام...`);
    
    // تنفيذ الاستعلامات واحداً تلو الآخر
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      
      try {
        console.log(`⏳ تنفيذ الاستعلام ${i + 1}/${queries.length}...`);
        await connection.execute(query);
        console.log(`✅ تم تنفيذ الاستعلام ${i + 1} بنجاح`);
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  الاستعلام ${i + 1} موجود بالفعل، تخطي...`);
        } else {
          console.error(`❌ خطأ في الاستعلام ${i + 1}:`, error.message);
          console.log('الاستعلام:', query.substring(0, 100) + '...');
        }
      }
    }
    
    // التحقق من الجداول
    console.log('🔍 التحقق من الجداول...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 تم إنشاء ${tables.length} جدول:`);
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    // التحقق من البيانات
    console.log('📊 التحقق من البيانات...');
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [students] = await connection.execute('SELECT COUNT(*) as count FROM students');
    const [classes] = await connection.execute('SELECT COUNT(*) as count FROM classes');
    
    console.log(`👥 المستخدمين: ${users[0].count}`);
    console.log(`🎓 الطلاب: ${students[0].count}`);
    console.log(`📚 الفصول: ${classes[0].count}`);
    
    console.log('🎉 تم إعداد قاعدة البيانات Hostinger بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في إعداد قاعدة البيانات:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 تحقق من عنوان IP والمنفذ');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 تحقق من اسم المستخدم وكلمة المرور');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 تحقق من عنوان الخادم');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 تم إغلاق الاتصال');
    }
  }
}

// تشغيل الإعداد
setupHostingerDatabase();