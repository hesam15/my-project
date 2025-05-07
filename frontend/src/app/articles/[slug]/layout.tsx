'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, NewspaperIcon } from '@heroicons/react/24/outline'
import Navbar from '@/components/Navbar'

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const handleBack = () => {
    router.push('/')
  }

  return (
    <>
      {children}
    </>
  )
} 