'use client'

import Image from 'next/image'
import Link from 'next/link'
import { StarIcon } from '@heroicons/react/24/solid'
import { ClockIcon } from '@heroicons/react/24/outline'
import { toPersianNumbers } from '@/utils/numbers'

// موقتاً از این دیتا استفاده می‌کنیم تا API آماده شود
const consultants = [
  {
    id: 1,
    title: 'مشاوره مدیریت منابع انسانی',
    description: 'با بهره‌گیری از مشاوران متخصص در زمینه منابع انسانی، به شما کمک می‌کنیم تا تیم خود را به بهترین شکل مدیریت کنید',
    duration: 60,
    rating: 4.5,
    date: '۱۴۰۲/۰۸/۲۵',
    image: '/images/books.jpg',
    consultant: {
      name: 'دکتر محمدی',
      expertise: 'متخصص منابع انسانی'
    }
  },
  {
    id: 2,
    title: 'مشاوره استراتژی کسب و کار',
    description: 'با کمک مشاوران با تجربه در زمینه استراتژی، مسیر رشد کسب و کار خود را به درستی تعیین و برنامه‌ریزی کنید',
    duration: 90,
    rating: 5,
    date: '۱۴۰۲/۰۸/۲۴',
    image: '/images/books.jpg',
    consultant: {
      name: 'دکتر رضایی',
      expertise: 'مشاور استراتژی'
    }
  },
  {
    id: 3,
    title: 'مشاوره بازاریابی و فروش',
    description: 'متخصصان ما در زمینه بازاریابی و فروش، به شما کمک می‌کنند تا استراتژی‌های موثر برای رشد فروش خود طراحی کنید',
    duration: 45,
    rating: 4,
    date: '۱۴۰۲/۰۸/۲۳',
    image: '/images/books.jpg',
    consultant: {
      name: 'دکتر کریمی',
      expertise: 'متخصص بازاریابی'
    }
  }
]

export default function ConsultationPage() {
  return (
    <main className="min-h-screen bg-[#F3F3F3]">
      {/* Description Section */}
      <div className="relative bg-[#AAA9C7CC] px-4 py-8">
        <div className="relative z-10">
          <h2 className="text-lg font-bold mb-4 text-white">مشاوره تخصصی مدیریت</h2>
          <p className="text-sm leading-6 text-white">
            در دنیای پیچیده کسب و کار امروز، داشتن یک مشاور متخصص می‌تواند تفاوت بزرگی در موفقیت شما ایجاد کند. تیم مشاوران ما با تجربه و دانش تخصصی، آماده هستند تا در مسیر رشد و توسعه کسب و کار شما را همراهی کنند.
          </p>
        </div>
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/books.jpg"
            alt="مشاوره تخصصی"
            fill
            className="object-cover opacity-20"
          />
        </div>
      </div>

      {/* Consultants List */}
      <div className="px-4 py-6 space-y-4">
        {consultants.map((consultant) => (
          <Link href={`/consultation/${consultant.id}`} key={consultant.id} className="block">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">{consultant.title}</h3>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(consultant.rating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      {consultant.rating % 1 > 0 && (
                        <StarIcon className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{consultant.consultant.name}</p>
                    <p className="text-gray-500">{consultant.consultant.expertise}</p>
                  </div>
                  <p className="text-sm text-gray-600">{consultant.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{consultant.date}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">
                        {toPersianNumbers(consultant.duration)} دقیقه
                      </span>
                      <ClockIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="w-24 h-24 relative flex-shrink-0">
                  <Image
                    src={consultant.image}
                    alt={consultant.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
} 