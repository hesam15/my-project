'use client'

import { useState, useEffect } from 'react'
import VideoPlayer from '@/components/media/VideoPlayer'
import { useParams } from 'next/navigation'
import { format } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { toast } from 'sonner'
import { useAuthContext } from '@/contexts/AuthContext'
import Comments from '@/components/comments/Comments'
import { COMMENTABLE_TYPES } from '@/constants/models'

interface Video {
  id: number
  title: string
  description: string
  video_path: string | null
  thumbnail_path: string | null
  is_premium: number
  likes: number
  comments_count: number
  is_liked: boolean
  created_at: string
  comments: Comment[]
}

interface Comment {
  id: number
  user_id: number
  title: string
  content: string
  created_at: string
  active?: boolean
  user?: { name: string }
}

export default function VideoPage() {
  const params = useParams()
  const { user } = useAuthContext()
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVideo = async () => {
      if (!params || !params.slug || typeof params.slug !== 'string') {
        setError('شناسه ویدیو نامعتبر است')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error('NEXT_PUBLIC_API_URL is not defined')
        }
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${params.slug}`

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`خطای سرور: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.id || !data.title || !data.created_at) {
          throw new Error('داده‌های ناقص از API دریافت شد')
        }

        const formattedVideo: Video = {
          id: data.id,
          title: data.title || 'بدون عنوان',
          description: data.description || 'بدون توضیحات',
          video_path: data.video_path,
          thumbnail_path: data.thumbnail_path,
          is_premium: data.is_premium || 0,
          likes: Array.isArray(data.likes) ? data.likes.length : 0,
          comments_count: Array.isArray(data.comments) ? data.comments.filter((comment: any) => 
            comment.active || (user && comment.user_id === user.id)
          ).length : 0,
          is_liked: user && Array.isArray(data.likes) ? data.likes.some((like: any) => like.user_id === user.id) : false,
          created_at: data.created_at,
          comments: Array.isArray(data.comments) ? data.comments : [],
        }

        setVideo(formattedVideo)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'خطای ناشناخته در بارگذاری ویدیو'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [params, user])

  const handleCommentAdded = (newComment: Comment) => {
    setVideo((prev) =>
      prev
        ? {
            ...prev,
            comments: [newComment, ...prev.comments],
            // کامنت‌های کاربر فعلی همیشه در تعداد کامنت‌ها محاسبه می‌شوند
            comments_count: prev.comments_count + 1,
          }
        : null
    )
  }

  const filteredComments = video?.comments.filter((comment) => {
    if (user && comment.user_id === user.id) {
      return true
    }
    return comment.active
  }) || []

  if (loading) {
    return <div className="text-center py-10">در حال بارگذاری...</div>
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="bg-red-50 text-red-600 border border-red-100 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-lg font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            تلاش مجدد
          </button>
        </div>
      </div>
    )
  }

  if (!video) {
    return <div className="text-center py-10">ویدیو یافت نشد</div>
  }

  const videoSrc = video.video_path ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${video.video_path}` : ''
  const thumbnailSrc = video.thumbnail_path ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${video.thumbnail_path}` : '/images/books.jpg'
  const formattedDate = video.created_at ? format(new Date(video.created_at), 'yyyy/MM/dd', { locale: faIR }) : 'تاریخ نامشخص'
  const canViewVideo = video.is_premium === 0 || (user && user.is_premium)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md">
        <div className="aspect-[1.8/1] relative">
          {canViewVideo ? (
            <VideoPlayer
              id={video.id}
              videoSrc={videoSrc}
              thumbnailSrc={thumbnailSrc}
              title={video.title}
              description={video.description}
              date={formattedDate}
              likes={video.likes}
              isLiked={video.is_liked}
              comments={video.comments_count}
              isLarge
              setVideo={setVideo}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-800">این ویدیو فقط برای کاربران پریمیوم قابل مشاهده است</p>
                <p className="text-sm text-gray-600 mt-2">لطفاً اشتراک پریمیوم تهیه کنید</p>
                <button
                  onClick={() => window.location.href = '/premium'}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  خرید اشتراک پریمیوم
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 space-y-4 border border-gray-100 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">{video.title}</h1>
          {video.is_premium === 1 && (
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
              پریمیوم
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500">{formattedDate}</div>
        <p className="text-gray-600 leading-7">{video.description}</p>
      </div>
      <Comments
        comments={filteredComments}
        commentableId={video.id}
        commentableType={COMMENTABLE_TYPES.VIDEO}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  )
}