// Vercel Serverless Function للـ API
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// استيراد إعدادات قاعدة البيانات للإنتاج
const { executeQuery, testConnection } = require('../server/config/database-production');

const app = express();

// Middleware
app.use(cors({
  origin: ['https://your-vercel-app.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// اختبار API
app.get('/api/test', (req, res) => {
  console.log('🧪 اختبار API على Vercel');
  res.json({ 
    success: true, 
    message: 'API يعمل بشكل صحيح على Vercel',
    timestamp: new Date().toISOString(),
    environment: 'production'
  });
});

// اختبار قاعدة البيانات
app.get('/api/db-test', async (req, res) => {
  try {
    console.log('🧪 اختبار قاعدة البيانات Hostinger...');
    const connected = await testConnection();
    
    if (connected) {
      const users = await executeQuery('SELECT COUNT(*) as count FROM users');
      res.json({
        success: true,
        message: 'قاعدة البيانات متصلة بنجاح',
        userCount: users[0].count
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'فشل الاتصال بقاعدة البيانات'
      });
    }
  } catch (error) {
    console.error('خطأ في اختبار قاعدة البيانات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في قاعدة البيانات',
      error: error.message
    });
  }
});

// استيراد routes الأساسية
const apiRoutes = require('../server/routes/api');
app.use('/api', apiRoutes);

// معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error('❌ خطأ في API:', err);
  res.status(500).json({ 
    success: false, 
    message: 'خطأ داخلي في الخادم',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// تصدير للـ Vercel
module.exports = app;