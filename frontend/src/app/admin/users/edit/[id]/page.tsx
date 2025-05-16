'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { users } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import axios from 'axios';

interface ValidationErrors {
  [key: string]: string[];
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: '',
    password: '',
    password_confirmation: ''
  });
  
  // State for validation errors
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await users.getOne(userId);
        setFormData({
          name: response.data.name,
          phone: response.data.phone || response.data.phon, // Handle both field names
          role: response.data.role,
          password: '',
          password_confirmation: ''
        });
      } catch (error) {
        console.log('Error fetching user:', error);
        toast.error('خطا در دریافت اطلاعات کاربر');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Clear previous errors
    setErrors({});

    // Create a copy of formData to send to the server
    const dataToSubmit = { ...formData };
    
    // Only include password fields if they are not empty
    if (!dataToSubmit.password) {
      delete dataToSubmit.password;
      delete dataToSubmit.password_confirmation;
    }

    try {
      // Use a try-catch block with axios directly to have more control
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, dataToSubmit, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true
      });
      
      toast.success('کاربر با موفقیت ویرایش شد');
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
            'خطا در ویرایش کاربر. لطفا دوباره تلاش کنید.';
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

  // Helper function to get error message for a field
  const getFieldError = (fieldName: string): string | null => {
    if (!errors) return null;
    
    // Check direct field name
    if (errors[fieldName] && errors[fieldName].length > 0) {
      return errors[fieldName][0];
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold mb-6">ویرایش کاربر</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`block w-full rounded-lg px-4 py-2.5 text-gray-900 text-sm bg-white border ${
              getFieldError('name') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            } focus:ring-2 focus:ring-inset`}
          />
          {getFieldError('name') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تلفن</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`block w-full rounded-lg px-4 py-2.5 text-gray-900 text-sm bg-white border ${
              getFieldError('phone') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            } focus:ring-2 focus:ring-inset`}
          />
          {getFieldError('phone') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('phone')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نقش</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className={`block w-full rounded-lg px-4 py-2.5 text-gray-900 text-sm bg-white border ${
              getFieldError('role') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            } focus:ring-2 focus:ring-inset`}
          >
            <option value="user">کاربر</option>
            <option value="admin">مدیر</option>
          </select>
          {getFieldError('role') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('role')}</p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="text-md font-medium mb-3">تغییر رمز عبور</h3>
          <p className="text-xs text-gray-500 mb-4">در صورتی که می‌خواهید رمز عبور را تغییر دهید، فیلدهای زیر را پر کنید. در غیر این صورت، خالی بگذارید.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور جدید</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`block w-full rounded-lg px-4 py-2.5 text-gray-900 text-sm bg-white border ${
                  getFieldError('password') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                } focus:ring-2 focus:ring-inset`}
              />
              {getFieldError('password') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تکرار رمز عبور جدید</label>
              <input
                type="password"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                className={`block w-full rounded-lg px-4 py-2.5 text-gray-900 text-sm bg-white border ${
                  getFieldError('password_confirmation') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                } focus:ring-2 focus:ring-inset`}
              />
              {getFieldError('password_confirmation') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('password_confirmation')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Display any general form errors */}
        {Object.keys(errors).length > 0 && 
          !getFieldError('name') && 
          !getFieldError('phone') && 
          !getFieldError('role') && 
          !getFieldError('password') && 
          !getFieldError('password_confirmation') && (
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