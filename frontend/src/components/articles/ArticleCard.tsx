'use client'

import { useRouter } from 'next/navigation'
import { ChatBubbleLeftIcon, HandThumbUpIcon } from '@heroicons/react/24/outline'
import { toFarsiNumber } from '@/utils/numbers'

interface ArticleCardProps {
  id: number
  title: string
  description: string
  thumbnail_path: string
  date: string
  likes: number
  comments: number
  isLarge?: boolean
}

const getImageUrl = (thumbnail_path: string | undefined) => {
  console.log('ArticleCard - thumbnail_path:', thumbnail_path)
  if (!thumbnail_path) {
    console.log('ArticleCard - using default image')
    return '/images/default.jpg'
  }
  if (thumbnail_path.startsWith('http')) {
    console.log('ArticleCard - using absolute URL:', thumbnail_path)
    return thumbnail_path
  }
  const url = `${process.env.NEXT_PUBLIC_API_URL}/storage/${thumbnail_path.replace(/^\\|^\//, '')}`
  console.log('ArticleCard - using storage URL:', url)
  return url
}

export default function ArticleCard({
  id,
  title,
  description,
  thumbnail_path,
  date,
  likes,
  comments,
  isLarge = false
}: ArticleCardProps) {
  console.log('ArticleCard props:', { id, title, description, thumbnail_path, date, likes, comments, isLarge });
  const router = useRouter()

  const handleClick = () => {
    router.push(`/articles/${id}`)
  }

  return (
    <div 
      className={`bg-white rounded-lg overflow-hidden shadow-[10px_4px_6px_rgba(0,0,0,0.1)] cursor-pointer border-2 border-gray-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all duration-200 ${isLarge ? 'w-full' : 'w-48'}`}
      onClick={handleClick}
    >
      <div className="p-2">
        <img src={getImageUrl(thumbnail_path)} alt={title} className="w-full h-32 object-cover rounded-lg" />
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm text-gray-700 mb-1 line-clamp-1">{title}</h3>
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{description}</p>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{date}</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <ChatBubbleLeftIcon className="w-3 h-3" />
              <span>{toFarsiNumber(comments)}</span>
            </div>
            <div className="flex items-center gap-1">
              <HandThumbUpIcon className="w-3 h-3" />
              <span>{toFarsiNumber(likes)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 