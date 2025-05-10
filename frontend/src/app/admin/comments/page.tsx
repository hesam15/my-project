'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Trash2, Check, X, RotateCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { comments } from '@/lib/api';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAlert } from '@/contexts/AlertContext';

interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
  };
  post?: {
    id: number;
    title: string;
  };
  video?: {
    id: number;
    title: string;
  };
  active: boolean;
  created_at: string;
  title?: string;
}

// Helper Components
const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="font-semibold text-gray-700 text-sm">{children}</span>
);

const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="space-y-1">
    <Label>{label}:</Label>
    <div className="text-gray-900 text-base">{value}</div>
  </div>
);

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
  const [statusLoading, setStatusLoading] = useState<'approve' | 'reject' | null>(null);
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
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: boolean, loadingType: 'approve' | 'reject') => {
    setStatusLoading(loadingType);
    try {
      await comments.changeStatus(id.toString(), status);
      await fetchComments();
      showAlert(status ? 'نظر تایید شد.' : 'نظر رد شد.', 'success');
    } catch {
      showAlert('خطا در تغییر وضعیت نظر', 'danger');
    } finally {
      setStatusLoading(null);
    }
  };

  const handleDelete = (id: number) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    try {
      await comments.delete(selectedId);
      setCommentList(commentList.filter(comment => comment.id !== selectedId));
      showAlert('نظر با موفقیت حذف شد', 'success');
    } catch {
      showAlert('خطا در حذف نظر', 'danger');
    } finally {
      setConfirmOpen(false);
      setSelectedId(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4 p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4 h-20" />
          ))}
        </div>
      );
    }

    if (commentList.length === 0) {
      return (
        <div className="text-center p-6 text-gray-500">
          هیچ نظری یافت نشد
        </div>
      );
    }

    return (
      <div className="grid gap-4 p-4">
        {commentList.map((comment) => (
          <Card key={comment.id} className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.user.name}</span>
                  <StatusBadge active={comment.active} />
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString('fa-IR')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedComment(comment);
                    setModalOpen(true);
                  }}
                  className="h-10 w-10"
                >
                  <Eye className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    handleDelete(comment.id);
                  }}
                  className="h-10 w-10 text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <p className="text-gray-700 line-clamp-2">{comment.content}</p>
            
            {comment.post && (
              <p className="text-sm text-blue-600">مقاله: {comment.post.title}</p>
            )}
            {comment.video && (
              <p className="text-sm text-green-600">ویدیو: {comment.video.title}</p>
            )}
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full px-0">
      {renderContent()}

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
              <InfoItem label="کاربر" value={selectedComment.user.name} />
              
              {selectedComment.post && (
                <InfoItem label="مقاله" value={selectedComment.post.title} />
              )}
              
              {selectedComment.video && (
                <InfoItem label="ویدیو" value={selectedComment.video.title} />
              )}
              
              <InfoItem 
                label="تاریخ" 
                value={new Date(selectedComment.created_at).toLocaleDateString('fa-IR')} 
              />
              
              <InfoItem 
                label="عنوان" 
                value={selectedComment.title || <span className="text-gray-400">بدون عنوان</span>}
              />
              
              <div>
                <Label>متن:</Label>
                <p className="whitespace-pre-line text-justify leading-6 mt-1">
                  {selectedComment.content}
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t p-4 flex flex-col sm:flex-row gap-2">
              <ActionButton
                variant="reject"
                loading={statusLoading === 'reject'}
                onClick={() => handleStatusChange(selectedComment.id, false, 'reject')}
              />
              <ActionButton
                variant="approve"
                loading={statusLoading === 'approve'}
                onClick={() => handleStatusChange(selectedComment.id, true, 'approve')}
              />
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        message="آیا از حذف دائمی این نظر اطمینان دارید؟"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}