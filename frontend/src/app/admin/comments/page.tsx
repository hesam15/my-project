'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Trash2, Check, X, RotateCw, BookOpen, Play, Wrench, PhoneCall, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { comments } from '@/lib/api';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Image from 'next/image';
import { useAlert } from '@/contexts/AlertContext';

interface Commentable {
  id: number;
  title: string;
  thumbnail_path?: string;
  content?: string;
  name?: string; // For tools and consultations that might use name instead of title
}

interface Comment {
  id: number;
  title: string;
  content: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  commentable_type: string;
  commentable_id: number;
  commentable?: Commentable;
  status: 'active' | 'notActive' | 'rejected';
  created_at: string;
}

// Helper Components
const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    active: {
      className: 'bg-green-100 text-green-800',
      text: 'فعال'
    },
    notActive: {
      className: 'bg-yellow-100 text-yellow-800',
      text: 'در انتظار تایید'
    },
    rejected: {
      className: 'bg-red-100 text-red-800',
      text: 'رد شده'
    }
  }[status as 'active' | 'notActive' | 'rejected'] || {
    className: 'bg-gray-100 text-gray-800',
    text: 'نامشخص'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.text}
    </span>
  );
};

const ActionButton = ({ 
  variant,
  loading,
  onClick
}: {
  variant: 'approve' | 'reject';
  loading: boolean;
  onClick: () => void;
}) => {
  const config = {
    approve: {
      text: 'تایید',
      loadingText: 'در حال تایید...',
      className: 'bg-green-100 hover:bg-green-200 text-green-700',
      icon: <Check size={18} />,
    },
    reject: {
      text: 'رد',
      loadingText: 'در حال رد...',
      className: 'bg-red-100 hover:bg-red-200 text-red-700',
      icon: <X size={18} />,
    }
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all
        duration-200 flex items-center justify-center gap-2 ${config.className} 
        ${loading ? 'opacity-70' : ''}`}
    >
      {loading ? (
        <RotateCw className="animate-spin" size={18} />
      ) : (
        <>
          {config.icon}
          {config.text}
        </>
      )}
    </button>
  );
};

export default function CommentsPage() {
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState<{id: number, type: 'approve'|'reject'}|null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await comments.getAll();
      setCommentList(response.data);
      
      // Check for pending comments and notify
      const pendingComments = response.data.filter(comment => comment.status === 'notActive');
      if (pendingComments.length > 0) {
        toast.warning(`${pendingComments.length} نظر در انتظار تایید وجود دارد`);
      }
      
      // Check for rejected comments and notify
      const rejectedComments = response.data.filter(comment => comment.status === 'rejected');
      if (rejectedComments.length > 0) {
        toast.error(`${rejectedComments.length} نظر رد شده وجود دارد`);
      }
    } catch {
      showAlert('خطا در دریافت لیست نظرات', 'danger');
      toast.error('خطا در دریافت لیست نظرات');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: 'active' | 'notActive' | 'rejected') => {
    setStatusLoading({id, type: status === 'active' ? 'approve' : 'reject'});
    try {
      // Pass the string status directly to the API
      await comments.changeStatus(id.toString(), status);
      
      if (status === 'active') {
        showAlert('نظر با موفقیت تایید شد', 'success');
        toast.success('نظر با موفقیت تایید شد');
      } else if (status === 'rejected') {
        showAlert('نظر رد شد', 'info');
        toast.warning('نظر رد شد');
      } else {
        showAlert('وضعیت نظر تغییر کرد', 'info');
        toast.info('وضعیت نظر تغییر کرد');
      }
      
      await fetchComments();
    } catch {
      showAlert('خطا در تغییر وضعیت نظر', 'danger');
      toast.error('خطا در تغییر وضعیت نظر');
    } finally {
      setStatusLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await comments.delete(id);
      setCommentList(commentList.filter(comment => comment.id !== id));
      showAlert('نظر با موفقیت حذف شد', 'success');
      toast.success('نظر با موفقیت حذف شد');
      
      // Check if this was the last comment
      if (commentList.length === 1) {
        toast.info('تمام نظرات مدیریت شدند');
      }
    } catch {
      showAlert('خطا در حذف نظر', 'danger');
      toast.error('خطا در حذف نظر');
    }
  };

  const getNextStatus = (currentStatus: string) => {
    if (currentStatus === 'active') return 'rejected';
    return 'active';
  };

  // Helper function to determine the commentable type
  const getCommentableType = (comment: Comment) => {
    if (!comment.commentable_type) return null;
    
    const type = comment.commentable_type.toLowerCase();
    if (type.includes('post')) return 'post';
    if (type.includes('video')) return 'video';
    if (type.includes('managementtool')) return 'tool';
    if (type.includes('consultation')) return 'consultation';
    if (type.includes('course')) return 'course';
    return null;
  };

  // Helper function to get the title of the commentable
  const getCommentableTitle = (comment: Comment) => {
    if (!comment.commentable) return 'بدون عنوان';
    
    // Some entities use title, others use name
    return comment.commentable.title || comment.commentable.name || 'بدون عنوان';
  };

  // Helper function to render the appropriate icon and text for commentable
  const renderCommentableInfo = (comment: Comment) => {
    if (!comment.commentable) return <span className="text-sm text-gray-500">بدون منبع</span>;
    
    const type = getCommentableType(comment);
    const title = getCommentableTitle(comment);
    
    if (type === 'post') {
      return (
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded overflow-hidden bg-gray-100">
            {comment.commentable.thumbnail_path ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${comment.commentable.thumbnail_path}`}
                alt={title}
                fill
                className="object-cover"
              />
            ) : (
              <BookOpen className="w-4 h-4 text-gray-400 m-auto" />
            )}
          </div>
          <span className="text-sm">مقاله: {title}</span>
        </div>
      );
    } else if (type === 'video') {
      return (
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded overflow-hidden bg-gray-100">
            {comment.commentable.thumbnail_path ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${comment.commentable.thumbnail_path}`}
                alt={title}
                fill
                className="object-cover"
              />
            ) : (
              <Play className="w-4 h-4 text-gray-400 m-auto" />
            )}
          </div>
          <span className="text-sm">ویدیو: {title}</span>
        </div>
      );
    } else if (type === 'tool') {
      return (
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded overflow-hidden bg-gray-100">
            {comment.commentable.thumbnail_path ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${comment.commentable.thumbnail_path}`}
                alt={title}
                fill
                className="object-cover"
              />
            ) : (
              <Wrench className="w-4 h-4 text-gray-400 m-auto" />
            )}
          </div>
          <span className="text-sm">ابزار مدیریتی: {title}</span>
        </div>
      );
    } else if (type === 'consultation') {
      return (
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded overflow-hidden bg-gray-100">
            {comment.commentable.thumbnail_path ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${comment.commentable.thumbnail_path}`}
                alt={title}
                fill
                className="object-cover"
              />
            ) : (
              <PhoneCall className="w-4 h-4 text-gray-400 m-auto" />
            )}
          </div>
          <span className="text-sm">مشاوره: {title}</span>
        </div>
      );
    } else if (type === 'course') {
      return (
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded overflow-hidden bg-gray-100">
            {comment.commentable.thumbnail_path ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${comment.commentable.thumbnail_path}`}
                alt={title}
                fill
                className="object-cover"
              />
            ) : (
              <GraduationCap className="w-4 h-4 text-gray-400 m-auto" />
            )}
          </div>
          <span className="text-sm">دوره: {title}</span>
        </div>
      );
    }
    
    return <span className="text-sm text-gray-500">منبع نامشخص</span>;
  };

  if (loading) {
    return (
      <div className="text-center p-6">
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right p-4">کاربر</th>
                <th className="text-right p-4">محتوا</th>
                <th className="text-right p-4">مرتبط با</th>
                <th className="text-right p-4">تاریخ</th>
                <th className="text-right p-4">وضعیت</th>
                <th className="text-right p-4">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {commentList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-500">
                    هیچ نظری یافت نشد
                  </td>
                </tr>
              ) : (
                commentList.map((comment) => (
                  <tr key={comment.id} className="border-b">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          {comment.user.avatar ? (
                            <Image
                              src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${comment.user.avatar}`}
                              alt={comment.user.name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-lg font-medium text-gray-400">
                              {comment.user.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span>{comment.user.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="line-clamp-2 max-w-xs">
                        <span className="font-medium text-gray-700 block mb-1">{comment.title}</span>
                        {comment.content}
                      </div>
                    </td>
                    <td className="p-4">
                      {renderCommentableInfo(comment)}
                    </td>
                    <td className="p-4">
                      {new Date(comment.created_at).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={comment.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStatusChange(comment.id, getNextStatus(comment.status) as 'active' | 'notActive' | 'rejected')}
                          title={comment.status === 'active' ? 'رد کردن' : 'تایید کردن'}
                          disabled={!!statusLoading}
                        >
                          {statusLoading?.id === comment.id ? (
                            <RotateCw className="h-4 w-4 animate-spin" />
                          ) : comment.status === 'active' ? (
                            <X className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedId(comment.id);
                            setConfirmOpen(true);
                          }}
                          title="حذف"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedComment(comment);
                            setModalOpen(true);
                          }}
                          title="مشاهده جزئیات"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Comment Details Modal */}
      {modalOpen && selectedComment && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
          <div className="w-full max-h-[90vh] bg-white rounded-t-2xl shadow-2xl flex flex-col sm:max-w-md sm:rounded-2xl sm:mx-4">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">جزئیات نظر</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 text-2xl p-2 -mr-2 hover:text-gray-700"
                aria-label="بستن"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-1">
                <span className="font-semibold text-gray-700 text-sm">کاربر:</span>
                <div className="text-gray-900 text-base">{selectedComment.user.name}</div>
              </div>
              
              {selectedComment.commentable && (
                <div className="space-y-1">
                  <span className="font-semibold text-gray-700 text-sm">
                    {getCommentableType(selectedComment) === 'post' ? 'مقاله:' : 
                     getCommentableType(selectedComment) === 'video' ? 'ویدیو:' :
                     getCommentableType(selectedComment) === 'tool' ? 'ابزار مدیریتی:' :
                     getCommentableType(selectedComment) === 'consultation' ? 'مشاوره:' :
                     getCommentableType(selectedComment) === 'course' ? 'دوره:' : 'منبع:'}
                  </span>
                  <div className="text-gray-900 text-base">{getCommentableTitle(selectedComment)}</div>
                </div>
              )}
              
              <div className="space-y-1">
                <span className="font-semibold text-gray-700 text-sm">تاریخ:</span>
                <div className="text-gray-900 text-base">
                  {new Date(selectedComment.created_at).toLocaleDateString('fa-IR')}
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="font-semibold text-gray-700 text-sm">وضعیت:</span>
                <div className="text-gray-900 text-base">
                  <StatusBadge status={selectedComment.status} />
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="font-semibold text-gray-700 text-sm">عنوان:</span>
                <div className="text-gray-900 text-base">
                  {selectedComment.title || <span className="text-gray-400">بدون عنوان</span>}
                </div>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700 text-sm">متن:</span>
                <p className="whitespace-pre-line text-justify leading-6 mt-1">
                  {selectedComment.content}
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t p-4 flex flex-col sm:flex-row gap-2">
              <ActionButton
                variant="reject"
                loading={statusLoading?.id === selectedComment.id && statusLoading.type === 'reject'}
                onClick={() => handleStatusChange(selectedComment.id, 'rejected')}
              />
              <ActionButton
                variant="approve"
                loading={statusLoading?.id === selectedComment.id && statusLoading.type === 'approve'}
                onClick={() => handleStatusChange(selectedComment.id, 'active')}
              />
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        message="آیا از حذف این نظر اطمینان دارید؟"
        onConfirm={() => {
          if (selectedId) {
            handleDelete(selectedId);
            setConfirmOpen(false);
          }
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}