'use client';

import Image from 'next/image';
import { toPersianNumbers } from '@/utils/numbers';
import { useAuthContext } from '@/contexts/AuthContext';

export default function WalletSection() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <h2 className="text-lg font-bold text-gray-800">کیف پول</h2>
        <div className="w-[98%] mx-auto h-[70px] bg-[#AAA9C7] rounded-xl flex items-center justify-center">
          <span className="text-white text-lg">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isCustomer = user?.role === 'customer';

  if (!isCustomer) {
    return null;
  }

  const balanceAmount = user.balance.amount;

  return (
    <div className="w-full space-y-4">
      <h2 className="text-lg font-bold text-gray-800">کیف پول</h2>
      <div className="w-[98%] mx-auto h-[70px] bg-[#AAA9C7] rounded-xl relative overflow-hidden flex items-center justify-between px-6">
        <div className="relative w-16 h-16 opacity-50">
          <Image
            src="/images/wallet.png"
            alt="کیف پول"
            fill
            className="object-contain rotate-[-19deg]"
          />
        </div>
        <span className="text-white text-2xl font-bold">
          {toPersianNumbers(balanceAmount)} تومان
        </span>
      </div>
    </div>
  );
}