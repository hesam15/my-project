'use client'

import Image from 'next/image'
import { PlayIcon } from '@heroicons/react/24/solid'
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { toPersianNumbers } from '@/utils/numbers'

interface VideoPlayerProps {
  id: number
  thumbnailSrc: string
  title: string
  description: string
  date: string
  likes: number
  comments: number
  isLarge?: boolean
}

export default function VideoPlayer({ 
  id,
  thumbnailSrc, 
  title, 
  description, 
  date,
  likes,
  comments,
  isLarge = false 
}: VideoPlayerProps) {
  return (
    <Link href={`/media/${id}`}>
      <div className={`bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md ${isLarge ? 'w-full' : ''}`}>
        <div className={`relative ${isLarge ? 'aspect-[1.8/1]' : 'aspect-[1.2/1]'}`}>
          <Image
            src={thumbnailSrc}
            alt={title}
            fill
            className="object-cover rounded-t-2xl"
          />
          {isLarge && (
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayIcon className="w-20 h-20 text-[#2B286A] drop-shadow-[0_0_40px_rgba(43,40,106,0.6)]" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-800 line-clamp-1">{title}</h3>
          <p className="text-sm text-gray-600 mt-2 line-clamp-3">{description}</p>
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500">{date}</span>
            <div className="flex gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <HeartIcon className="w-5 h-5" />
                <span>{toPersianNumbers(likes)}</span>
              </div>
              <div className="flex items-center gap-1">
                <ChatBubbleLeftIcon className="w-5 h-5" />
                <span>{toPersianNumbers(comments)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
} 