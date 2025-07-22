const venom = require('venom-bot');
const { executeQuery } = require('../config/database');
const path = require('path');

class WhatsAppLocalService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.isInitializing = false;
    this.qrCode = null;
    this.connectionRetries = 0;
    this.maxRetries = 3;
    this.lastActivity = Date.now();
  }

  async initialize() {
    if (this.isInitializing) {
      console.log('⏳ Venom Bot قيد التهيئة بالفعل...');
      return { success: false, message: 'جاري التهيئة بالفعل...' };
    }

    if (this.isConnected && this.client) {
      console.log('✅ Venom Bot متصل بالفعل');
      return { success: true, message: 'Venom Bot متصل بالفعل' };
    }

    this.isInitializing = true;

    try {
      console.log('🚀 بدء تهيئة Venom Bot المحلي...');
      
      await this.cleanup();
      
      this.client = await venom.create(
        'attendance-system-local',
        (base64Qr, asciiQR, attempts, urlCode) => {
          console.log(`📱 QR Code جديد - المحاولة: ${attempts}`);
          console.log('🔗 URL Code:', urlCode);
          console.log('\n' + asciiQR + '\n');
          this.qrCode = base64Qr;
          
          console.log('\n📋 خطوات المسح:');
          console.log('1. افتح واتساب على هاتفك');
          console.log('2. اذهب إلى: الإعدادات > الأجهزة المرتبطة');
          console.log('3. اضغط على "ربط جهاز"');
          console.log('4. امسح QR Code أعلاه');
          console.log('5. انتظر رسالة التأكيد\n');
        },
        (statusSession, session) => {
          console.log(`📊 تغيير حالة الجلسة: ${statusSession}`);
          
          switch (statusSession) {
            case 'isLogged':
            case 'qrReadSuccess':
            case 'chatsAvailable':
              this.isConnected = true;
              this.isInitializing = false;
              this.connectionRetries = 0;
              this.lastActivity = Date.now();
              console.log('✅ تم الاتصال بـ Venom Bot بنجاح!');
              break;
            case 'notLogged':
              this.isConnected = false;
              console.log('❌ لم يتم تسجيل الدخول');
              break;
            case 'browserClose':
              this.isConnected = false;
              console.log('🔒 تم إغلاق المتصفح');
              break;
          }
        },
        {
          folderNameToken: './tokens',
          mkdirFolderToken: '',
          headless: 'new',
          devtools: false,
          useChrome: true,
          debug: false,
          logQR: true,
          puppeteerOptions: {
            headless: 'new',
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--no-first-run',
              '--no-zygote',
              '--single-process',
              '--disable-gpu',
              '--disable-web-security',
              '--disable-features=VizDisplayCompositor',
              '--memory-pressure-off',
              '--max_old_space_size=4096'
            ],
            executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            defaultViewport: null,
            ignoreHTTPSErrors: true,
            slowMo: 0
          },
          autoClose: 0,
          createPathFileToken: true,
          waitForLogin: true,
          disableSpins: true,
          disableWelcome: true,
          timeout: 120000
        }
      );
      
      if (this.client) {
        this.setupEventHandlers();
        
        const timeout = 120000;
        const startTime = Date.now();
        
        while (!this.isConnected && (Date.now() - startTime) < timeout && this.isInitializing) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (this.isConnected) {
          console.log('🎉 تم تهيئة Venom Bot المحلي بنجاح!');
          return { success: true, message: 'تم تهيئة Venom Bot بنجاح!' };
        } else {
          this.isInitializing = false;
          return { success: false, message: 'انتهت المهلة الزمنية للاتصال' };
        }
      }
      
      this.isInitializing = false;
      return { success: false, message: 'فشل في إنشاء جلسة Venom Bot' };
      
    } catch (error) {
      console.error('❌ خطأ في تهيئة Venom Bot:', error);
      this.isInitializing = false;
      this.isConnected = false;
      
      if (this.connectionRetries < this.maxRetries) {
        this.connectionRetries++;
        console.log(`🔄 إعادة المحاولة ${this.connectionRetries}/${this.maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return this.initialize();
      }
      
      return { 
        success: false, 
        message: `خطأ في تهيئة Venom Bot: ${error.message}` 
      };
    }
  }

  setupEventHandlers() {
    if (!this.client) return;

    try {
      this.client.onMessage(async (message) => {
        this.lastActivity = Date.now();
        console.log('📨 رسالة واردة:', message.from);
      });

      this.client.onStateChange((state) => {
        console.log('🔄 تغيير حالة الاتصال:', state);
        this.lastActivity = Date.now();
      });
    } catch (error) {
      console.error('❌ خطأ في إعداد معالجات الأحداث:', error);
    }
  }

  async sendMessage(phoneNumber, message) {
    if (!this.isConnected || !this.client) {
      throw new Error('Venom Bot غير متصل. يرجى التهيئة أولاً.');
    }

    try {
      const state = await this.client.getConnectionState();
      if (state !== 'CONNECTED') {
        throw new Error('الاتصال غير مستقر. يرجى إعادة التهيئة.');
      }

      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      console.log(`📤 إرسال رسالة إلى ${formattedNumber}`);
      
      const result = await this.client.sendText(formattedNumber, message);
      console.log('✅ تم إرسال الرسالة بنجاح:', result.id);
      
      this.lastActivity = Date.now();
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return {
        success: true,
        messageId: result.id,
        timestamp: new Date()
      };
      
    } catch (error) {
      console.error('❌ خطأ في إرسال الرسالة:', error);
      throw error;
    }
  }

  async sendSessionReport(sessionId) {
    try {
      console.log('📊 بدء إرسال تقرير الجلسة المحلي:', sessionId);
      
      if (!this.isConnected || !this.client) {
        throw new Error('Venom Bot غير متصل. يرجى التهيئة أولاً.');
      }

      // الحصول على بيانات الجلسة
      const sessionQuery = `
        SELECT s.*, c.name as class_name, t.name as teacher_name, 
               sub.name as subject_name, l.name as location_name
        FROM sessions s
        JOIN classes c ON s.class_id = c.id
        LEFT JOIN teachers t ON c.teacher_id = t.id
        LEFT JOIN subjects sub ON c.subject_id = sub.id
        LEFT JOIN locations l ON s.location_id = l.id
        WHERE s.id = ?
      `;
      
      const sessionResults = await executeQuery(sessionQuery, [sessionId]);
      if (sessionResults.length === 0) {
        throw new Error('الجلسة غير موجودة');
      }
      
      const session = sessionResults[0];
      
      // الحصول على طلاب الفصل مع حالة الحضور والتقارير
      const studentsQuery = `
        SELECT s.id, s.name, s.parent_phone, s.barcode,
               a.status as attendance_status,
               r.teacher_rating, r.quiz_score, r.participation, 
               r.behavior, r.homework, r.comments
        FROM students s
        LEFT JOIN attendance a ON s.id = a.student_id AND a.session_id = ?
        LEFT JOIN reports r ON s.id = r.student_id AND r.session_id = ?
        WHERE s.class_id = ? AND s.is_active = TRUE AND s.parent_phone IS NOT NULL AND s.parent_phone != ''
        ORDER BY s.name
      `;
      
      const students = await executeQuery(studentsQuery, [sessionId, sessionId, session.class_id]);
      console.log(`👥 عدد الطلاب المؤهلين للإرسال: ${students.length}`);
      
      const results = [];
      const sessionDate = new Date(session.start_time).toLocaleDateString('en-GB');
      const sessionTime = new Date(session.start_time).toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      let sentCount = 0;
      let failedCount = 0;
      
      for (const student of students) {
        console.log(`📱 معالجة الطالب: ${student.name} - ${student.parent_phone}`);
        
        let message = '';
        let messageType = '';
        
        const hasAttendance = student.attendance_status && student.attendance_status !== 'absent';
        const hasReport = student.teacher_rating && student.participation;
        
        if (!hasAttendance) {
          message = `🔔 تنبيه غياب\n\nعزيزي ولي الأمر،\n\nنود إعلامكم بأن الطالب/ة: ${student.name}\nتغيب عن حصة اليوم\n\n📚 تفاصيل الحصة:\n• المادة: ${session.subject_name || 'غير محدد'}\n• الفصل: ${session.class_name}\n• المعلم: ${session.teacher_name || 'غير محدد'}\n• التاريخ: ${sessionDate}\n• الوقت: ${sessionTime}${session.location_name ? `\n• المكان: ${session.location_name}` : ''}\n\nنرجو المتابعة والتواصل مع إدارة المدرسة.\n\n📚 نظام إدارة الحضور المحلي`;
          messageType = 'absence';
        } else if (hasAttendance && hasReport) {
          message = `📊 تقرير أداء الطالب\n\nعزيزي ولي الأمر،\n\nتقرير أداء الطالب/ة: ${student.name}\nالجلسة: ${session.subject_name || 'غير محدد'}\nالفصل: ${session.class_name}\nالمعلم: ${session.teacher_name || 'غير محدد'}\nالتاريخ: ${sessionDate}\n\n📈 التقييم:\n⭐ تقييم المعلم: ${student.teacher_rating}/5\n🙋 المشاركة: ${student.participation}/5\n😊 السلوك: ${student.behavior || 'غير محدد'}\n📝 الواجب: ${student.homework === 'completed' ? 'مكتمل ✅' : student.homework === 'incomplete' ? 'غير مكتمل ❌' : 'جزئي ⚠️'}`;
          
          if (student.quiz_score) {
            message += `\n📋 درجة الاختبار: ${student.quiz_score}%`;
          }
          
          if (student.comments) {
            message += `\n\n💬 ملاحظات المعلم:\n${student.comments}`;
          }
          
          message += `\n\n📚 نظام إدارة الحضور المحلي\nشكراً لمتابعتكم 🌟`;
          messageType = 'performance';
        } else if (hasAttendance) {
          message = `✅ تأكيد حضور\n\nعزيزي ولي الأمر،\n\nنود إعلامكم بحضور الطالب/ة: ${student.name}\nفي حصة اليوم\n\n📚 تفاصيل الحصة:\n• المادة: ${session.subject_name || 'غير محدد'}\n• الفصل: ${session.class_name}\n• المعلم: ${session.teacher_name || 'غير محدد'}\n• التاريخ: ${sessionDate}\n• الوقت: ${sessionTime}${session.location_name ? `\n• المكان: ${session.location_name}` : ''}\n\n📚 نظام إدارة الحضور المحلي`;
          messageType = 'attendance';
        } else {
          console.log(`⏭️ تخطي الطالب ${student.name} - لا توجد بيانات كافية`);
          continue;
        }
        
        try {
          console.log(`📤 إرسال رسالة ${messageType} للطالب: ${student.name}`);
          const result = await this.sendMessage(student.parent_phone, message);
          
          // تسجيل الرسالة في قاعدة البيانات
          await executeQuery(
            'INSERT INTO whatsapp_logs (student_id, session_id, message_type, message, phone_number, status) VALUES (?, ?, ?, ?, ?, ?)',
            [student.id, sessionId, messageType, message, student.parent_phone, 'sent']
          );
          
          sentCount++;
          results.push({
            studentId: student.id,
            studentName: student.name,
            phoneNumber: student.parent_phone,
            success: true,
            messageId: result.messageId,
            messageType
          });
          
          console.log(`✅ تم إرسال الرسالة بنجاح للطالب: ${student.name}`);
          
        } catch (error) {
          console.error(`❌ خطأ في إرسال رسالة للطالب ${student.name}:`, error);
          
          await executeQuery(
            'INSERT INTO whatsapp_logs (student_id, session_id, message_type, message, phone_number, status, error_message) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [student.id, sessionId, messageType, message, student.parent_phone, 'failed', error.message]
          );
          
          failedCount++;
          results.push({
            studentId: student.id,
            studentName: student.name,
            phoneNumber: student.parent_phone,
            success: false,
            error: error.message,
            messageType
          });
        }
      }
      
      console.log(`📊 ملخص الإرسال المحلي: ${sentCount} نجح، ${failedCount} فشل من أصل ${students.length} طالب`);
      
      return {
        success: true,
        totalStudents: students.length,
        sentMessages: sentCount,
        failedMessages: failedCount,
        results
      };
      
    } catch (error) {
      console.error('❌ خطأ في إرسال تقرير الجلسة المحلي:', error);
      throw error;
    }
  }

  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) {
      throw new Error('رقم الهاتف مطلوب');
    }
    
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length < 10) {
      throw new Error('رقم الهاتف قصير جداً');
    }
    
    if (cleaned.startsWith('20')) {
      if (!cleaned.match(/^20[0-9]{9,10}$/)) {
        throw new Error('رقم الهاتف المصري غير صحيح');
      }
    } else if (cleaned.startsWith('966')) {
      if (!cleaned.match(/^966[5][0-9]{8}$/)) {
        throw new Error('رقم الهاتف السعودي غير صحيح');
      }
    } else {
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }
      
      if (cleaned.startsWith('5') && cleaned.length === 9) {
        cleaned = '966' + cleaned;
      } else if (cleaned.startsWith('1') && cleaned.length >= 9) {
        cleaned = '20' + cleaned;
      }
    }
    
    return cleaned + '@c.us';
  }

  async cleanup() {
    try {
      if (this.client) {
        console.log('🧹 تنظيف الاتصال السابق...');
        try {
          await this.client.close();
        } catch (error) {
          console.log('⚠️ خطأ في إغلاق الاتصال السابق:', error.message);
        }
        this.client = null;
      }
      
      this.isConnected = false;
      this.isInitializing = false;
      this.connectionRetries = 0;
      this.qrCode = null;
      
    } catch (error) {
      console.error('❌ خطأ في تنظيف الاتصال:', error);
    }
  }

  getConnectionStatus() {
    return this.isConnected && this.client !== null;
  }

  getQRCode() {
    return this.qrCode;
  }

  async validateConnection() {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const state = await this.client.getConnectionState();
      return state === 'CONNECTED';
    } catch (error) {
      console.error('❌ خطأ في التحقق من صحة الاتصال:', error);
      return false;
    }
  }
}

// إنشاء instance واحد للاستخدام المحلي
const whatsappLocalService = new WhatsAppLocalService();

module.exports = whatsappLocalService;