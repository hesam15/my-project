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
      {children}
    </div>
  )
} 