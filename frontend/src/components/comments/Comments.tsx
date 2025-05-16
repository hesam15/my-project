'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'
import moment from 'jalali-moment'
import { CommentableType } from '@/constants/models'
import { useAlert } from '@/contexts/AlertContext'
import { comments as commentsApi } from '@/lib/api'

interface Comment {
  id: number
  user_id: number
  title: string
  content: string
  created_at: string
  status: 'active' | 'notActive' | 'rejected'
  user?: { name: string }
}

interface CommentsProps {
  comments: Comment[]
  commentableId: number
  commentableType: CommentableType
  onCommentAdded: (comment: Comment) => void
  onCommentStatusChanged?: (commentId: number, status: 'active' | 'notActive' | 'rejected') => void
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
  const { showAlert } = useAlert()

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
      if (!user) showAlert('برای ارسال نظر باید وارد حساب کاربری شوید', 'danger')
      if (!commentContent.trim() || !commentTitle.trim()) showAlert('عنوان و محتوای نظر نمی‌تواند خالی باشد', 'danger')
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

      const response = await commentsApi.create(payload)
      const responseData = response.data

      const newComment: Comment = {
        id: responseData.id,
        user_id: user.id,
        title: commentTitle,
        content: commentContent,
        created_at: responseData.created_at || new Date().toISOString(),
        status: responseData.status || 'notActive',
        user: { name: user.name || 'کاربر' },
      }
      onCommentAdded(newComment)
      setCommentTitle('')
      setCommentContent('')
      showAlert('نظر شما با موفقیت ارسال شد و پس از تأیید ادمین نمایش داده خواهد شد.', 'success')
    } catch (error: any) {
      showAlert(error.message || 'خطا در ارسال نظر', 'danger')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleStatusChange = async (commentId: number, currentStatus: string) => {
    if (!isAdmin || changingStatus === commentId) return

    setChangingStatus(commentId)
    try {
      // Toggle between active and rejected
      const newStatus = currentStatus === 'active' ? 'rejected' : 'active'
      const response = await commentsApi.changeStatus(commentId.toString(), newStatus)

      if (response.status !== 200) {
        throw new Error('خطا در تغییر وضعیت نظر')
      }

      onCommentStatusChanged?.(commentId, newStatus)
      
      if (newStatus === 'active') {
        showAlert('نظر با موفقیت فعال شد', 'success')
      } else {
        showAlert('نظر با موفقیت غیرفعال شد', 'warning')
      }
    } catch (error: any) {
      console.error('Error changing comment status:', error)
      showAlert(error.message || 'خطا در تغییر وضعیت نظر', 'danger')
    } finally {
      setChangingStatus(null)
    }
  }

  // فیلتر کردن کامنت‌ها برای نمایش
  const filteredComments = comments.filter(comment => 
    comment.status === 'active' || // کامنت‌های فعال
    (user && comment.user_id === user.id) || // کامنت‌های خود کاربر
    isAdmin // همه کامنت‌ها برای ادمین
  )

  // تعیین کلاس‌های CSS براساس وضعیت نظر
  const getCommentClasses = (status: string) => {
    switch(status) {
      case 'active':
        return 'border-gray-200 bg-white';
      case 'rejected':
        return 'border-red-100 bg-red-50';
      case 'notActive':
      default:
        return 'border-gray-100 bg-gray-50';
    }
  }

  // نمایش پیام وضعیت برای کاربر
  const getStatusMessage = (comment: Comment) => {
    if (user?.id === comment.user_id) {
      if (comment.status === 'notActive') {
        return <p className="text-sm text-yellow-600 mt-2">این نظر در انتظار تأیید است و فقط برای شما قابل مشاهده است</p>;
      } else if (comment.status === 'rejected') {
        return <p className="text-sm text-red-600 mt-2">این نظر رد شده است و فقط برای شما قابل مشاهده است</p>;
      }
    }
    return null;
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
        {filteredComments.length > 0 ? (
          filteredComments.map((comment, index) => (
            <div 
              key={comment.id || index} 
              className={`p-4 border rounded-lg ${index < comments.length - 1 ? 'mb-4' : ''} ${getCommentClasses(comment.status)}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{comment.user?.name || 'کاربر'}</h3>
                  <p className="text-sm text-gray-500">{formatDate(comment.created_at)}</p>
                </div>
                {isAdmin && onCommentStatusChanged && (
                  <button
                    onClick={() => handleStatusChange(comment.id, comment.status)}
                    disabled={changingStatus === comment.id}
                    className={`px-3 py-1 text-sm rounded-md ${
                      comment.status === 'active' 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-green-100 text-green-600'
                    } hover:opacity-80 transition-opacity disabled:opacity-50`}
                  >
                    {changingStatus === comment.id ? (
                      'در حال تغییر...'
                    ) : comment.status === 'active' ? (
                      'غیرفعال کردن'
                    ) : (
                      'فعال کردن'
                    )}
                  </button>
                )}
              </div>
              <h4 className="font-semibold text-gray-700 mt-2">{comment.title}</h4>
              <p className="text-gray-600 mt-1 whitespace-pre-line">{comment.content}</p>
              {getStatusMessage(comment)}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">هنوز نظری ثبت نشده است</p>
        )}
      </div>
    </div>
  )
}