'use client'

import Image from 'next/image'
import Link from 'next/link'
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { toPersianNumbers } from '@/utils/numbers'
import moment from 'jalali-moment'

interface CourseCardProps {
  id: number
  title: string
  description: string
  thumbnail_path: string | null | undefined
  date: string | undefined // اجازه می‌ده undefined باشه
  likes: number | null | undefined | any
  comments: number | null | undefined | any
  is_premium?: number // اضافه کردن پارامتر is_premium
}

export default function CourseCard(props: CourseCardProps) {
  const {
    id,
    title,
    description,
    thumbnail_path,
    date,
    likes,
    comments,
    is_premium = 0, // مقدار پیش‌فرض 0 (غیر پریمیوم)
  } = props

  const defaultThumbnailPath = `${process.env.NEXT_PUBLIC_API_URL}/storage/images/default-course-thumbnail.jpg`

  // مدیریت تعداد لایک‌ها
  const normalizedLikes = Array.isArray(likes) ? likes.length : (typeof likes === 'number' ? likes : 0)

  // مدیریت تعداد کامنت‌ها
  const normalizedComments = Array.isArray(comments) ? comments.length : (typeof comments === 'number' ? comments : 0)

  // ساخت URL کامل برای تصاویر
  const getImageUrl = (path: string | null | undefined) => {
    console.log('CourseCard - getImageUrl - Input path:', path)
    if (!path || path === 'undefined') {
      console.log('CourseCard - getImageUrl - Returning default:', defaultThumbnailPath)
      return defaultThumbnailPath
    }
    if (path.startsWith('http')) {
      console.log('CourseCard - getImageUrl - Returning external URL:', path)
      return path
    }
    const url = `${process.env.NEXT_PUBLIC_API_URL}/storage/${path}`
    console.log('CourseCard - getImageUrl - Returning constructed URL:', url)
    return url
  }

  // فرمت کردن تاریخ به شمسی
  const formatDate = (dateStr: string | undefined) => {
    console.log('CourseCard - formatDate - Input date:', dateStr)
    if (!dateStr || dateStr === 'undefined' || dateStr === 'null') {
      console.warn('CourseCard - formatDate - Invalid or empty date:', dateStr)
      // تاریخ فعلی به شمسی به‌عنوان پیش‌فرض
      return moment().locale('fa').format('YYYY/MM/DD')
    }

    try {
      // تلاش برای پارس تاریخ با فرمت‌های مختلف
      let parsedDate = moment(dateStr, [
        'YYYY-MM-DDTHH:mm:ss.SSSSSSZ', // فرمت ISO کامل
        'YYYY-MM-DDTHH:mm:ssZ',       // فرمت ISO ساده‌تر
        'YYYY-MM-DD',                 // فقط تاریخ
      ], true)

      if (!parsedDate.isValid()) {
        throw new Error('Invalid date format')
      }

      const jalaliDate = parsedDate.locale('fa').format('YYYY/MM/DD')
      console.log('CourseCard - formatDate - Formatted date:', jalaliDate)
      return jalaliDate
    } catch (error) {
      console.error('CourseCard - Date format error:', { dateStr, error })
      // تاریخ فعلی به شمسی به‌عنوان پیش‌فرض
      return moment().locale('fa').format('YYYY/MM/DD')
    }
  }

  const imageUrl = getImageUrl(thumbnail_path)
  console.log('CourseCard - Rendering image with URL:', imageUrl)

  return (
    <Link href={`/courses/${id}`} className="block">
      <div className="rounded-2xl overflow-hidden border-2 border-white shadow-md relative">
        {/* نمایش لیبل پریمیوم در صورتی که is_premium برابر با 1 باشد */}
        {is_premium === 1 && (
          <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full z-10">
            پریمیوم
          </span>
        )}
        <div className="aspect-[1.8/1] relative p-2">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover rounded-xl"
            onError={(e) => console.error('CourseCard - Image load error:', { src: imageUrl, title })}
          />
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-bold text-white line-clamp-2">{title}</h3>
          <p className="text-sm text-white/80 line-clamp-2">{description}</p>
          <div className="flex justify-between items-center text-sm">
            <div className="flex gap-4 text-white/80">
              <div className="flex items-center gap-1">
                <HeartIcon className="w-4 h-4" />
                <span>{toPersianNumbers(normalizedLikes)}</span>
              </div>
              <div className="flex items-center gap-1">
                <ChatBubbleLeftIcon className="w-4 h-4" />
                <span>{toPersianNumbers(normalizedComments)}</span>
              </div>
            </div>
            <span className="text-white/80">{formatDate(date)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}