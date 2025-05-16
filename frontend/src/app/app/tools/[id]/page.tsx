'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { managementTools, likes, comments } from '@/lib/api'
import { useAuthContext } from '@/contexts/AuthContext'
import { ShareIcon, HeartIcon, ChatBubbleLeftIcon, BookmarkIcon, HeartIcon as HeartIconSolid } from '@heroicons/react/24/outline'
import { toFarsiNumber } from '@/utils/numbers'
import moment from 'jalali-moment'
import Comments from '@/components/comments/Comments'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { COMMENTABLE_TYPES } from '@/constants/models'
import { useAlert } from '@/contexts/AlertContext'
import { getImageUrl } from '@/utils/images'

interface Comment {
  id: number
  user_id: number
  title: string
  content: string
  created_at: string
  status: 'active' | 'notActive' | 'rejected'
  user?: { name: string }
}

interface Tool {
  id: number;
  name: string;
  title: string;
  description: string;
  thumbnail_path: string;
  tool_path?: string;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
  category?: string[];
  likes_count: number;
  comments_count: number;
  bookmarks_count: number;
  is_liked?: boolean;
  comments?: Comment[];
}

interface ToolPageProps {
  params: {
    id: string;
  };
}

export default function ToolPage({ params }: ToolPageProps) {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuthContext()
  const [tool, setTool] = useState<Tool | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiking, setIsLiking] = useState(false)
  const [commentTitle, setCommentTitle] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const { showAlert } = useAlert()

  useEffect(() => {
    const fetchTool = async () => {
      try {
        setLoading(true)
        const response = await managementTools.getOne(id as string)
        
        if (!response.data) {
          throw new Error('No tool data in response')
        }

        const toolData = response.data
        // Ensure comments is always an array
        if (!toolData.comments) {
          toolData.comments = [];
        }
        setTool(toolData)
      } catch (error: any) {
        setError(error.message || 'خطا در دریافت اطلاعات ابزار')
        showAlert(error.message || 'خطا در دریافت اطلاعات ابزار', 'danger')
      } finally {
        setLoading(false)
      }
    }

    fetchTool()
  }, [id, showAlert])

  const handleLike = async () => {
    if (!tool || isLiking || !user) {
      if (!user) showAlert('برای لایک کردن باید وارد حساب کاربری شوید', 'danger')
      return
    }
    setIsLiking(true)
    try {
      const response = await likes.toggle({
        likeable_id: tool.id,
        likeable_type: COMMENTABLE_TYPES.MANAGEMENT_TOOL,
      })
      if (response.data) {
        setTool((prev) =>
          prev
            ? {
                ...prev,
                likes_count: prev.is_liked ? prev.likes_count - 1 : prev.likes_count + 1,
                is_liked: !prev.is_liked,
              }
            : null
        )
        showAlert(tool.is_liked ? 'لایک حذف شد' : 'ابزار لایک شد', 'success')
      }
    } catch (error) {
      showAlert('خطا در ثبت لایک', 'danger')
    } finally {
      setIsLiking(false)
    }
  }

  console.log(tool);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentTitle.trim() || !commentContent.trim()) {
      showAlert('لطفا عنوان و محتوای نظر را وارد کنید', 'danger')
      return
    }

    setIsSubmittingComment(true)
    try {
      const payload = {
        title: commentTitle,
        content: commentContent,
        commentable_id: tool?.id,
        commentable_type: COMMENTABLE_TYPES.MANAGEMENT_TOOL
      }

      const response = await comments.create(payload)
      const newComment = response.data

      setTool(prev => prev ? {
        ...prev,
        comments: [newComment, ...(prev.comments || [])],
        comments_count: (prev.comments_count || 0) + 1
      } : null)

      setCommentTitle('')
      setCommentContent('')
      showAlert('نظر شما با موفقیت ثبت شد', 'success')
    } catch (error) {
      showAlert('خطا در ثبت نظر', 'danger')
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
        showAlert('لینک ابزار کپی شد', 'success')
      } else {
        showAlert('متاسفانه امکان اشتراک‌گذاری در این مرورگر وجود ندارد', 'danger')
      }
    } catch (error) {
      showAlert('خطا در اشتراک‌گذاری ابزار', 'danger')
    }
  }

  const isLocked = tool?.is_premium && (!user || !user.is_premium)

  if (loading) {
    return <div className="p-4 text-center text-gray-500">در حال بارگذاری ابزار...</div>
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
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
          <CardTitle>{tool.name || tool.title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {moment(tool.created_at).locale('fa').format('YYYY/MM/DD')}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <img 
              src={getImageUrl(tool.thumbnail_path, 'tool')} 
              alt={tool.name || tool.title || 'تصویر ابزار'} 
              className="w-full h-48 object-cover mb-4 rounded-lg"
            />
            {tool.is_premium && (
              <span className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                پریمیوم
              </span>
            )}
          </div>

          <div className="bg-[#2B286A] px-4 py-3 flex justify-between items-start mb-4 rounded-lg">
            <div>
              <h3 className="text-white font-semibold text-lg mt-1">{tool.name || tool.title}</h3>
              <span className="text-white text-sm">
                {moment(tool.created_at).locale('fa').format('YYYY/MM/DD')}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <button onClick={handleShare} className="text-white mb-2">
                <ShareIcon className="w-6 h-6" />
              </button>
              <div className="flex gap-4 text-white text-sm">
                <div className="flex items-center gap-1">
                  <ChatBubbleLeftIcon className="w-5 h-5" />
                  <span>{toFarsiNumber(tool.comments_count || 0)}</span>
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
                    <span>{toFarsiNumber(tool.likes_count || 0)}</span>
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

      <div className="mt-6">
        <Comments
          comments={tool.comments || []}
          commentableId={tool.id}
          commentableType={COMMENTABLE_TYPES.MANAGEMENT_TOOL}
          onCommentAdded={(newComment) => {
            setTool(prev => prev ? {
              ...prev,
              comments: [newComment, ...(prev.comments || [])],
              comments_count: (prev.comments_count || 0) + 1
            } : null)
          }}
        />
      </div>
    </div>
  )
}