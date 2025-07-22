const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('🔧 إعدادات قاعدة البيانات للإنتاج:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[محدد]' : '[فارغ]');

// إعدادات قاعدة البيانات للإنتاج (Hostinger)
const dbConfig = {
  host: process.env.DB_HOST || '92.113.22.21',
  user: process.env.DB_USER || 'u723596365_HossamStudent',
  password: process.env.DB_PASSWORD || 'h?9a[ssGJrO',
  database: process.env.DB_NAME || 'u723596365_HossamStudent',
  port: parseInt(process.env.DB_PORT) || 3306,
  charset: 'utf8mb4',
  timezone: '+00:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  multipleStatements: true,
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: false,
  ssl: {
    rejectUnauthorized: false
  }
};

// إنشاء pool للاتصالات مع إعدادات محسنة للإنتاج
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  idleTimeout: 300000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// معالجة أحداث Pool
pool.on('connection', function (connection) {
  console.log('🔗 اتصال جديد بقاعدة البيانات Hostinger:', connection.threadId);
});

pool.on('error', function(err) {
  console.error('❌ خطأ في pool قاعدة البيانات:', err);
  if(err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 محاولة إعادة الاتصال...');
  } else {
    throw err;
  }
});

// اختبار الاتصال مع معالجة أخطاء Hostinger
async function testConnection() {
  try {
    console.log('🧪 اختبار الاتصال بقاعدة البيانات Hostinger...');
    const connection = await pool.getConnection();
    
    // اختبار استعلام بسيط
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as server_time');
    console.log('📊 نتيجة الاختبار:', rows);
    
    // اختبار الجداول الموجودة
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 الجداول الموجودة:', tables.length);
    
    console.log('✅ تم الاتصال بقاعدة البيانات Hostinger بنجاح');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات Hostinger:', error);
    console.error('تفاصيل الخطأ:', {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 نصيحة: تأكد من إنشاء قاعدة البيانات u723596365_HossamStudent في Hostinger');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 نصيحة: تأكد من صحة عنوان IP وإعدادات الشبكة في Hostinger');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 نصيحة: تحقق من اسم المستخدم وكلمة المرور في Hostinger');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 نصيحة: تحقق من عنوان الخادم 92.113.22.21');
    }
    
    return false;
  }
}

// دالة تنفيذ الاستعلامات مع معالجة أخطاء Hostinger
async function executeQuery(query, params = []) {
  try {
    console.log('🔍 تنفيذ الاستعلام:', query.substring(0, 100) + (query.length > 100 ? '...' : ''));
    console.log('📊 المعاملات:', params);
    
    const [results] = await pool.execute(query, params);
    
    if (Array.isArray(results)) {
      console.log('✅ نتائج الاستعلام: تم جلب', results.length, 'صف');
    } else {
      console.log('✅ نتائج الاستعلام:', results.affectedRows || 'تم التنفيذ');
    }
    
    return results;
  } catch (error) {
    console.error('❌ خطأ في تنفيذ الاستعلام:', error);
    console.error('📝 الاستعلام:', query.substring(0, 200) + (query.length > 200 ? '...' : ''));
    console.error('📊 المعاملات:', params);
    console.error('تفاصيل الخطأ:', {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
    
    throw error;
  }
}

// دالة تنفيذ المعاملات
async function executeTransaction(queries) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params || []);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  executeQuery,
  executeTransaction,
  testConnection
};