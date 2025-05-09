'use client'

import { useState, useEffect } from 'react'
import VideoCard from './VideoCard'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// Custom styles for Swiper
const swiperStyles = `
  .swiper-button-next,
  .swiper-button-prev {
    color: #DEBDA5 !important;
  }
  .swiper-pagination-bullet-active {
    background: #DEBDA5 !important;
  }
  .swiper-button-next:after,
  .swiper-button-prev:after {
    font-size: 20px !important;
  }
  .swiper-button-next,
  .swiper-button-prev {
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .swiper:hover .swiper-button-next,
  .swiper:hover .swiper-button-prev {
    opacity: 1;
  }
`

interface Video {
  id: number
  title: string
  thumbnail_path: string
  created_at: string
  likes: number
  comments_count: number
  is_premium: number
}

interface VideoSliderProps {
  videos: Video[]
  featuredVideo?: Video
}

export default function VideoSlider({ videos, featuredVideo }: VideoSliderProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!videos.length && !featuredVideo) {
      setError('هیچ ویدیویی یافت نشد')
    }
    setLoading(false)
  }, [videos, featuredVideo])

  if (loading) {
    return <div className="text-center py-10">در حال بارگذاری...</div>
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-600">{error}</p>
      </div>
    )
  }

  return (
    <>
      <style jsx global>{swiperStyles}</style>
      <div className="space-y-6">
        {featuredVideo && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-gray-700">آخرین ویدیوی شاخص</h2>
            <VideoCard
              id={featuredVideo.id}
              title={featuredVideo.title}
              thumbnail={featuredVideo.thumbnail_path ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${featuredVideo.thumbnail_path}` : '/images/default.jpg'}
              date={new Date(featuredVideo.created_at).toLocaleDateString('fa-IR')}
              likes={Array.isArray(featuredVideo.likes) ? featuredVideo.likes.length : 0}
              comments={featuredVideo.comments_count || 0}
              isPremium={featuredVideo.is_premium}
              isLarge
            />
          </div>
        )}

        <div className="h-px bg-gray-200" />

        <div>
          <h2 className="text-lg font-bold mb-4 text-gray-700">جدیدترین ویدیوها</h2>
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={16}
            slidesPerView={2}
            navigation
            pagination={{ clickable: true }}
            className="w-full"
          >
            {videos.map((video) => (
              <SwiperSlide key={video.id}>
                <VideoCard
                  id={video.id}
                  title={video.title}
                  thumbnail={video.thumbnail_path ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${video.thumbnail_path}` : '/images/default.jpg'}
                  date={new Date(video.created_at).toLocaleDateString('fa-IR')}
                  likes={video.views_count || 0}
                  comments={video.comments_count || 0}
                  isPremium={video.is_premium}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </>
  )
}