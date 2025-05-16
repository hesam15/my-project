'use client'

import { getImageUrl } from '@/utils/images'

interface ManagementToolCardProps {
  id: number
  title: string
  description: string
  image: string | null
  date: string
  likes: number
  comments: number
  isPremium: boolean
  isLocked?: boolean
}

export default function ManagementToolCard({
  id,
  title,
  description,
  image,
  date,
  likes,
  comments,
  isPremium,
  isLocked = false
}: ManagementToolCardProps) {
  return (
    <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
      {isPremium && (
        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
          پریمیوم
        </div>
      )}
      
      <img 
        src={getImageUrl(image, 'tool')} 
        alt={title} 
        className="w-full h-40 object-cover"
      />
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-gray-500">{date}</span>
          <div className="flex space-x-2">
            <span className="text-xs text-gray-500">
              {likes} پسند
            </span>
            <span className="text-xs text-gray-500">
              {comments} نظر
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}