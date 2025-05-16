import { ChatBubbleLeftIcon, HandThumbUpIcon } from '@heroicons/react/24/outline'
import { toPersianNumbers } from '@/utils/numbers'
import Link from 'next/link'

interface VideoCardProps {
  id: number
  title: string
  thumbnail: string
  date: string
  likes: number | null | undefined | any
  comments: number
  isPremium?: number
  isLarge?: boolean
}

const getThumbnailUrl = (thumbnail: string) => {
  console.log('VideoCard - thumbnail:', thumbnail)
  if (!thumbnail) {
    console.log('VideoCard - using default thumbnail')
    return '/images/default.jpg'
  }
  console.log('VideoCard - using provided URL:', thumbnail)
  return thumbnail
}

export default function VideoCard({
  id,
  title,
  thumbnail,
  date,
  likes,
  comments,
  isPremium = 0,
  isLarge = false
}: VideoCardProps) {

  const normalizedLikes = Array.isArray(likes) ? likes.length : (typeof likes === 'number' ? likes : 0)
  console.log(likes);

  console.log('VideoCard props:', { id, title, thumbnail, date, likes, comments, isPremium, isLarge })

  return (
    <Link href={`/media/${id}`}>
      <div 
        className={`bg-white rounded-lg overflow-hidden shadow-[10px_4px_6px_rgba(0,0,0,0.1)] cursor-pointer border-2 border-gray-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all duration-200 ${isLarge ? 'w-full' : 'w-48'} relative`}
      >
        {isPremium === 1 && (
          <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full z-10">
            پریمیوم
          </span>
        )}
        <div className="p-2">
          <img src={getThumbnailUrl(thumbnail)} alt={title} className="w-full h-32 object-cover rounded-lg" />
        </div>
        <div className="p-3">
          <h3 className="font-bold text-sm text-gray-700 mb-1 line-clamp-1">{title}</h3>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{date}</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <ChatBubbleLeftIcon className="w-3 h-3" />
                <span>{toPersianNumbers(comments)}</span>
              </div>
              <div className="flex items-center gap-1">
                <HandThumbUpIcon className="w-3 h-3" />
                <span>{toPersianNumbers(normalizedLikes)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}