
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Upload } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  is_premium?: boolean; // Added premium status to Course interface
}

interface ValidationErrors {
  [key: string]: string[];
}

export default function NewVideoPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, []);

  // Helper function to get error message for a field
  const getFieldError = (fieldName: string): string | null => {
    if (!errors) return null;
    
    // Check direct field name
    if (errors[fieldName] && errors[fieldName].length > 0) {
      return errors[fieldName][0];
    }
    
    return null;
  };

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // دریافت لیست دوره‌ها
        const coursesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`, {
          credentials: 'include',
        });
        if (!coursesResponse.ok) throw new Error('خطا در دریافت لیست دوره‌ها');
        const coursesData = await coursesResponse.json();
        setCourses(coursesData);
      } catch (err) {
        console.error('خطا در دریافت اطلاعات', err);
        toast.error('خطا در دریافت لیست دوره‌ها');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Handle thumbnail file change
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    // Clean up previous preview URL if it exists
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    
    if (file) {
      setThumbnail(file);
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
    } else {
      setThumbnail(null);
      setThumbnailPreview(null);
    }
  };

  // Handle video file change
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    // Clean up previous preview URL if it exists
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    
    if (file) {
      setVideo(file);
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
    } else {
      setVideo(null);
      setVideoPreview(null);
    }
  };

  // Handle course selection change
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = parseInt(e.target.value);
    if (!isNaN(courseId)) {
      const course = courses.find(c => c.id === courseId) || null;
      setSelectedCourse(course);
      
      // If course is premium, automatically set video to premium
      if (course?.is_premium) {
        setIsPremium(true);
      }
    } else {
      setSelectedCourse(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitting(true);
    // Clear previous errors
    setErrors({});

    try {
      const formData = new FormData();
      
      // Get form data from the form elements
      const formElements = e.currentTarget.elements as HTMLFormControlsCollection;
      const titleInput = formElements.namedItem('title') as HTMLInputElement;
      const descriptionInput = formElements.namedItem('description') as HTMLTextAreaElement;
      const courseIdInput = formElements.namedItem('course_id') as HTMLSelectElement;
      
      formData.append('title', titleInput.value);
      formData.append('description', descriptionInput.value);
      formData.append('is_premium', isPremium ? '1' : '0');
      formData.append('course_id', courseIdInput.value);
      
      // Add thumbnail if selected
      if (thumbnail) {
        formData.append('thumbnail_path', thumbnail);
      }
      
      // Add video if selected
      if (video) {
        formData.append('video_path', video);
      }

      // Use axios for better error handling
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/videos`, formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      toast.success('ویدیو با موفقیت ایجاد شد');
      router.push('/videos');
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
            'خطا در ایجاد ویدیو. لطفا دوباره تلاش کنید.';
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
    <div className="space-y-6 w-full px-0 py-6">
      <form onSubmit={handleSubmit} className="space-y-4 mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-6">افزودن ویدیو جدید</h2>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            عنوان ویدیو
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-inset ${
              getFieldError('title') 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-primary'
            }`}
          />
          {getFieldError('title') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('title')}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            توضیحات
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-inset ${
              getFieldError('description') 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-primary'
            }`}
          />
          {getFieldError('description') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('description')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            فایل ویدیو
          </label>
          
          {/* Show video preview if a video is selected */}
          {videoPreview && (
            <video 
              src={videoPreview} 
              controls 
              className="w-full max-h-[300px] rounded-md mb-2" 
            />
          )}
          
          <div className="flex items-center gap-2 mt-2">
            <label 
              htmlFor="video_path" 
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>انتخاب فایل ویدیو</span>
            </label>
            <input
              type="file"
              id="video_path"
              name="video_path"
              accept="video/*"
              onChange={handleVideoChange}
              required
              className="hidden"
            />
            {video && (
              <span className="text-sm text-green-600">
                {video.name} ({(video.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            )}
          </div>
          
          {getFieldError('video_path') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('video_path')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            تصویر بندانگشتی
          </label>
          
          {/* Show thumbnail preview if available */}
          {thumbnailPreview && (
            <div className="mt-2 mb-4">
              <div className="relative w-48 h-32 overflow-hidden rounded-md">
                <Image
                  src={thumbnailPreview}
                  alt="پیش‌نمایش تصویر"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            <label 
              htmlFor="thumbnail_path" 
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>انتخاب تصویر</span>
            </label>
            <input
              type="file"
              id="thumbnail_path"
              name="thumbnail_path"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
            />
            {thumbnail && (
              <span className="text-sm text-green-600">
                {thumbnail.name}
              </span>
            )}
          </div>
          
          {getFieldError('thumbnail_path') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('thumbnail_path')}</p>
          )}
        </div>

        <div>
          <label htmlFor="course_id" className="block text-sm font-medium text-gray-700 mb-1">
            دوره مربوطه
          </label>
          <select
            id="course_id"
            name="course_id"
            required
            onChange={handleCourseChange}
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-inset ${
              getFieldError('course_id') 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-primary'
            }`}
          >
            <option value="">انتخاب دوره</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title} {course.is_premium ? '(پریمیوم)' : ''}
              </option>
            ))}
          </select>
          {getFieldError('course_id') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('course_id')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="is_premium">پریمیوم</Label>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              id="is_premium"
              checked={isPremium}
              onCheckedChange={setIsPremium}
              disabled={selectedCourse?.is_premium}
            />
            <span className={isPremium ? 'text-green-500' : 'text-gray-500'}>
              {isPremium ? 'فعال' : 'غیرفعال'}
            </span>
            {selectedCourse?.is_premium && (
              <span className="mr-2 text-xs text-blue-600">
                (دوره انتخاب شده پریمیوم است)
              </span>
            )}
          </div>
          {getFieldError('is_premium') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('is_premium')}</p>
          )}
        </div>

        {/* Display any general form errors */}
        {Object.keys(errors).length > 0 && 
          !getFieldError('title') && 
          !getFieldError('description') && 
          !getFieldError('course_id') && 
          !getFieldError('video_path') && 
          !getFieldError('thumbnail_path') && 
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
            افزودن ویدیو
          </Button>
        </div>
      </form>
    </div>
  );
}
