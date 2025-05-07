'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'
import moment from 'jalali-moment'
import { toast } from 'sonner'
import { CommentableType } from '@/constants/models'

interface Comment {
  id: number
  user_id: number
  title: string
  content: string
  created_at: string
  active?: boolean
  user?: { name: string }
}

interface CommentsProps {
  comments: Comment[]
  commentableId: number
  commentableType: CommentableType
  onCommentAdded: (newComment: Comment) => void
  onCommentStatusChanged?: (commentId: number, newStatus: boolean) => void
  isAdmin?: boolean
}

export default function Comments({
  comments,
  commentableId,
  commentableType,
  onCommentAdded,
  onCommentStatusChanged,
  isAdmin = false,
}: CommentsProps) {
  const { user } = useAuthContext()
  const [commentTitle, setCommentTitle] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [changingStatus, setChangingStatus] = useState<number | null>(null)

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
      return moment().locale('fa').format('YYYY/MM/DD')
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !commentContent.trim() || !commentTitle.trim() || isSubmittingComment) {
      if (!user) toast.error('برای ارسال نظر باید وارد حساب کاربری شوید')
      if (!commentContent.trim() || !commentTitle.trim()) toast.error('عنوان و محتوای نظر نمی‌تواند خالی باشد')
      return
    }

    setIsSubmittingComment(true)
    try {
      const payload = {
        title: commentTitle,
        content: commentContent,
        commentable_type: commentableType,
        commentable_id: commentableId,
      }
      console.log('Submitting comment with payload:', payload)

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        credentials: 'include',
      })

      const responseData = await response.json()
      console.log('Comment API response:', responseData)

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`)
      }

      const newComment: Comment = {
        id: responseData.id,
        user_id: user.id,
        title: responseData.title,
        content: responseData.content,
        created_at: responseData.created_at || new Date().toISOString(),
        active: responseData.active ?? false,
        user: { name: user.name || 'کاربر' },
      }
      onCommentAdded(newComment)
      setCommentTitle('')
      setCommentContent('')
      toast.success('نظر شما با موفقیت ارسال شد و پس از تأیید ادمین نمایش داده خواهد شد.')
    } catch (error: any) {
      console.error('Detailed error submitting comment:', error, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      })
      toast.error(error.message || 'خطا در ارسال کامنت. لطفاً دوباره تلاش کنید.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleStatusChange = async (commentId: number, currentStatus: boolean) => {
    if (!isAdmin || changingStatus === commentId) return

    setChangingStatus(commentId)
    try {
      console.log('Changing status for comment:', commentId, 'to:', !currentStatus)

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${commentId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ active: !currentStatus }),
        credentials: 'include',
      })

      const responseData = await response.json()
      console.log('Status change API response:', responseData)

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`)
      }

      onCommentStatusChanged?.(commentId, !currentStatus)
      toast.success('وضعیت نظر با موفقیت تغییر کرد')
    } catch (error: any) {
      console.error('Error changing comment status:', error, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      })
      toast.error(error.message || 'خطا در تغییر وضعیت نظر')
    } finally {
      setChangingStatus(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">نظرات</h2>
      {user ? (
        <form onSubmit={handleCommentSubmit} className="mb-6 space-y-4">
          <input
            type="text"
            value={commentTitle}
            onChange={(e) => setCommentTitle(e.target.value)}
            placeholder="عنوان نظر"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            disabled={isSubmittingComment}
          />
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="نظر خود را بنویسید..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 resize-y"
            rows={4}
            disabled={isSubmittingComment}
          />
          <button
            type="submit"
            disabled={isSubmittingComment || !commentContent.trim() || !commentTitle.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {isSubmittingComment ? 'در حال ارسال...' : 'ارسال نظر'}
          </button>
        </form>
      ) : (
        <p className="text-gray-600 mb-6">
          برای ارسال نظر باید{' '}
          <Link href="/login" className="text-blue-500 hover:underline">
            وارد حساب کاربری
          </Link>{' '}
          خود شوید.
        </p>
      )}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={`${comment.id}-${index}`} className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-800">{comment.title}</h3>
                  <p className="text-xs text-gray-500">{comment.user?.name || 'کاربر ناشناس'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      onClick={() => handleStatusChange(comment.id, comment.active || false)}
                      disabled={changingStatus === comment.id}
                      className={`px-2 py-1 text-xs rounded-full ${
                        comment.active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      } transition-colors disabled:opacity-50`}
                    >
                      {changingStatus === comment.id
                        ? 'در حال تغییر...'
                        : comment.active
                        ? 'فعال'
                        : 'غیرفعال'}
                    </button>
                  )}
                  <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-6">{comment.content}</p>
              {!comment.active && user?.id === comment.user_id && (
                <p className="text-xs text-yellow-600 mt-2">
                  نظر شما در حال بررسی توسط ادمین‌ها می‌باشد.
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-sm">هنوز نظری ثبت نشده است.</p>
        )}
      </div>
    </div>
  )
}