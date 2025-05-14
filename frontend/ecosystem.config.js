module.exports = {
  apps: [
    {
      name: 'modiri.at', // نام برنامه
      script: 'npm', // استفاده از npm
      args: 'start', // اسکریپت اجرایی
      instances: 'max', // استفاده از تمام هسته‌های CPU
      autorestart: true, // ریستارت خودکار
      watch: false, // عدم مشاهده تغییرات فایل‌ها
      max_memory_restart: '1G', // ریستارت در صورت مصرف بیش از 1GB RAM
      env: {
        NODE_ENV: 'production',
        PORT: 3000 // پورت برنامه
      }
    }
  ]
};
