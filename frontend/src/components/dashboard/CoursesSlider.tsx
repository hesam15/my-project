'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import CourseCard from './CourseCard'
import { useEffect, useState } from 'react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface Course {
  id: number
  title: string
  description: string
  thumbnail: string
  date: string
  likes: number
  comments: number
}

export default function CoursesSlider() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`)
        if (!response.ok) {
          throw new Error('خطا در دریافت اطلاعات')
        }
        const data = await response.json()
        setCourses(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطا در دریافت ا��لاعات')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <h2 className="text-lg font-bold text-white">دوره ها</h2>
        <div className="bg-white/10 rounded-2xl p-6 text-center">
          <p className="text-white">در حال بارگذاری دوره‌ها...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full space-y-4">
        <h2 className="text-lg font-bold text-white">دوره ها</h2>
        <div className="bg-white/10 rounded-2xl p-6 text-center">
          <p className="text-white">{error}</p>
        </div>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="w-full space-y-4">
        <h2 className="text-lg font-bold text-white">دوره ها</h2>
        <div className="bg-white/10 rounded-2xl p-6 text-center">
          <p className="text-white">هیچ دوره‌ای یافت نشد</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <h2 className="text-lg font-bold text-white">دوره ها</h2>
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={16}
          slidesPerView={1.2}
          navigation
          pagination={{ clickable: true }}
          className="!py-4"
        >
          {courses.map((course) => (
            <SwiperSlide key={course.id}>
              <CourseCard {...course} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}