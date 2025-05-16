
'use client'

import Image from 'next/image'
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { toPersianNumbers } from '@/utils/numbers'
import { useEffect, useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import moment from 'jalali-moment'
import { comments, likes } from '@/lib/api'
import Comments from '@/components/comments/Comments'
import { COMMENTABLE_TYPES } from '@/constants/models'

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

interface Article {
  id: number
  title: string
  content: string
  thumbnail_path?: string
  created_at: string
  user_id: number
  likes?: Like[]
  comments?: Comment[]
}

interface ArticleDetailProps {
  article: Article
}

export default function ArticleDetail({ article }: ArticleDetailProps) {
  // فقط کامنت‌های فعال را شمارش می‌کنیم
  const activeCommentsCount = article.comments?.filter(comment => comment.status === 'active').length || 0;
  
  const [articleData, setArticleData] = useState<Article & { 
    likes_count: number, 
    is_liked: boolean,
    comments_count: number,
    comments: Comment[]
  }>({
    ...article,
    likes_count: article.likes?.length || 0,
    is_liked: false,
    comments_count: activeCommentsCount,
    comments: article.comments || []
  })
  const [isLiking, setIsLiking] = useState(false)
  const { user } = useAuthContext()

  useEffect(() => {
    if (user && article.likes) {
      setArticleData(prev => ({
        ...prev,
        is_liked: article.likes?.some(like => like.user_id === user.id) || false
      }))
    }
  }, [user, article.likes])

  const handleLike = async () => {
    if (isLiking || !user) return

    setIsLiking(true)
    try {
      const response = await likes.toggle({
        likeable_id: article.id,
        likeable_type: 'App\\Models\\Article'
      })

      if (response.status === 200) {
        setArticleData(prev => ({
          ...prev,
          likes_count: prev.is_liked ? prev.likes_count - 1 : prev.likes_count + 1,
          is_liked: !prev.is_liked
        }))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleCommentAdded = (newComment: Comment) => {
    setArticleData(prev => ({
      ...prev,
      comments: [newComment, ...prev.comments],
      // فقط اگر کامنت فعال باشد، به تعداد کامنت‌ها اضافه می‌کنیم
      comments_count: newComment.status === 'active' ? prev.comments_count + 1 : prev.comments_count
    }))
  }

  const handleCommentStatusChanged = (commentId: number, status: 'active' | 'notActive' | 'rejected') => {
    setArticleData(prev => {
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
    })
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr || dateStr === 'undefined' || dateStr === 'null') {
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

      return parsedDate.locale('fa').format('YYYY/MM/DD')
    } catch (error) {
      console.error('Date format error:', { dateStr, error })
      return moment().locale('fa').format('YYYY/MM/DD')
    }
  }

  const getStorageUrl = (path: string | undefined) => {
    if (!path || path === 'undefined') {
      return `${process.env.NEXT_PUBLIC_API_URL}/storage/images/default-article-thumbnail.jpg`
    }
    if (path.startsWith('http')) {
      return path
    }
    return `${process.env.NEXT_PUBLIC_API_URL}/storage/${path}`
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md">
        <div className="aspect-[1.8/1] relative">
          <Image
            src={getStorageUrl(article.thumbnail_path)}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-6 space-y-4 border border-gray-100 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">{article.title}</h1>
          <div className="flex gap-4 text-gray-500">
            <button 
              onClick={handleLike}
              disabled={isLiking || !user}
              className="flex items-center gap-1 transition-colors hover:text-red-500 disabled:opacity-50"
            >
              {articleData.is_liked ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
              <span>{toPersianNumbers(articleData.likes_count)}</span>
            </button>
            <div className="flex items-center gap-1">
              <ChatBubbleLeftIcon className="w-5 h-5" />
              <span>{toPersianNumbers(articleData.comments_count)}</span>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500">{formatDate(article.created_at)}</div>
        <div className="prose max-w-none text-gray-600 leading-7" dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>

      <Comments
        comments={articleData.comments}
        commentableId={article.id}
        commentableType={COMMENTABLE_TYPES.POST}
        onCommentAdded={handleCommentAdded}
        onCommentStatusChanged={handleCommentStatusChanged}
      />
    </div>
  )
}