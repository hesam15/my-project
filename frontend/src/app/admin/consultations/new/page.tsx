'use client';

import { consultations } from '@/lib/api';
import ConsultationForm from '../components/ConsultationForm';

export default function NewConsultationPage() {
  return (
    <div className="container mx-auto py-6">
      <ConsultationForm onSubmit={(data) => consultations.create(data)} />
    </div>
  );
} 