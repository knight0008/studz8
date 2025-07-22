const venom = require('venom-bot');
const fs = require('fs-extra');
const path = require('path');

class VenomLocalSetup {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.qrCodeCount = 0;
    this.maxQRAttempts = 5;
  }

  async initialize() {
    try {
      console.log('🚀 بدء إعداد Venom Bot المحلي...');
      
      // التأكد من وجود المجلدات
      await this.ensureDirectories();
      
      // تنظيف الجلسات القديمة إذا لزم الأمر
      await this.cleanOldSessions();
      
      const config = {
        session: 'attendance-system-local',
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
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
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
      };
      
      this.client = await venom.create(
        config.session,
        this.onQRCode.bind(this),
        this.onStatusChange.bind(this),
        config
      );
      
      if (this.client) {
        console.log('✅ تم إعداد Venom Bot بنجاح!');
        await this.setupEventHandlers();
        await this.testConnection();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ خطأ في إعداد Venom Bot:', error);
      await this.handleError(error);
      return false;
    }
  }

  async ensureDirectories() {
    const dirs = ['./tokens', './logs'];
    for (const dir of dirs) {
      await fs.ensureDir(dir);
      console.log(`📁 تم التأكد من وجود المجلد: ${dir}`);
    }
  }

  async cleanOldSessions() {
    const tokenPath = path.join('./tokens', 'attendance-system-local');
    if (await fs.pathExists(tokenPath)) {
      const stats = await fs.stat(tokenPath);
      const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceModified > 7) {
        console.log('🧹 تنظيف الجلسة القديمة...');
        await fs.remove(tokenPath);
      }
    }
  }

  onQRCode(base64Qr, asciiQR, attempts, urlCode) {
    this.qrCodeCount = attempts;
    console.log('\n📱 QR Code جديد - المحاولة:', attempts);
    console.log('🔗 URL Code:', urlCode);
    console.log('\n' + asciiQR + '\n');
    
    // حفظ QR Code كصورة
    this.saveQRCode(base64Qr, attempts);
    
    if (attempts >= this.maxQRAttempts) {
      console.log('⚠️  تم الوصول للحد الأقصى من محاولات QR Code');
    }
    
    console.log('\n📋 خطوات المسح:');
    console.log('1. افتح واتساب على هاتفك');
    console.log('2. اذهب إلى: الإعدادات > الأجهزة المرتبطة');
    console.log('3. اضغط على "ربط جهاز"');
    console.log('4. امسح QR Code أعلاه');
    console.log('5. انتظر رسالة التأكيد\n');
  }

  async saveQRCode(base64Qr, attempts) {
    try {
      const qrPath = path.join('./logs', `qr-code-local-${attempts}.png`);
      const base64Data = base64Qr.replace(/^data:image\/png;base64,/, '');
      await fs.writeFile(qrPath, base64Data, 'base64');
      console.log(`💾 تم حفظ QR Code في: ${qrPath}`);
    } catch (error) {
      console.error('❌ خطأ في حفظ QR Code:', error);
    }
  }

  onStatusChange(statusSession, session) {
    console.log('\n📊 تغيير حالة الجلسة:');
    console.log('🔄 الحالة:', statusSession);
    console.log('📱 الجلسة:', session);
    
    switch (statusSession) {
      case 'isLogged':
        this.isConnected = true;
        console.log('✅ تم تسجيل الدخول بنجاح!');
        break;
      case 'notLogged':
        this.isConnected = false;
        console.log('❌ لم يتم تسجيل الدخول');
        break;
      case 'browserClose':
        console.log('🔒 تم إغلاق المتصفح');
        break;
      case 'qrReadSuccess':
        console.log('✅ تم مسح QR Code بنجاح!');
        break;
      case 'qrReadFail':
        console.log('❌ فشل في مسح QR Code');
        break;
      default:
        console.log('ℹ️  حالة غير معروفة:', statusSession);
    }
  }

  async setupEventHandlers() {
    if (!this.client) return;

    this.client.onMessage(async (message) => {
      console.log('📨 رسالة واردة:', message.from, message.body);
    });

    this.client.onStateChange((state) => {
      console.log('🔄 تغيير حالة الاتصال:', state);
    });
  }

  async testConnection() {
    try {
      console.log('\n🧪 اختبار الاتصال...');
      
      const hostDevice = await this.client.getHostDevice();
      console.log('📱 معلومات الجهاز:', hostDevice);
      
      const connectionState = await this.client.getConnectionState();
      console.log('🔗 حالة الاتصال:', connectionState);
      
      console.log('✅ اختبار الاتصال مكتمل!');
    } catch (error) {
      console.error('❌ خطأ في اختبار الاتصال:', error);
    }
  }

  async handleError(error) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    };
    
    const logPath = path.join('./logs', 'venom-errors.json');
    let errors = [];
    
    try {
      if (await fs.pathExists(logPath)) {
        errors = await fs.readJson(logPath);
      }
    } catch (e) {
      console.error('خطأ في قراءة ملف الأخطاء:', e);
    }
    
    errors.push(errorLog);
    
    try {
      await fs.writeJson(logPath, errors, { spaces: 2 });
      console.log(`📝 تم تسجيل الخطأ في: ${logPath}`);
    } catch (e) {
      console.error('خطأ في كتابة ملف الأخطاء:', e);
    }
  }

  async sendTestMessage(phoneNumber, message) {
    if (!this.isConnected || !this.client) {
      throw new Error('Venom Bot غير متصل');
    }

    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const result = await this.client.sendText(formattedNumber, message);
      console.log('✅ تم إرسال رسالة الاختبار:', result.id);
      return { success: true, messageId: result.id };
    } catch (error) {
      console.error('❌ خطأ في إرسال رسالة الاختبار:', error);
      return { success: false, error: error.message };
    }
  }

  formatPhoneNumber(phoneNumber) {
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.startsWith('20')) {
      // رقم مصري
      if (!cleaned.match(/^20[0-9]{9,10}$/)) {
        throw new Error('رقم الهاتف المصري غير صحيح');
      }
    } else if (cleaned.startsWith('966')) {
      // رقم سعودي
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
}

// تشغيل الإعداد
async function main() {
  const venomSetup = new VenomLocalSetup();
  const success = await venomSetup.initialize();
  
  if (success) {
    console.log('\n🎉 تم إعداد Venom Bot المحلي بنجاح!');
    console.log('💡 يمكنك الآن استخدام النظام لإرسال الرسائل');
    
    // اختبار إرسال رسالة (اختياري)
    const testPhone = process.env.TEST_PHONE_NUMBER;
    if (testPhone) {
      console.log(`📱 إرسال رسالة اختبار إلى: ${testPhone}`);
      await venomSetup.sendTestMessage(testPhone, '🧪 رسالة اختبار من نظام إدارة الحضور المحلي');
    }
  } else {
    console.log('\n❌ فشل في إعداد Venom Bot');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = VenomLocalSetup;