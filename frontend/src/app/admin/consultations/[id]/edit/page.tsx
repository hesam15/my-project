'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { consultations } from '@/lib/api';
import ConsultationForm from '../../components/ConsultationForm';
import { useAlert } from '@/contexts/AlertContext';

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

export default function EditConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchConsultation();
  }, []);

  const fetchConsultation = async () => {
    try {
      const response = await consultations.getOne(params.id);
      setConsultation(response.data);
    } catch {
      showAlert('خطا در دریافت اطلاعات مشاوره', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      await consultations.update(params.id as string, data);
      showAlert('مشاوره با موفقیت بروزرسانی شد', 'success');
      router.push('/admin/consultations');
    } catch {
      showAlert('خطا در بروزرسانی مشاوره', 'danger');
    }
  };

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  if (!consultation) {
    return <div>مشاوره مورد نظر یافت نشد</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <ConsultationForm
        consultation={consultation}
        onSubmit={handleSubmit}
      />
    </div>
  );
} 