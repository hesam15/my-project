
'use client';

import { useEffect, useState } from 'react';
import { consultations } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAlert } from '@/contexts/AlertContext';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Consultation {
  id: number;
  title: string;
  consultant: string;
  description: string;
  license: string;
  consultation_time: number;
  active_times: string;
  thursdays_open: number;
  created_at: string;
  updated_at: string;
}

export default function ConsultationsPage() {
  const [consultationList, setConsultationList] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const response = await consultations.getAll();
      setConsultationList(response.data);
    } catch {
      showAlert('خطا در دریافت لیست مشاوره‌ها', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    try {
      await consultations.delete(selectedId);
      setConsultationList(consultationList.filter(consultation => consultation.id !== selectedId));
      showAlert('مشاوره با موفقیت حذف شد', 'success');
    } catch {
      showAlert('خطا در حذف مشاوره', 'danger');
    } finally {
      setConfirmOpen(false);
      setSelectedId(null);
    }
  };

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="grid gap-4">
        {consultationList.map((consultation) => (
          <Card key={consultation.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{consultation.title}</CardTitle>
                <div className="flex gap-2">
                  <Link href={`/consultations/${consultation.id}/edit`}>
                    <Button variant="outline" size="icon">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(consultation.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">مشاور</p>
                  <p>{consultation.consultant}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">مدرک</p>
                  <p>{consultation.license}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">زمان مشاوره</p>
                  <p>{consultation.consultation_time} دقیقه</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ساعات فعال</p>
                  <p>{consultation.active_times}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">توضیحات</p>
                  <p>{consultation.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">پنجشنبه‌ها باز است</p>
                  <p>{consultation.thursdays_open ? 'بله' : 'خیر'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button
        className="fixed bottom-20 left-4 w-12 h-12 rounded-full shadow-lg"
        onClick={() => window.location.href = '/consultations/new'}
      >
        <Plus className="h-6 w-6" />
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="آیا از حذف این مشاوره اطمینان دارید؟"
        message="این عملیات قابل بازگشت نیست."
      />
    </div>
  );
}