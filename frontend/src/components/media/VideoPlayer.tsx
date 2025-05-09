'use client'

import { PlayIcon } from '@heroicons/react/24/solid'
import { HeartIcon, ChatBubbleLeftIcon, HeartIcon as HeartIconSolid } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { toPersianNumbers } from '@/utils/numbers'
import { useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { COMMENTABLE_TYPES } from '@/constants/models'

interface VideoPlayerProps {
  id: number
  videoSrc: string
  thumbnailSrc: string
  title: string
  description: string
  date: string
  likes: number
  isLiked: boolean
  comments: number
  isLarge?: boolean
  setVideo: React.Dispatch<React.SetStateAction<any>>
}

export default function VideoPlayer({ 
  id,
  videoSrc,
  thumbnailSrc, 
  title, 
  description, 
  date,
  likes,
  isLiked,
  comments,
  isLarge = false,
  setVideo
}: VideoPlayerProps) {
  const { user } = useAuthContext()
  const [isLiking, setIsLiking] = useState(false)

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.error('برای لایک کردن باید وارد حساب کاربری شوید')
      return
    }

    if (isLiking) return

    setIsLiking(true)
    try {
      // 1. ارسال درخواست لایک/حذف لایک
      const likeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          likeable_id: id,
          likeable_type: COMMENTABLE_TYPES.VIDEO,
        }),
      })

      if (!likeResponse.ok) {
        const errorData = await likeResponse.json()
        toast.error(errorData.message || 'خطا در ثبت لایک')
        return
      }

      // 2. دریافت داده‌های به‌روز ویدیو
      const videoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      })

      if (videoResponse.ok) {
        const videoData = await videoResponse.json()
        setVideo((prev: any) =>
          prev
            ? {
                ...prev,
                likes: Array.isArray(videoData.likes) ? videoData.likes.length : 0,
                isLiked: user && Array.isArray(videoData.likes) ? videoData.likes.some((like: any) => like.user_id === user.id) : false,
              }
            : null
        )
        toast.success(videoData.likes.some((like: any) => like.user_id === user.id) ? 'ویدیو لایک شد' : 'لایک حذف شد')
      } else {
        toast.error('خطا در به‌روزرسانی اطلاعات ویدیو')
      }
    } catch (error) {
      toast.error('خطایی در ارتباط با سرور رخ داد')
    } finally {
      setIsLiking(false)
    }
  }

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.location.href = `/media/${id}`
  }

  return (
    <div className={`bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md ${isLarge ? 'w-full' : ''}`}>
      <div className={`relative ${isLarge ? 'aspect-[1.8/1]' : 'aspect-[1.2/1]'}`} onClick={handleLinkClick}>
        {videoSrc ? (
          <video
            src={videoSrc}
            controls
            className="w-full h-full object-cover rounded-t-2xl"
            poster={thumbnailSrc}
          />
        ) : (
          <>
            <img
              src={thumbnailSrc}
              alt={title}
              className="w-full h-full object-cover rounded-t-2xl"
            />
            {isLarge && (
              <div className="absolute inset-0 flex items-center justify-center">
                <PlayIcon className="w-20 h-20 text-[#2B286A] drop-shadow-[0_0_40px_rgba(43,40,106,0.6)]" />
              </div>
            )}
          </>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">{description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">{date}</span>
          <div className="flex gap-4 text-sm text-gray-500">
            <button
              onClick={handleLike}
              disabled={isLiking || !user}
              className="flex items-center gap-1 transition-colors hover:text-red-500 disabled:opacity-50"
            >
              {isLiked ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
              <span>{toPersianNumbers(likes)}</span>
            </button>
            <div className="flex items-center gap-1">
              <ChatBubbleLeftIcon className="w-5 h-5" />
              <span>{toPersianNumbers(comments)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}