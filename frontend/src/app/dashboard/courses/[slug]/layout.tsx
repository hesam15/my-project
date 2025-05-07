'use client'

import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  return (
    <div>
      <nav className="fixed top-0 right-0 left-0 h-14 bg-[#F3F3F3] z-50 top-nav">
        <div className="h-full flex items-center px-4 gap-4">
          <button onClick={() => router.back()} className="p-2">
            <ArrowRightIcon className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-700">دوره ها</h1>
        </div>
      </nav>
      {children}
    </div>
  )
} 