'use client'

import { useSearchParams } from 'next/navigation'

export default function Offline() {
  const searchParams = useSearchParams()
  const pageTitle = searchParams.get('page') || 'صفحه اصلی'

  return (
    <div className="min-h-screen offline-page flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-xl font-bold mb-2">{pageTitle}</h1>
        <p className="text-lg opacity-90">
          اتصال به اینترنت وجود ندارد...
        </p>
        <button 
          className="mt-8 px-12 py-3 rounded-xl font-medium text-sm flex items-center gap-2"
          onClick={() => window.location.reload()}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M2 12L4 10M2 12L4 14M2 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          تلاش مجدد
        </button>
        <div className="mt-4 text-xs opacity-60">V1.0.0</div>
      </div>
    </div>
  )
} 