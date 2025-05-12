'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // در اینجا منطق ثبت نام را پیاده‌سازی کنید
      console.log({ name, phone, password });
      // بعد از ثبت نام موفق:
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">ثبت نام کاربر جدید</CardTitle>
          <CardDescription className="text-center">
            لطفا اطلاعات خود را وارد کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">نام کامل</Label>
              <Input
                id="name"
                type="text"
                placeholder="نام و نام خانوادگی"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">شماره تلفن</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="09xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                id="password"
                type="password"
                placeholder="رمز عبور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'در حال ثبت نام...' : 'ثبت نام'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            قبلا ثبت نام کرده‌اید؟{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              وارد شوید
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}