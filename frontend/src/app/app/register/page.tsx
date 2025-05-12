'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/Alert';
import type { RegisterCredentials } from '@/types/auth';

export default function Register() {
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState<RegisterCredentials>({
    name: '',
    phone: '',
    password: '',
    password_confirmation: ''
  });
  const [validationError, setValidationError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // فقط اعداد را قبول کن
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length <= 11) {
        setFormData(prev => ({
          ...prev,
          [name]: numericValue
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // پاک کردن خطاها هنگام تایپ
    setValidationError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setValidationError('نام و نام خانوادگی الزامی است');
      return false;
    }
    
    // اعتبارسنجی شماره تلفن (باید 11 رقم باشد و با 09 شروع شود)
    const phoneRegex = /^09[0-9]{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setValidationError('لطفا یک شماره موبایل معتبر وارد کنید (مثال: 09123456789)');
      return false;
    }

    if (formData.password.length < 8) {
      setValidationError('رمز عبور باید حداقل ۸ کاراکتر باشد');
      return false;
    }
    if (formData.password !== formData.password_confirmation) {
      setValidationError('رمز عبور و تکرار آن مطابقت ندارند');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!validateForm()) return;

    try {
      await register(formData);
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  const displayError = validationError || error;

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          ایجاد حساب کاربری
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {displayError && (
            <Alert variant="error" className="mb-6">
              {displayError}
            </Alert>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              id="name"
              name="name"
              type="text"
              label="نام و نام خانوادگی"
              required
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              autoComplete="name"
            />

            <Input
              id="phone"
              name="phone"
              type="tel"
              label="شماره موبایل"
              required
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              autoComplete="tel"
              dir="ltr"
              placeholder="09123456789"
              className="text-left"
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="رمز عبور"
              required
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
              dir="ltr"
            />

            <Input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              label="تکرار رمز عبور"
              required
              value={formData.password_confirmation}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
              dir="ltr"
            />

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={loading}
              loading={loading}
            >
              {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  یا
                </span>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/90"
              >
                با حساب کاربری خود وارد شوید
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
