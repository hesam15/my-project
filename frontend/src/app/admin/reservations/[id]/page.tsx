// ./src/app/admin/consultations/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Correct import for App Router
import { consultations, consultationReservations } from '@/lib/api';
import { useAlert } from '@/contexts/AlertContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Consultation {
  id: number;
  title: string;
  consultant: string;
  description: string;
}

export default function ConsultationPage() {
  const router = useRouter();
  const params = useParams(); // Get dynamic route parameters
  const id = params.id; // Extract consultation ID from URL
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const response = await consultations.getById(Number(id));
        setConsultation(response.data);
      } catch {
        showAlert('خطا در دریافت اطلاعات مشاوره', 'danger');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultation();
  }, [id]);

  if (loading) {
    return <div className="text-center p-6">در حال بارگذاری...</div>;
  }

  if (!consultation) {
    return <div className="text-center p-6">مشاوره یافت نشد</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{consultation.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">مشاور: {consultation.consultant}</p>
          <p className="text-gray-700">توضیحات: {consultation.description}</p>
          <Button
            className="mt-4"
            onClick={() => router.push(`/consultations/${id}/reservations`)}
          >
            مشاهده رزروها
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}