'use client'

import Image from 'next/image'
import { HeartIcon, ChatBubbleLeftIcon, PlayCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { toPersianNumbers } from '@/utils/numbers'
import { useEffect, useState } from 'react'
import { use } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import moment from 'jalali-moment'
import { comments, likes, courses } from '@/lib/api'
import Comments from '@/components/comments/Comments'
import { COMMENTABLE_TYPES } from '@/constants/models'
import Link from 'next/link'

interface Video {
  id: number
  title: string
  duration: string
  is_free: boolean
  order: number
  description?: string | null
  thumbnail_path?: string | null
  video_path?: string | null
}

interface Like {
  user_id: number
  likable_type: string
  likable_id: number
}

interface Comment {
  id: number
  user_id: number
  title: string
  content: string
  created_at: string
  status: 'active' | 'notActive' | 'rejected'
  user?: { name: string }
}

interface CourseData {
  id: number
  title: string
  description: string
  thumbnail_path: string
  created_at: string
  user_id: number
  videos: Video[]
  likes: Like[]
  likes_count: number
  is_liked: boolean
  comments: Comment[]
  comments_count: number
  is_premium?: number // اضافه کردن فیلد is_premium
}

interface CoursePageProps {
  params: {
    slug: string
  }
}

export default function CoursePage({ params }: CoursePageProps) {
  const resolvedParams = use(params)
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const [isLiking, setIsLiking] = useState(false)
  const [openVideoId, setOpenVideoId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthContext()

  // بررسی اینکه آیا کاربر اشتراک پریمیوم دارد یا خیر
  const is_premiumUser = user && (user as any).is_premium === 1;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await courses.getOne(resolvedParams.slug)
        const data = response.data
        
        // فقط کامنت‌های فعال را شمارش می‌کنیم
        const activeCommentsCount = data.comments?.filter(
          (comment: Comment) => comment.status === 'active'
        ).length || 0;
        
        setCourseData({
          ...data,
          likes_count: data.likes.length,
          is_liked: user ? data.likes.some((like: Like) => like.user_id === user.id) : false,
          comments_count: activeCommentsCount,
          comments: data.comments || [],
        })
        setError(null)
      } catch (err) {
        console.error('Error fetching course:', err)
        setError(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات دوره')
      }
    }

    fetchCourse()
  }, [resolvedParams.slug, user])

  console.log(user);

  const handleLike = async () => {
    if (!courseData || isLiking || !user) return;

    setIsLiking(true)
    try {
      const response = await likes.toggle({
        likeable_id: courseData.id,
        likeable_type: 'App\\Models\\Course'
      });

      if (response.status === 200) {
        setCourseData((prev) =>
          prev
            ? {
                ...prev,
                likes_count: prev.is_liked ? prev.likes_count - 1 : prev.likes_count + 1,
                is_liked: !prev.is_liked,
              }
            : null
        )
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleCommentAdded = (newComment: Comment) => {
    setCourseData((prev) =>
      prev
        ? {
            ...prev,
            comments: [newComment, ...prev.comments],
            // فقط اگر کامنت فعال باشد، به تعداد کامنت‌ها اضافه می‌کنیم
            comments_count: newComment.status === 'active' ? prev.comments_count + 1 : prev.comments_count,
          }
        : null
    )
  }

  const handleCommentStatusChanged = (commentId: number, status: 'active' | 'notActive' | 'rejected') => {
    setCourseData((prev) => {
      if (!prev) return null;
      
      const updatedComments = prev.comments.map(comment => 
        comment.id === commentId ? { ...comment, status } : comment
      );
      
      // محاسبه مجدد تعداد کامنت‌های فعال
      const newActiveCommentsCount = updatedComments.filter(comment => comment.status === 'active').length;
      
      return {
        ...prev,
        comments: updatedComments,
        comments_count: newActiveCommentsCount
      };
    });
  }

  const getStorageUrl = (path: string | null | undefined, defaultPath: string) => {
    if (!path || path === 'undefined') {
      return defaultPath
    }
    if (path.startsWith('http')) {
      return path
    }
    return `${process.env.NEXT_PUBLIC_API_URL}/storage/${path}`
  }

  const formatDate = (dateStr: string | undefined) => {
    console.log('CoursePage - formatDate - Input date:', dateStr)
    if (!dateStr || dateStr === 'undefined' || dateStr === 'null') {
      console.warn('CoursePage - formatDate - Invalid or empty date:', dateStr)
      return moment().locale('fa').format('YYYY/MM/DD')
    }

    try {
      let parsedDate = moment(dateStr, [
        'YYYY-MM-DDTHH:mm:ss.SSSSSSZ',
        'YYYY-MM-DDTHH:mm:ssZ',
        'YYYY-MM-DD',
      ], true)

      if (!parsedDate.isValid()) {
        throw new Error('Invalid date format')
      }

      const jalaliDate = parsedDate.locale('fa').format('YYYY/MM/DD')
      console.log('CoursePage - formatDate - Formatted date:', jalaliDate)
      return jalaliDate
    } catch (error) {
      console.error('CoursePage - Date format error:', { dateStr, error })
      return moment().locale('fa').format('YYYY/MM/DD')
    }
  }

  const toggleVideo = (videoId: number) => {
    // اگر دوره پریمیوم است و کاربر اشتراک پریمیوم ندارد، اجازه باز کردن ویدیو را نمی‌دهیم
    if (courseData?.is_premium === 1 && !is_premiumUser && !isVideoFree(videoId)) {
      return;
    }
    setOpenVideoId(openVideoId === videoId ? null : videoId)
  }

  console.log(courseData);



  // بررسی اینکه آیا ویدیو رایگان است یا خیر
  const isVideoFree = (videoId: number): boolean => {
    if (!courseData?.videos) return false;
    const video = courseData.videos.find(v => v.id === videoId);
    return video?.is_free || false;
  }

  // بررسی اینکه آیا کاربر می‌تواند ویدیو را مشاهده کند یا خیر
  const canViewVideo = (video: Video): boolean => {
    // اگر ویدیو رایگان است، همه می‌توانند آن را ببینند
    if (video.is_free) return true;
    
    // اگر دوره پریمیوم نیست، همه می‌توانند ویدیوها را ببینند
    if (courseData?.is_premium !== 1) return true;
    
    // اگر دوره پریمیوم است و کاربر اشتراک پریمیوم دارد، می‌تواند ویدیو را ببیند
    if (is_premiumUser) return true;
    
    // در غیر این صورت، کاربر نمی‌تواند ویدیو را ببیند
    return false;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-6">
        <p>{error.toString()}</p>
      </div>
    )
  }

  if (!courseData) return null

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md relative">
        {/* نمایش لیبل پریمیوم اگر دور�� پریمیوم است */}
        {courseData.is_premium === 1 && (
          <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full z-10">
            پریمیوم
          </span>
        )}
        <div className="aspect-[1.8/1] relative">
          <Image
            src={getStorageUrl(courseData.thumbnail_path, `${process.env.NEXT_PUBLIC_API_URL}/storage/images/default-course-thumbnail.jpg`)}
            alt={courseData.title}
            fill
            className="object-cover"
          />
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 space-y-4 border border-gray-100 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">{courseData.title}</h1>
          <div className="flex gap-4 text-gray-500">
            <button 
              onClick={handleLike}
              disabled={isLiking || !user}
              className="flex items-center gap-1 transition-colors hover:text-red-500 disabled:opacity-50"
            >
              {courseData.is_liked ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
              <span>{toPersianNumbers(courseData.likes_count)}</span>
            </button>
            <div className="flex items-center gap-1">
              <ChatBubbleLeftIcon className="w-5 h-5" />
              <span>{toPersianNumbers(courseData.comments_count)}</span>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500">{formatDate(courseData.created_at)}</div>
        <p className="text-gray-600 leading-7">{courseData.description}</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">سرفصل‌های دوره</h2>
        
        {/* نمایش پیام برای کاربران غیر پریمیوم در صورتی که دوره پریمیوم باشد */}
        {courseData.is_premium === 1 && !is_premiumUser && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <LockClosedIcon className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-800">این دوره نیاز به اشتراک پریمیوم دارد</h3>
            </div>
            <p className="text-sm text-purple-700 mb-3">
              برای دسترسی به تمام ویدیوهای این دوره، لطفاً اشتراک پریمیوم تهیه کنید.
              ویدیوهای رایگان همچنان قابل مشاهده هستند.
            </p>
            <Link href="/premium/buy" className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors">
              خرید اشتراک پریمیوم
            </Link>
          </div>
        )}
        
        <div className="space-y-3">
          {courseData.videos?.map((video) => (
            <div 
              key={video.id}
              className={`rounded-xl border border-gray-200 ${canViewVideo(video) ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-100'} transition-colors`}
            >
              <button
                onClick={() => toggleVideo(video.id)}
                className={`w-full flex items-center justify-between p-4 text-left ${!canViewVideo(video) ? 'cursor-not-allowed opacity-70' : ''}`}
                disabled={!canViewVideo(video)}
              >
                <div className="flex items-center gap-3">
                  {canViewVideo(video) ? (
                    <PlayCircleIcon className="w-6 h-6 text-blue-500" />
                  ) : (
                    <LockClosedIcon className="w-6 h-6 text-gray-500" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-800">{video.title}</h3>
                    <span className="text-sm text-gray-500">{video.duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {video.is_free && (
                    <span className="text-sm text-green-500 bg-green-100 px-3 py-1 rounded-full">
                      رایگان
                    </span>
                  )}
                  {courseData.is_premium === 1 && !video.is_free && (
                    <span className="text-sm text-purple-500 bg-purple-100 px-3 py-1 rounded-full">
                      پریمیوم
                    </span>
                  )}
                </div>
              </button>
              {openVideoId === video.id && canViewVideo(video) && (
                <div className="p-4 border-t border-gray-200 bg-white transition-all duration-300">
                  {video.video_path ? (
                    <div className="space-y-4">
                      <div className="relative w-full max-w-2xl mx-auto">
                        <video
                          controls
                          poster={getStorageUrl(video.thumbnail_path, `${process.env.NEXT_PUBLIC_API_URL}/storage/images/default-video-thumbnail.jpg`)}
                          className="w-full rounded-md"
                        >
                          <source
                            src={getStorageUrl(video.video_path, '')}
                            type="video/mp4"
                          />
                          مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                        </video>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-800">توضیحات</h4>
                        <p className="text-gray-600 text-sm leading-6">
                          {video.description || 'بدون توضیح'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">ویدیو در دسترس نیست</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Comments
        comments={courseData.comments}
        commentableId={courseData.id}
        commentableType={COMMENTABLE_TYPES.COURSE}
        onCommentAdded={handleCommentAdded}
        onCommentStatusChanged={handleCommentStatusChanged}
      />
    </div>
  )
}