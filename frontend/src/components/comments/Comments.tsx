'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'
import moment from 'jalali-moment'
import { CommentableType } from '@/constants/models'
import { useAlert } from '@/contexts/AlertContext'
import { comments } from '@/lib/api'

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
  onCommentAdded: (comment: Comment) => void
  onCommentStatusChanged?: (commentId: number, active: boolean) => void
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

      const response = await comments.create(payload)
      const responseData = response.data

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
      showAlert('نظر شما با موفقیت ارسال شد و پس از تأیید ادمین نمایش داده خواهد شد.', 'success')
    } catch (error: any) {
      showAlert(error.message || 'خطا در ارسال نظر', 'danger')
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
      showAlert('وضعیت نظر با موفقیت تغییر کرد', 'success')
    } catch (error: any) {
      console.error('Error changing comment status:', error, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      })
      showAlert(error.message || 'خطا در تغییر وضعیت نظر', 'danger')
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
            <div key={`