'use client'

import VideoPlayer from '@/components/media/VideoPlayer'
import ArticleCard from '@/components/articles/ArticleCard'
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

// Temporary data until we have an API
const featuredVideo = {
  id: 1,
  title: 'چگونه مهارت‌های ارتباطی خود را تقویت کنیم؟',
  description: 'در این ویدیو به بررسی روش‌های موثر برای بهبود مهارت‌های ارتباطی و ایجاد روابط حرفه‌ای قوی می‌پردازیم...',
  thumbnailSrc: '/images/books.jpg',
  date: '۱۴۰۲/۰۸/۲۵',
  likes: 834,
  comments: 83
}

const latestVideos = [
  {
    id: 2,
    title: 'اصول مدیریت زمان در محیط کار',
    description: 'آموزش تکنیک‌های کاربردی برای مدیریت بهتر زمان و افزایش بهره‌وری در محیط کار...',
    image: '/images/nice.jpg',
    date: '۱۴۰۲/۰۸/۲۴',
    likes: 756,
    comments: 92
  },
  {
    id: 3,
    title: 'رازهای موفقیت در مذاکرات تجاری',
    description: 'در این ویدیو، تکنیک‌های پیشرفته مذاکره و اصول موفقیت در جلسات کاری را بررسی می‌کنیم...',
    image: '/images/nice.jpg',
    date: '۱۴۰۲/۰۸/۲۳',
    likes: 612,
    comments: 45
  },
  {
    id: 4,
    title: 'مدیریت استرس در محیط کار',
    description: 'راهکارهای عملی برای کنترل استرس و حفظ تعادل در زندگی حرفه‌ای...',
    image: '/images/nice.jpg',
    date: '۱۴۰۲/۰۸/۲۲',
    likes: 945,
    comments: 128
  },
  {
    id: 5,
    title: 'اصول رهبری موثر در سازمان',
    description: 'بررسی ویژگی‌های یک رهبر موفق و تکنیک‌های رهبری تیم در سازمان‌های مدرن...',
    image: '/images/nice.jpg',
    date: '۱۴۰۲/۰۸/۲۱',
    likes: 834,
    comments: 76
  }
]

export default function MediaPage() {
  return (
    <>
      <style jsx global>{swiperStyles}</style>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold mb-4 text-gray-700 font-yekan-lg">آخرین ویدیو مجموعه ۷</h2>
          <div className="border border-gray-300 rounded-2xl overflow-hidden">
            <VideoPlayer {...featuredVideo} isLarge />
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        <div>
          <h2 className="text-lg font-bold mb-4 text-gray-700 font-yekan-lg">جدیدترین ویدیوها</h2>
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={16}
            slidesPerView={2}
            navigation
            pagination={{ clickable: true }}
            className="w-full"
          >
            {latestVideos.map((video) => (
              <SwiperSlide key={video.id}>
                <ArticleCard {...video} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </>
  )
} 