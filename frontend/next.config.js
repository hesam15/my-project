/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      // اضافه کردن دامنه‌های دیگر در صورت نیاز
    ],
  },
  async rewrites() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'admin.localhost',
          },
        ],
        destination: '/admin/:path*',
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'admin.modiri.at',
          },
        ],
        destination: '/admin/:path*',
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'app.localhost',
          },
        ],
        destination: '/app/:path*',
      },
      // اضافه کردن rewrite برای دامنه اصلی (اختیاری)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'localhost',
          },
        ],
        destination: '/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;