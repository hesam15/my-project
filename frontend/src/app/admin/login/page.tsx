'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner'; // یا کتابخانه toast دیگر

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuthContext();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({ phone, password });
      toast.success('ورود با موفقیت انجام شد');
      router.push('/');
    } catch (error) {
      toast.error('ورود ناموفق بود. لطفا اطلاعات را بررسی کنید');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">ورود به حساب کاربری</CardTitle>
          <CardDescription className="text-center">
            لطفا شماره تلفن و رمز عبور خود را وارد کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">شماره تلفن</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="09xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'در حال ورود...' : 'ورود'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            حساب کاربری ندارید؟{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              ثبت نام کنید
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}