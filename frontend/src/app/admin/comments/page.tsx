'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Trash2, Check, X, RotateCw, BookOpen, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { comments } from '@/lib/api';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Image from 'next/image';
import { useAlert } from '@/contexts/AlertContext';

interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  post?: {
    id: number;
    title: string;
    thumbnail_path?: string;
  };
  video?: {
    id: number;
    title: string;
    thumbnail_path?: string;
  };
  active: boolean;
  created_at: string;
  title?: string;
}

// Helper Components
const StatusBadge = ({ active }: { active: boolean }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
    active 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800'
  }`}>
    {active ? 'فعال' : 'غیرفعال'}
  </span>
);

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
    } catch {
      showAlert('خطا در دریافت لیست نظرات', 'danger');
      toast.error('خطا در دریافت لیست نظرات');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: boolean) => {
    setStatusLoading({id, type: status ? 'approve' : 'reject'});
    try {
      await comments.changeStatus(id.toString(), status);
      await fetchComments();
      const message = status ? 'نظر تایید شد' : 'نظر رد شد';
      showAlert(message, 'success');
      toast.success(message);
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
    } catch {
      showAlert('خطا در حذف نظر', 'danger');
      toast.error('خطا در حذف نظر');
    }
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
                      <div className="line-clamp-2 max-w-xs">{comment.content}</div>
                    </td>
                    <td className="p-4">
                      {comment.post ? (
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 rounded overflow-hidden bg-gray-100">
                            {comment.post.thumbnail_path ? (
                              <Image
                                src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${comment.post.thumbnail_path}`}
                                alt={comment.post.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <BookOpen className="w-4 h-4 text-gray-400 m-auto" />
                            )}
                          </div>
                          <span className="text-sm">مقاله: {comment.post.title}</span>
                        </div>
                      ) : comment.video ? (
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 rounded overflow-hidden bg-gray-100">
                            {comment.video.thumbnail_path ? (
                              <Image
                                src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${comment.video.thumbnail_path}`}
                                alt={comment.video.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Play className="w-4 h-4 text-gray-400 m-auto" />
                            )}
                          </div>
                          <span className="text-sm">ویدیو: {comment.video.title}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">بدون منبع</span>
                      )}
                    </td>
                    <td className="p-4">
                      {new Date(comment.created_at).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="p-4">
                      <StatusBadge active={comment.active} />
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStatusChange(comment.id, !comment.active)}
                          title={comment.active ? 'غیرفعال کردن' : 'فعال کردن'}
                          disabled={!!statusLoading}
                        >
                          {statusLoading?.id === comment.id ? (
                            <RotateCw className="h-4 w-4 animate-spin" />
                          ) : comment.active ? (
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
              
              {selectedComment.post && (
                <div className="space-y-1">
                  <span className="font-semibold text-gray-700 text-sm">مقاله:</span>
                  <div className="text-gray-900 text-base">{selectedComment.post.title}</div>
                </div>
              )}
              
              {selectedComment.video && (
                <div className="space-y-1">
                  <span className="font-semibold text-gray-700 text-sm">ویدیو:</span>
                  <div className="text-gray-900 text-base">{selectedComment.video.title}</div>
                </div>
              )}
              
              <div className="space-y-1">
                <span className="font-semibold text-gray-700 text-sm">تاریخ:</span>
                <div className="text-gray-900 text-base">
                  {new Date(selectedComment.created_at).toLocaleDateString('fa-IR')}
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
                onClick={() => handleStatusChange(selectedComment.id, false)}
              />
              <ActionButton
                variant="approve"
                loading={statusLoading?.id === selectedComment.id && statusLoading.type === 'approve'}
                onClick={() => handleStatusChange(selectedComment.id, true)}
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