const nextConfig = {
  // تنظیمات تصاویر
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'modiri.at',
        pathname: '/storage/**',
      },
      // اضافه کردن دامنه‌های تولیدی
      {
        protocol: 'https',
        hostname: 'modiri.at',
        pathname: '/storage/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
    ],
    // بهبود عملکرد تصاویر
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // تنظیمات rewrite برای چند دامنه
  async rewrites() {
    const hosts = [
      { host: 'admin.localhost', destination: '/admin/:path*' },
      { host: 'admin.modiri.at', destination: '/admin/:path*' },
      { host: 'app.localhost', destination: '/app/:path*' },
      { host: 'app.modiri.at', destination: '/app/:path*' },
      { host: 'localhost', destination: '/:path*' },
    ];

    return hosts.map(({ host, destination }) => ({
      source: '/:path*',
      has: [{ type: 'host', value: host }],
      destination,
    }));
  },

  // تنظیمات هدر برای API
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { 
            key: 'Access-Control-Allow-Headers', 
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' 
          },
          // اضافه کردن هدرهای امنیتی
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },

  // غیرفعال کردن ESLint در حین ساخت
  eslint: {
    ignoreDuringBuilds: true,
  },

  // غیرفعال کردن TypeScript در حین ساخت
  typescript: {
    ignoreBuildErrors: true,
  },

  // فعال کردن فشرده‌سازی
  compress: true,

  // تنظیمات تولید
  productionBrowserSourceMaps: false, // غیرفعال کردن source maps در مرورگر برای تولید
};

module.exports = nextConfig;
