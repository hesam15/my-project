'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShareIcon, HeartIcon, ChatBubbleLeftIcon, BookmarkIcon, HeartIcon as HeartIconSolid } from '@heroicons/react/24/outline'
import { toFarsiNumber } from '@/utils/numbers'
import { useAuthContext } from '@/contexts/AuthContext'
import moment from 'jalali-moment'
import { comments } from '@/lib/api'
import Comments from '@/components/comments/Comments'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { use } from 'react'
import { toast } from 'sonner'
import { COMMENTABLE_TYPES } from '@/constants/models'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
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

interface Article {
  id: number
  title: string
  content: string
  thumbnail_path: string
  category: string[]
  date: string
  likes_count: number
  is_liked: boolean
  comments_count: number
  bookmarks_count: number
  comments: Comment[]
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user } = useAuthContext()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiking, setIsLiking] = useState(false)
  const [commentTitle, setCommentTitle] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        console.log('Fetching article with slug:', resolvedParams.slug)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${resolvedParams.slug}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Article Data:', data)

          const post = data.post || data
          if (!post) {
            throw new Error('No post data in response')
          }

          const formattedArticle: Article = {
            id: post.id,
            title: post.title || 'بدون عنوان',
            content: post.content || 'محتوای مقاله در دسترس نیست',
            thumbnail_path: post.thumbnail_path
              ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${post.thumbnail_path}`
              : '/images/books.jpg',
            category: Array.isArray(post.categories) ? post.categories.map((cat: any) => cat.name) : [],
            date: post.created_at ? moment(post.created_at).locale('fa').format('DD MMMM YYYY') : 'نامشخص',
            likes_count: Array.isArray(post.likes) ? post.likes.length : 0,
            is_liked: user && Array.isArray(post.likes) ? post.likes.some((like: any) => like.user_id === user.id) : false,
            comments_count: Array.isArray(post.comments) ? post.comments.filter((comment: any) => comment.active).length : 0,
            bookmarks_count: post.bookmarks_count || 0,
            comments: Array.isArray(post.comments) ? post.comments : [],
          }

          setArticle(formattedArticle)
          setError(null)
        } else {
          const errorData = await response.json()
          console.error('Error fetching article:', { status: response.status, data: errorData })
          setError(`خطا در بارگذاری مقاله: ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        console.error('Error fetching article:', error)
        setError('خطایی در ارتباط با سرور رخ داد')
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [resolvedParams.slug, user])

  const handleLike = async () => {
    if (!article || isLiking || !user) {
      if (!user) toast.error('برای لایک کردن باید وارد حساب کاربری شوید')
      return
    }

    setIsLiking(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          likeable_id: article.id,
          likeable_type: COMMENTABLE_TYPES.POST,
        }),
      })

      if (response.ok) {
        setArticle((prev) =>
          prev
            ? {
                ...prev,
                likes_count: prev.is_liked ? prev.likes_count - 1 : prev.likes_count + 1,
                is_liked: !prev.is_liked,
              }
            : null
        )
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'خطا در ثبت لایک')
      }
    } catch (error) {
      toast.error('خطایی رخ داد')
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
    
    if (isSubmittingComment) return
  
    setIsSubmittingComment(true)
    
    try {
      console.log('Sending comment data:', {
        title: commentTitle,
        content: commentContent,
        commentable_type: COMMENTABLE_TYPES.POST,
        commentable_id: article?.id,
      })
  
      const response = await comments.create({
        title: commentTitle,
        content: commentContent,
        commentable_type: COMMENTABLE_TYPES.POST,
        commentable_id: article!.id,
      })
  
      console.log('Comment API response:', response)
  
      if (!response?.data) {
        throw new Error('Invalid response from server')
      }
  
      const newComment: Comment = {
        id: response.data.id,
        user_id: user.id,
        title: response.data.title,
        content: response.data.content,
        created_at: response.data.created_at,
        active: response.data.active || false,
        user: { name: user.name || 'کاربر' },
      }
  
      handleCommentAdded(newComment)
      setCommentTitle('')
      setCommentContent('')
      toast.success('نظر شما با موفقیت ارسال شد و پس از تأیید ادمین نمایش داده خواهد شد.')
    } catch (error: any) {
      console.error('Error submitting comment:', error)
      
      let errorMessage = 'خطا در ارسال کامنت'
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.statusText || 'خطای سرور'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article?.title || 'مقاله',
          text: (article?.content.substring(0, 100) || 'محتوای مقاله') + '...',
          url: window.location.href,
        })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('لینک مقاله کپی شد')
      } else {
        toast.error('متاسفانه امکان اشتراک‌گذاری در این مرورگر وجود ندارد')
      }
    } catch (error) {
      toast.error('خطا در اشتراک‌گذاری مقاله')
    }
  }

  const handleCommentAdded = (newComment: Comment) => {
    setArticle((prev) =>
      prev
        ? {
            ...prev,
            comments: [newComment, ...prev.comments],
            comments_count: newComment.active ? prev.comments_count + 1 : prev.comments_count,
          }
        : null
    )
  }

  const filteredComments = article?.comments.filter((comment) => {
    if (user && comment.user_id === user.id) {
      return true
    }
    return comment.active
  }) || []

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
        <button onClick={() => router.push('/')} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          بازگشت به صفحه اصلی
        </button>
      </div>
    )
  }

  if (loading || !article) {
    return <div className="p-4 text-center text-gray-500">در حال بارگذاری مقاله...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{article.title}</CardTitle>
          <div className="text-sm text-muted-foreground">{article.date}</div>
        </CardHeader>
        <CardContent>
          <img src={article.thumbnail_path} alt={article.title} className="w-full h-48 object-cover mb-4" />
          <div className="bg-[#2B286A] px-4 py-3 flex justify-between items-start mb-4">
            <div>
              <h2 className="text-white font-bold text-lg">{article.category.join(', ') || 'بدون دسته‌بندی'}</h2>
              <span className="text-white text-sm">{article.date}</span>
            </div>
            <div className="flex flex-col items-end">
              <button onClick={handleShare} className="text-white mb-2">
                <ShareIcon className="w-6 h-6" />
              </button>
              <div className="flex gap-4 text-white text-sm">
                <div className="flex items-center gap-1">
                  <BookmarkIcon className="w-5 h-5" />
                  <span>{toFarsiNumber(article.bookmarks_count)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ChatBubbleLeftIcon className="w-5 h-5" />
                  <span>{toFarsiNumber(article.comments_count)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleLike}
                    disabled={isLiking || !user}
                    className="flex items-center gap-1 transition-colors hover:text-red-500 disabled:opacity-50"
                  >
                    {article.is_liked ? (
                      <HeartIconSolid className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                    <span>{toFarsiNumber(article.likes_count)}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="prose prose-lg max-w-none">{article.content}</div>
        </CardContent>
      </Card>
      <Comments
        comments={filteredComments}
        commentableId={article.id}
        commentableType={COMMENTABLE_TYPES.POST}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  )
}