'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function NotFoundContent() {
  const searchParams = useSearchParams()
  const pageTitle = searchParams.get('page') || 'صفحه مورد نظر'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-xl font-bold mb-2">{pageTitle} یافت نشد</h1>
        <p className="text-lg opacity-90">
          متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد...
        </p>
        <button 
          className="mt-8 px-12 py-3 rounded-xl font-medium text-sm flex items-center gap-2"
          onClick={() => window.location.href = '/'}
        >
          بازگشت به صفحه اصلی
        </button>
      </div>
    </div>
  )
}

export default function NotFound() {
  return (
    <Suspense fallback={<div>در حال بارگذاری...</div>}>
      <NotFoundContent />
    </Suspense>
  )
} 