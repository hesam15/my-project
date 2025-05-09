'use client'

import { useRouter } from 'next/navigation'
import { ChatBubbleLeftIcon, HandThumbUpIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { toFarsiNumber } from '@/utils/numbers'

interface TopArticleCardProps {
  id: number
  title: string
  description: string
  thumbnail_path: string
  date: string
  likes: number
  comments: number
  bookmarks: number
}

const getImageUrl = (thumbnail_path: string | undefined) => {
  if (!thumbnail_path) {
    return '/images/default.jpg'
  }
  if (thumbnail_path.startsWith('http')) {
    return thumbnail_path
  }
  return `${process.env.NEXT_PUBLIC_API_URL}/storage/${thumbnail_path.replace(/^\\|^\//, '')}`
}

export default function TopArticleCard({
  id,
  title,
  description,
  thumbnail_path,
  date,
  likes,
  comments,
  bookmarks
}: TopArticleCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/articles/${id}`)
  }

  return (
    <div className="cursor-pointer border-2 border-white rounded-xl p-4" onClick={handleClick}>
      <div className="flex flex-row-reverse">
        <img
          src={getImageUrl(thumbnail_path)}
          alt={title}
          className="w-full h-32 object-cover rounded-lg"
        />
        <div className="flex-1 pr-4">
          <h3 className="font-bold mb-2 text-white">{title}</h3>
          <p className="text-sm text-white/90 mb-4 line-clamp-3">{description}</p>
          <div className="flex justify-between items-center text-sm text-white">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <ChatBubbleLeftIcon className="w-4 h-4" />
                <span>{toFarsiNumber(comments)}</span>
              </div>
              <div className="flex items-center gap-1">
                <HandThumbUpIcon className="w-4 h-4" />
                <span>{toFarsiNumber(likes)}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookmarkIcon className="w-4 h-4" />
                <span>{toFarsiNumber(bookmarks)}</span>
              </div>
            </div>
            <span>{date}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 