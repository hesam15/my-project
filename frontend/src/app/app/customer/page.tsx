"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { Wallet, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

interface CustomerListProps {
  customers: Customer[];
  loading: boolean;
  error: string | null;
}

export default function CustomerDashboard() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!user || user.role !== 'customer') {
    return <div className="text-center p-8">شما به این بخش دسترسی ندارید.</div>;
  }

  // TypeScript workaround for possible backend shape
  const isPremium = (user as any).is_premium;
  const balanceAmount = (user as any).balance?.amount ?? user.balance ?? 0;

  return (
    <div className="max-w-xl mx-auto py-10 space-y-8">
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold">{user.name}</span>
            <span className="text-gray-500 text-sm">{user.phone}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Wallet className="w-5 h-5 text-green-500" />
          <span>موجودی کیف پول:</span>
          <span className="font-bold">{balanceAmount} تومان</span>
          <Button size="sm" className="ml-2" onClick={() => router.push('/wallet/charge')}>شارژ کیف پول</Button>
        </div>
      </Card>

      <Card className="p-6 flex items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <Star className={isPremium ? 'w-6 h-6 text-yellow-400' : 'w-6 h-6 text-gray-400'} />
          <span className="font-semibold">وضعیت اشتراک پریمیوم:</span>
          <span className={isPremium ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
            {isPremium ? 'فعال' : 'غیرفعال'}
          </span>
        </div>
        {!isPremium && (
          <Button color="yellow" onClick={() => router.push('/premium/buy')}>خرید اشتراک پریمیوم</Button>
        )}
        {isPremium && (
          <span className="text-green-500">شما عضو پریمیوم هستید!</span>
        )}
      </Card>
    </div>
  );
} 