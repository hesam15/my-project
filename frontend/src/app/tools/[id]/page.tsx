'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { managementTools, likes, comments } from '@/lib/api'
import { toast } from 'sonner'
import { useAuthContext } from '@/contexts/AuthContext'
import { ShareIcon, HeartIcon, ChatBubbleLeftIcon, BookmarkIcon, HeartIcon as HeartIconSolid } from '@heroicons/react/24/outline'
import { toFarsiNumber } from '@/utils/numbers'
import moment from 'jalali-moment'
import Comments from '@/components/comments/Comments'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { COMMENTABLE_TYPES } from '@/constants/models'

interface Comment {
  id: number
  user_id: number
  title: string
  content: string
  created_at: string
  active?: boolean
  user?: { name: string }
}

interface ToolDetails {
  id: number
  name: string
  description: string
  tool_path: string
  thumbnail_path: string
  is_premium: number
  category: string[]
  likes_count: number
  is_liked: boolean
  comments_count: number
  bookmarks_count: number
  comments: Comment[]
  created_at: string
}

export default function ToolDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuthContext()
  const [tool, setTool] = useState<ToolDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiking, setIsLiking] = useState(false)
  const [commentTitle, setCommentTitle] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    const fetchTool = async () => {
      try {
        setLoading(true)
        console.log('Fetching tool with id:', id)
        const response = await managementTools.getOne(id as string)
        console.log('Tool API response:', response)
        
        if (!response.data) {
          throw new Error('No tool data in response')
        }

        const toolData = response.data
        console.log(toolData)
        const formattedTool: ToolDetails = {
          id: toolData.id,
          name: toolData.name || 'بدون عنوان',
          description: toolData.description || 'بدون توضیحات',
          tool_path: toolData.tool_path || '',
          thumbnail_path: toolData.thumbnail_path
            ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${toolData.thumbnail_path}`
            : '/images/books.jpg',
          is_premium: toolData.is_premium || 0,
          category: Array.isArray(toolData.categories) ? toolData.categories.map((cat: any) => cat.name) : [],
          likes_count: Array.isArray(toolData.likes) ? toolData.likes.length : 0,
          is_liked: user && Array.isArray(toolData.likes) ? toolData.likes.some((like: any) => like.user_id === user.id) : false,
          comments_count: Array.isArray(toolData.comments) ? toolData.comments.filter((comment: any) => comment.active).length : 0,
          bookmarks_count: toolData.bookmarks_count || 0,
          comments: Array.isArray(toolData.comments) ? toolData.comments : [],
          created_at: toolData.created_at ? moment(toolData.created_at).locale('fa').format('DD MMMM YYYY') : 'نامشخص'
        }

        setTool(formattedTool)
        setError(null)
      } catch (error) {
        console.error('Error fetching tool:', error)
        setError('خطایی در دریافت اطلاعات ابزار رخ داد')
        toast.error('خطا در دریافت اطلاعات ابزار')
        router.push('/tools')
      } finally {
        setLoading(false)
      }
    }

    fetchTool()
  }, [id, router, user])

  const handleLike = async () => {
    if (!tool || isLiking || !user) {
      if (!user) toast.error('برای لایک کردن باید وارد حساب کاربری شوید')
      return
    }

    setIsLiking(true)
    try {
      const response = await likes.toggle({
        likeable_id: tool.id,
        likeable_type: 'App\\Models\\ManagementTool'
      })

      if (response.data) {
        setTool(prev => prev ? {
          ...prev,
          likes_count: prev.is_liked ? prev.likes_count - 1 : prev.likes_count + 1,
          is_liked: !prev.is_liked
        } : null)
      }
    } catch (error) {
      toast.error('خطا در ثبت لایک')
    } finally {
      setIsLiking(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('برای ارسال نظر باید وارد حساب کاربری شوید')
      return
    }
    
    if (!commentTitle.trim() || !commentContent.trim()) {
      toast.error('عنوان و محتوای نظر نمی‌تواند خالی باشد')
      return
    }
    
    if (isSubmittingComment || !tool) return
  
    setIsSubmittingComment(true)
    
    try {
      const payload = {
        title: commentTitle,
        content: commentContent,
        commentable_type: 'App\\Models\\ManagementTool',
        commentable_id: tool.id,
      }
      console.log('Submitting comment with payload:', payload)
      const response = await comments.create(payload)
      console.log('Comment API response:', response.data)

      const newComment: Comment = {
        id: response.data.id,
        user_id: user.id,
        title: response.data.title,
        content: response.data.content,
        created_at: response.data.created_at,
        active: response.data.active || false,
        user: { name: user.name || 'کاربر' },
      }

      setTool(prev => prev ? {
        ...prev,
        comments: [newComment, ...prev.comments],
        comments_count: newComment.active ? prev.comments_count + 1 : prev.comments_count
      } : null)
      
      setCommentTitle('')
      setCommentContent('')
      toast.success('نظر شما با موفقیت ارسال شد و پس از تأیید ادمین نمایش داده خواهد شد.')
    } catch (error: any) {
      console.error('Error submitting comment:', error, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      toast.error(error?.response?.data?.message || 'خطا در ارسال کامنت')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: tool?.name || 'ابزار مدیریت',
          text: (tool?.description.substring(0, 100) || 'توضیحات ابزار') + '...',
          url: window.location.href,
        })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('لینک ابزار کپی شد')
      } else {
        toast.error('متاسفانه امکان اشتراک‌گذاری در این مرورگر وجود ندارد')
      }
    } catch (error) {
      toast.error('خطا در اشتراک‌گذاری ابزار')
    }
  }

  const isLocked = tool?.is_premium === 1 && (!user || !user.is_premium)

  if (loading) {
    return <div className="p-4 text-center text-gray-500">در حال بارگذاری ابزار...</div>
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
        <button 
          onClick={() => router.push('/tools')} 
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          بازگشت به لیست ابزارها
        </button>
      </div>
    )
  }

  if (!tool) {
    return <div className="p-4 text-center text-gray-500">ابزار یافت نشد</div>
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{tool.name}</CardTitle>
          <div className="text-sm text-muted-foreground">{tool.created_at}</div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <img 
              src={tool.thumbnail_path} 
              alt={tool.name} 
              className="w-full h-48 object-cover mb-4 rounded-lg"
            />
            {tool.is_premium === 1 && (
              <span className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                پریمیوم
              </span>
            )}
          </div>

          <div className="bg-[#2B286A] px-4 py-3 flex justify-between items-start mb-4 rounded-lg">
            <div>
              <h2 className="text-white font-bold text-base">
                {tool.category.join(', ') || 'بدون دسته‌بندی'}
              </h2>
              <h3 className="text-white font-semibold text-lg mt-1">{tool.name}</h3>
              <span className="text-white text-sm">{tool.created_at}</span>
            </div>
            <div className="flex flex-col items-end">
              <button onClick={handleShare} className="text-white mb-2">
                <ShareIcon className="w-6 h-6" />
              </button>
              <div className="flex gap-4 text-white text-sm">
                <div className="flex items-center gap-1">
                  <BookmarkIcon className="w-5 h-5" />
                  <span>{toFarsiNumber(tool.bookmarks_count)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ChatBubbleLeftIcon className="w-5 h-5" />
                  <span>{toFarsiNumber(tool.comments_count)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleLike}
                    disabled={isLiking || !user}
                    className="flex items-center gap-1 transition-colors hover:text-red-500 disabled:opacity-50"
                  >
                    {tool.is_liked ? (
                      <HeartIconSolid className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                    <span>{toFarsiNumber(tool.likes_count)}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p>{tool.description}</p>
            </div>
            {tool.tool_path && (
              <div className="relative">
                {isLocked && (
                  <div className="relative">
                    <div className="blur-sm">
                      <a
                        className="bg-green-500 text-white px-4 py-2 rounded-lg inline-block opacity-50 cursor-not-allowed"
                      >
                        دانلود ابزار
                      </a>
                    </div>
                    <button
                      onClick={() => router.push('/pricing')}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                      محتوای ویژه
                    </button>
                  </div>
                )}
                {!isLocked && (
                  <a 
                    href={`${process.env.NEXT_PUBLIC_API_URL}/storage/${tool.tool_path}`}
                    download
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition inline-block"
                  >
                    دانلود ابزار
                  </a>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Comments
        comments={tool.comments.filter(comment => {
          if (user && comment.user_id === user.id) return true
          return comment.active
        })}
        commentableId={tool.id}
        commentableType= {COMMENTABLE_TYPES.MANAGEMENT_TOOL}
        onCommentAdded={(newComment) => {
          setTool(prev => prev ? {
            ...prev,
            comments: [newComment, ...prev.comments],
            comments_count: newComment.active ? prev.comments_count + 1 : prev.comments_count
          } : null)
        }}
      />
    </div>
  )
}