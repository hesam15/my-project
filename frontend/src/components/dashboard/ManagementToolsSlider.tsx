'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import ManagementToolCard from './ManagementToolCard'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { useEffect, useState } from 'react'
import { managementTools } from '@/lib/api'
import { toast } from 'sonner'
import moment from 'jalali-moment'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'

interface ManagementTool {
  id: number
  name: string
  description: string
  tool_path: string
  thumbnail_path: string
  is_premium: number
  user_id: number
  created_at: string
  updated_at: string
}

export default function ManagementToolsSlider() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [tools, setTools] = useState<ManagementTool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true)
        console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
        const response = await managementTools.getAll()
        console.log('Tools API response:', response)
        
        if (response.data && Array.isArray(response.data)) {
          setTools(response.data)
        } else {
          throw new Error('فرمت داده‌های دریافتی نامعتبر است')
        }
      } catch (err) {
        console.error('Error fetching management tools:', err)
        setError('خطا در دریافت ابزارهای مدیریتی')
        toast.error('خطا در دریافت ابزارهای مدیریتی')
      } finally {
        setLoading(false)
      }
    }

    fetchTools()
  }, [])

  const handleToolClick = (tool: ManagementTool) => {
    router.push(`/tools/${tool.id}`)
  }

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <h2 className="text-lg font-bold text-white">ابزار مدیریت</h2>
        <div className="text-white">در حال بارگذاری...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full space-y-4">
        <h2 className="text-lg font-bold text-white">ابزار مدیریت</h2>
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (tools.length === 0) {
    return (
      <div className="w-full space-y-4">
        <h2 className="text-lg font-bold text-white">ابزار مدیریت</h2>
        <div className="text-white">هیچ ابزاری یافت نشد</div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <h2 className="text-lg font-bold text-white">ابزار مدیریت</h2>
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={16}
          slidesPerView={1.2}
          navigation
          pagination={{ clickable: true }}
          className="!py-4"
        >
          {tools.map((tool) => (
            <SwiperSlide key={tool.id}>
              <div onClick={() => handleToolClick(tool)} className="cursor-pointer">
                <ManagementToolCard
                  id={tool.id}
                  title={tool.name}
                  description={tool.description}
                  image={
                    tool.thumbnail_path
                      ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${tool.thumbnail_path}`
                      : '/images/books.jpg'
                  }
                  date={moment(tool.created_at).locale('fa').format('YYYY/MM/DD')}
                  likes={0}
                  comments={0}
                  isPremium={tool.is_premium === 1}
                  isLocked={tool.is_premium === 1 && (!user || !user.is_premium)}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}