'use client';

import { consultations } from '@/lib/api';
import ConsultationForm from '../components/ConsultationForm';

export default function NewConsultationPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">افزودن مشاوره جدید</h1>
      <ConsultationForm onSubmit={(data) => consultations.create(data)} />
    </div>
  );
} 