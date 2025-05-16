
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface ValidationErrors {
  [key: string]: string[];
}

export default function NewUser() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: 'customer',
    is_premium: false
  });

  // Helper function to get error message for a field
  const getFieldError = (fieldName: string): string | null => {
    if (!errors) return null;
    
    // Check direct field name
    if (errors[fieldName] && errors[fieldName].length > 0) {
      return errors[fieldName][0];
    }
    
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
      
      if (name === 'is_premium') {
        setIsPremium(checked);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    // Clear previous errors
    setErrors({});

    const dataToSubmit = {
      ...formData,
      is_premium: isPremium
    };

    try {
      // Use axios for better error handling
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, dataToSubmit, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true
      });
      
      toast.success('کاربر با موفقیت ایجاد شد');
      router.push('/admin/users');
    } catch (error) {
      // Handle axios errors properly
      if (axios.isAxiosError(error)) {
        // This is an axios error
        const response = error.response;
        
        if (response && response.status === 422) {
          // Validation error
          let validationErrors: ValidationErrors = {};
          
          // Parse validation errors based on response structure
          if (response.data.errors) {
            validationErrors = response.data.errors;
          } else if (response.data.details) {
            validationErrors = response.data.details;
          } else if (typeof response.data === 'object' && response.data !== null) {
            // Try to extract errors from the response data
            Object.entries(response.data).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                validationErrors[key] = value;
              } else if (typeof value === 'string') {
                validationErrors[key] = [value];
              }
            });
          }
          
          setErrors(validationErrors);
          
          // Show error message
          const errorMessage = response.data.message || 'لطفاً خطاهای فرم را برطرف کنید';
          toast.error(errorMessage);
          
          // Log for debugging
          console.log('Validation errors:', validationErrors);
        } else {
          // Other API error
          const errorMessage = 
            response?.data?.message || 
            'خطا در ایجاد کاربر. لطفا دوباره تلاش کنید.';
          toast.error(errorMessage);
          console.log('API error:', response?.data);
        }
      } else {
        // Not an axios error
        toast.error('خطا در ارتباط با سرور. لطفا دوباره تلاش کنید.');
        console.log('Unknown error:', error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full px-0">
      <form onSubmit={handleSubmit} className="space-y-4 mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-6">ایجاد کاربر جدید</h2>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            نام
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-inset ${
              getFieldError('name') 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-primary'
            }`}
          />
          {getFieldError('name') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            شماره موبایل
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-inset ${
              getFieldError('phone') 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-primary'
            }`}
          />
          {getFieldError('phone') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('phone')}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            رمز عبور
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-inset ${
              getFieldError('password') 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-primary'
            }`}
          />
          {getFieldError('password') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
          )}
        </div>

        <div>
          <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
            تکرار رمز عبور
          </label>
          <input
            type="password"
            id="password_confirmation"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            required
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-inset ${
              getFieldError('password_confirmation') 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-primary'
            }`}
          />
          {getFieldError('password_confirmation') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('password_confirmation')}</p>
          )}
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            نقش کاربر
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-inset ${
              getFieldError('role') 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-primary'
            }`}
          >
            <option value="customer">کاربر عادی</option>
            <option value="admin">مدیر</option>
          </select>
          {getFieldError('role') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('role')}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="is_premium" className="block text-sm font-medium text-gray-700 mb-1">
            پریمیوم
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out">
              <input
                type="checkbox"
                id="is_premium"
                name="is_premium"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  isPremium ? 'bg-green-500' : 'bg-gray-300'
                } appearance-none cursor-pointer`}
              />
              <span
                className={`absolute inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  isPremium ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </div>
            <span className={isPremium ? 'text-green-500' : 'text-gray-500'}>
              {isPremium ? 'فعال' : 'غیرفعال'}
            </span>
          </div>
          {getFieldError('is_premium') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('is_premium')}</p>
          )}
        </div>

        {/* Display any general form errors */}
        {Object.keys(errors).length > 0 && 
          !getFieldError('name') && 
          !getFieldError('phone') && 
          !getFieldError('role') && 
          !getFieldError('password') && 
          !getFieldError('password_confirmation') &&
          !getFieldError('is_premium') && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="font-medium">خطاهای اعتبارسنجی:</p>
            <ul className="mt-1 list-disc list-inside text-sm">
              {Object.entries(errors).map(([field, messages]) => (
                <li key={field}>
                  {field}: {Array.isArray(messages) ? messages[0] : messages}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-6 mt-6 border-t border-gray-200">
          <Button 
            type="submit" 
            variant="default"
            loading={submitting}
            loadingText="در حال ذخیره..."
          >
            ذخیره تغییرات
          </Button>
        </div>
      </form>
    </div>
  );
}