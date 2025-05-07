# ساختار پروژه PWA با Laravel و Next.js

## ساختار کلی پروژه
```
project-root/
├── backend/                 # Laravel Backend
└── frontend/               # Next.js Frontend
```

## ساختار Backend (Laravel)
```
backend/
├── app/
│   ├── Console/
│   ├── Exceptions/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   ├── AuthenticatedSessionController.php
│   │   │   │   └── RegisteredUserController.php
│   │   │   ├── CourseController.php
│   │   │   ├── LikeController.php
│   │   │   ├── UserController.php
│   │   │   └── VideoController.php
│   │   ├── Middleware/
│   │   └── Requests/
│   │       └── Auth/
│   │           └── LoginRequest.php
│   ├── Models/
│   │   ├── Course.php
│   │   ├── User.php
│   │   └── Video.php
│   └── Providers/
├── config/
│   ├── auth.php
│   ├── cors.php
│   └── sanctum.php
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   ├── api.php
│   ├── auth.php
│   └── web.php
├── storage/
├── tests/
└── vendor/
```

### توضیحات مهم Backend
- **Controllers**: مدیریت درخواست‌های API
- **Models**: مدل‌های دیتابیس
- **Migrations**: ساختار دیتابیس
- **Routes**: مسیریابی API
- **Middleware**: میان‌افزارهای احراز هویت و CORS

## ساختار Frontend (Next.js)
```
frontend/
├── public/
│   ├── icons/              # PWA Icons
│   └── manifest.json       # PWA Manifest
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── courses/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Navbar.tsx
│   │   └── dashboard/
│   │       └── CourseCard.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useCourses.ts
│   ├── services/
│   │   ├── api.ts
│   │   └── auth.ts
│   ├── styles/
│   │   └── globals.css
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── helpers.ts
├── .env.local
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

### توضیحات مهم Frontend
- **app/**: ساختار App Router در Next.js 13+
- **components/**: کامپوننت‌های قابل استفاده مجدد
- **services/**: سرویس‌های ارتباط با API
- **hooks/**: هوک‌های سفارشی React
- **public/**: فایل‌های استاتیک و PWA

## ویژگی‌های PWA
- Service Worker برای کارکرد آفلاین
- Manifest برای نصب روی دستگاه
- Cache API برای ذخیره‌سازی داده‌ها

## ارتباط Frontend و Backend
```
Frontend (Next.js) <---> API (Laravel)
     |                        |
     |-- Authentication ------| (Sanctum)
     |-- API Requests --------| (REST API)
     |-- Real-time -----------| (WebSocket)
```

### نکات مهم ارتباطی
1. استفاده از Laravel Sanctum برای احراز هویت
2. CORS تنظیم شده برای ارتباط امن
3. API Endpoints مستندسازی شده
4. Middleware های مناسب برای امنیت

## متغیرهای محیطی

### Backend (.env)
```
APP_NAME=ModiriatApp
APP_ENV=local
DB_CONNECTION=mysql
SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## دستورات اجرا

### Backend
```bash
cd backend
composer install
php artisan migrate
php artisan serve
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## نکات توسعه
1. استفاده از TypeScript برای type safety
2. Tailwind CSS برای استایل‌دهی
3. React Query برای مدیریت state سمت سرور
4. Laravel Sanctum برای احراز هویت
5. PWA capabilities برای نصب و کارکرد آفلاین