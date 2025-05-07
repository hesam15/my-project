'use client'

import VideoPlayer from '@/components/media/VideoPlayer'
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { toPersianNumbers } from '@/utils/numbers'

// Temporary data until we have an API
const videoData = {
  id: 1,
  title: 'توسعه فردی',
  description: 'این متن به عنوان نمونه در نظر گرفته شده و دو جمله است و البته شاید سه جمله باشد. این متن صرفا برای نمایش است و محتوای واقعی از API دریافت خواهد شد. این یک متن طولانی‌تر است که توضیحات بیشتری درباره ویدیو ارائه می‌دهد.',
  thumbnailSrc: '/images/books.jpg',
  date: '۱۴۰۲/۰۸/۲۵',
  likes: 834,
  comments: 83
}

export default function VideoPage({ params }: { params: { slug: string } }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md">
        <div className="aspect-[1.8/1] relative">
          <VideoPlayer {...videoData} isLarge />
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 space-y-4 border border-gray-100 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">{videoData.title}</h1>
          <div className="flex gap-4 text-gray-500">
            <div className="flex items-center gap-1">
              <HeartIcon className="w-5 h-5" />
              <span>{toPersianNumbers(videoData.likes)}</span>
            </div>
            <div className="flex items-center gap-1">
              <ChatBubbleLeftIcon className="w-5 h-5" />
              <span>{toPersianNumbers(videoData.comments)}</span>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500">{videoData.date}</div>
        <p className="text-gray-600 leading-7">{videoData.description}</p>
      </div>
    </div>
  )
} 