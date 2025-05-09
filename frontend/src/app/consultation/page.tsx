'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { StarIcon } from '@heroicons/react/24/solid'
import { ClockIcon } from '@heroicons/react/24/outline'
import { toPersianNumbers } from '@/utils/numbers'
import { format } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'

interface Consultation {
  id: number;
  title: string;
  description: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface ConsultationListProps {
  consultations: Consultation[];
  loading: boolean;
  error: string | null;
}

// Interface for Consultant (based on previous consultants array)
interface Consultant {
  id: number
  title: string
  description: string
  duration: number // minutes
  rating: number
  date: string // e.g., "1402/08/25"
  image: string
  consultant: {
    name: string
    expertise: string
  }
}

export default function ConsultationPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch consultants from API
  useEffect(() => {
    const fetchConsultants = async () => {
      setLoading(true)
      setError(null)

      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error('NEXT_PUBLIC_API_URL is not defined')
        }

        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/consultations`
        console.log('Fetching consultants from:', url)

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Error response text:', errorText)
          throw new Error(`خطای سرور: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()
        console.log('API response:', JSON.stringify(result, null, 2))

        // Transform API data to match Consultant interface
        const transformedData: Consultant[] = result.map((item: any) => {
          // Convert ISO date to Jalali (if needed)
          let dateStr = item.date || item.created_at || new Date().toISOString()
          try {
            dateStr = format(new Date(dateStr), 'yyyy/MM/dd', { locale: faIR })
          } catch (err) {
            console.warn('Invalid date format:', dateStr)
            dateStr = format(new Date(), 'yyyy/MM/dd', { locale: faIR })
          }

          return {
            id: item.id,
            title: item.title || 'مشاوره بدون عنوان',
            description: item.description || 'بدون توضیحات',
            duration: item.consultation_time || item.duration || 60, // Fallback to 60 minutes
            rating: item.rating || 4.0, // Fallback rating
            date: dateStr,
            image: item.image || '/images/books.jpg', // Fallback image
            consultant: {
              name: item.consultant || item.consultant?.name || 'مشاور ناشناس',
              expertise: item.consultant?.expertise || item.expertise || 'متخصص عمومی',
            },
          }
        })

        console.log('Transformed consultants:', transformedData)
        setConsultants(transformedData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'خطای ناشناخته در بارگذاری داده‌ها'
        console.error('Error fetching consultants:', err)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchConsultants()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F3F3F3]">
        <div className="text-center py-10">
          <p className="text-lg text-gray-600">در حال بارگذاری...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#F3F3F3]">
        <div className="text-center py-10">
          <div className="bg-red-50 text-red-600 border border-red-100 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-lg font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <Suspense fallback={<div>در حال بارگذاری...</div>}>
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
    </Suspense>
  )
}