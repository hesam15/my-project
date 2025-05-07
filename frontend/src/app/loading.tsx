'use client'

import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

export default function Loading() {
  const searchParams = useSearchParams()
  const pageTitle = searchParams.get('page') || 'صفحه اصلی'

  return (
    <div className="fixed inset-0 bg-[#2B286A] flex flex-col items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <Image
          src="/images/loading.png"
          alt="loading"
          width={400}
          height={400}
          className="opacity-20"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-4">
        <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
        <p className="text-white text-lg">در حال بارگذاری...</p>
      </div>

      {/* Version */}
      <div className="absolute bottom-8 text-white/60 text-sm">
        V1.0.0
      </div>
    </div>
  )
} 