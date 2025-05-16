'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import CourseCard from './CourseCard'
import { useEffect, useState } from 'react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { courses } from '@/lib/api'

interface Course {
  id: number
  title: string
  description: string
  thumbnail_path: string
  created_at: string
  likes: any[]
  comments: any[]
  is_premium?: number // اضافه کردن فیلد is_premium
}

export default function CoursesSlider() {
  const [coursesList, setCoursesList] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courses.getAll()
        if (response.data) {
          setCoursesList(response.data)
        } else {
          setCoursesList([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات')
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

  if (coursesList.length === 0) {
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
          {coursesList.map((course) => (
            <SwiperSlide key={course.id}>
              <CourseCard
                id={course.id}
                title={course.title}
                description={course.description}
                thumbnail_path={course.thumbnail_path}
                date={course.created_at}
                likes={course.likes}
                comments={course.comments}
                is_premium={course.is_premium} // پاس دادن is_premium به CourseCard
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}