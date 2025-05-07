'use client'

import Image from 'next/image'
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { toPersianNumbers } from '@/utils/numbers'

// Temporary data until we have an API
const toolData = {
  id: 1,
  title: 'ابزار مدیریت زمان',
  description: 'این ابزار به شما کمک می‌کند تا زمان خود را به طور موثر مدیریت کنید و بهره‌وری خود را افزایش دهید. با استفاده از این ابزار می‌توانید زمان خود را به درستی برنامه‌ریزی کنید و از آن به بهترین شکل استفاده کنید.',
  image: '/images/books.jpg',
  date: '۱۴۰۲/۰۸/۲۵',
  likes: 834,
  comments: 83
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md">
        <div className="aspect-[1.8/1] relative">
          <Image
            src={toolData.image}
            alt={toolData.title}
            fill
            className="object-cover"
          />
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 space-y-4 border border-gray-100 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">{toolData.title}</h1>
          <div className="flex gap-4 text-gray-500">
            <div className="flex items-center gap-1">
              <HeartIcon className="w-5 h-5" />
              <span>{toPersianNumbers(toolData.likes)}</span>
            </div>
            <div className="flex items-center gap-1">
              <ChatBubbleLeftIcon className="w-5 h-5" />
              <span>{toPersianNumbers(toolData.comments)}</span>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500">{toolData.date}</div>
        <p className="text-gray-600 leading-7">{toolData.description}</p>
      </div>
    </div>
  )
} 