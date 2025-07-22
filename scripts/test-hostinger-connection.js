const mysql = require('mysql2/promise');

async function testHostingerConnection() {
  const config = {
    host: '92.113.22.21',
    user: 'u723596365_HossamStudent',
    password: 'h?9a[ssGJrO',
    database: 'u723596365_HossamStudent',
    port: 3306,
    ssl: {
      rejectUnauthorized: false
    }
  };

  console.log('🧪 اختبار الاتصال بقاعدة البيانات Hostinger...');
  console.log('📍 الخادم:', config.host);
  console.log('👤 المستخدم:', config.user);
  console.log('🗄️ قاعدة البيانات:', config.database);

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ تم الاتصال بنجاح!');

    // اختبار استعلام بسيط
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as server_time, VERSION() as mysql_version');
    console.log('📊 نتيجة الاختبار:', rows[0]);

    // فحص الجداول الموجودة
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 عدد الجداول الموجودة: ${tables.length}`);
    
    if (tables.length > 0) {
      console.log('📝 الجداول الموجودة:');
      tables.forEach((table, index) => {
        console.log(`  ${index + 1}. ${Object.values(table)[0]}`);
      });
    } else {
      console.log('⚠️ لا توجد جداول - يجب تشغيل إعداد قاعدة البيانات');
    }

    // فحص المستخدمين إذا كان الجدول موجود
    try {
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`👥 عدد المستخدمين: ${users[0].count}`);
    } catch (error) {
      console.log('⚠️ جدول المستخدمين غير موجود');
    }

    await connection.end();
    console.log('🎉 اختبار الاتصال مكتمل بنجاح!');
    
  } catch (error) {
    console.error('❌ فشل الاتصال:', error.message);
    console.error('📋 تفاصيل الخطأ:');
    console.error('  - الكود:', error.code);
    console.error('  - errno:', error.errno);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 نصائح:');
      console.log('  - تحقق من عنوان IP: 92.113.22.21');
      console.log('  - تحقق من المنفذ: 3306');
      console.log('  - تأكد من تفعيل الاتصالات الخارجية في Hostinger');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 نصائح:');
      console.log('  - تحقق من اسم المستخدم: u723596365_HossamStudent');
      console.log('  - تحقق من كلمة المرور');
      console.log('  - تأكد من صلاحيات المستخدم في Hostinger');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 نصائح:');
      console.log('  - تحقق من اتصال الإنترنت');
      console.log('  - تحقق من عنوان الخادم');
    }
    
    process.exit(1);
  }
}

testHostingerConnection();