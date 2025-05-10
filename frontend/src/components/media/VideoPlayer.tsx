'use client'

import { PlayIcon } from '@heroicons/react/24/solid'
import { HeartIcon, ChatBubbleLeftIcon, HeartIcon as HeartIconSolid } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { toPersianNumbers } from '@/utils/numbers'
import { useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { COMMENTABLE_TYPES } from '@/constants/models'
import { useAlert } from '@/contexts/AlertContext'

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
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const { user } = useAuthContext()
  const { showAlert } = useAlert()

  const handleLike = async () => {
    if (!user) {
      showAlert('برای لایک کردن باید وارد حساب کاربری شوید', 'danger')
      return
    }

    if (isLiking) return

    setIsLiking(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          likeable_id: id,
          likeable_type: COMMENTABLE_TYPES.VIDEO,
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('خطا در ثبت لایک')
      }

      setVideo((prev: any) => ({
        ...prev,
        likes: prev.is_liked ? prev.likes - 1 : prev.likes + 1,
        is_liked: !prev.is_liked,
      }))

      showAlert(prev => prev?.is_liked ? 'لایک حذف شد' : 'ویدیو لایک شد', 'success')
    } catch (error: any) {
      showAlert(error.message, 'danger')
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