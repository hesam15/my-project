
'use client'
    
import { useState, useEffect, useRef, Suspense } from 'react'
import Image from 'next/image'
import { StarIcon, ClockIcon } from '@heroicons/react/24/solid'
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { format, parse } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { useRouter, useParams } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import jalaliday from 'jalaliday'
import "@majidh1/jalalidatepicker/dist/jalalidatepicker.min.css";
import { useAlert } from '@/contexts/AlertContext'
import { toPersianNumbers } from '@/utils/numbers'
import moment from 'jalali-moment'
import { comments, likes } from '@/lib/api'
import Comments from '@/components/comments/Comments'
import { COMMENTABLE_TYPES } from '@/constants/models'

dayjs.extend(jalaliday);

// Interface for Comment
interface Comment {
  id: number
  user_id: number
  title: string
  content: string
  created_at: string
  status: 'active' | 'notActive' | 'rejected'
  user?: { name: string }
}

// Interface for Like
interface Like {
  user_id: number
  likable_type: string
  likable_id: number
}

// Interface for Consultant Data
interface ConsultantData {
  id: number
  title: string
  consultant: string
  description: string
  license: string
  consultation_time: number // e.g., 60 (minutes)
  active_times: string // e.g., "8:00-22:00"
  thursdays_open: number // 1 for true, 0 for false
  created_at: string
  updated_at: string
  likes?: Like[]
  comments?: Comment[]
}

// Interface for User Data
interface UserData {
  id: number
  name?: string
}

// Declare jalaliDatepicker globally
declare global {
  interface Window {
    jalaliDatepicker: any
  }
}

// Helper to clean date string (remove unexpected characters like dots)
const cleanDateString = (dateStr: string): string => {
  console.log('Cleaning date string:', dateStr)
  const cleaned = dateStr.replace(/[^0-9/]/g, '')
  console.log('Cleaned date string:', cleaned)
  return cleaned
}

// Add type for JalaliDateInput props
interface JalaliDateInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  minDate?: string;
  maxDate?: string;
  onlyDate?: boolean;
  onlyTime?: boolean;
  placeholder?: string;
}

const JalaliDateInput = ({ value, onChange, minDate = "today", maxDate, onlyDate = true, onlyTime = false, placeholder = "تاریخ را انتخاب کنید" }: JalaliDateInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initializeDatePicker = async () => {
      try {
        await import('@majidh1/jalalidatepicker');
        if (window.jalaliDatepicker && inputRef.current) {
          window.jalaliDatepicker.startWatch({
            minDate,
            maxDate,
            time: !onlyDate,
          });

          // Add input event listener
          const input = inputRef.current;
          const handleInputChange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            console.log('Input value changed:', target.value);
            const event = {
              target: { value: target.value }
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(event);
          };

          input.addEventListener('input', handleInputChange);

          // Cleanup
          return () => {
            input.removeEventListener('input', handleInputChange);
          };
        }
      } catch (err) {
        console.error('Error loading jalaliDatepicker:', err);
      }
    };

    initializeDatePicker();
  }, [minDate, maxDate, onlyDate, onChange]);

  return (
    <input
      ref={inputRef}
      type="text"
      data-jdp
      data-jdp-only-date={onlyDate ? true : undefined}
      data-jdp-only-time={onlyTime ? true : undefined}
      data-jdp-min-date={minDate}
      data-jdp-max-date={maxDate}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      readOnly
      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
    />
  );
};

// Fix for the CSS import error (should be in a separate .d.ts file, but for now):
declare module '@majidh1/jalalidatepicker/dist/jalalidatepicker.min.css';

// Reusable date/time picker component
interface ConsultationDateTimePickerProps {
  consultantId: number;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;
  minDate?: string;
  maxDate?: string;
  onTimeReserved?: (time: string) => void;
  thursdays_open?: number;
}

const ConsultationDateTimePicker = ({
  consultantId,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  minDate = 'today',
  maxDate = '1403/12/29',
  onTimeReserved,
  thursdays_open,
}: ConsultationDateTimePickerProps) => {
  const [timeButtons, setTimeButtons] = useState<{ time: string; disabled: boolean }[]>([]);
  const [reservedTimes, setReservedTimes] = useState<string[]>([]);
  const { showAlert } = useAlert();

  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate, setSelectedTime]);

  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (!consultantId || !selectedDate) {
        setTimeButtons([]);
        setReservedTimes([]);
        return;
      }
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/reservations/available-times/${consultantId}?date=${selectedDate}`;
        const response = await fetch(url, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        let message = '';
        try {
          const data = await response.clone().json();
          if (data && data.message) message = data.message;
        } catch {}
        if (response.ok && message) showAlert(message, 'success');
        else if (response.status >= 400 && response.status < 500 && message) showAlert(message, 'info');
        else if (response.status >= 500) showAlert('خطای سرور! لطفا بعدا تلاش کنید.', 'danger');
        const result = await response.json();
        let times: string[] = [];
        // تشخیص امروز بودن تاریخ انتخابی
        const [jy, jm, jd] = selectedDate.split('/').map(Number);
        const todayJalali = dayjs().calendar('jalali');
        const isToday = jy === todayJalali.year() && jm === todayJalali.month() + 1 && jd === todayJalali.date();
        if (isToday) {
          times = [
            ...(Array.isArray(result.lastTimes) ? result.lastTimes : []),
            ...(Array.isArray(result.availabelTimes)
              ? result.availabelTimes
              : Object.values(result.availabelTimes || {})),
          ];
        } else {
          times = Array.isArray(result.availabelTimes)
            ? result.availabelTimes
            : Object.values(result.availabelTimes || {});
        }
        setTimeButtons(
          times.map((time: string) => ({
            time,
            disabled: (result.reservedTimes || []).includes(time),
          }))
        );
        setReservedTimes(result.reservedTimes || []);
        setSelectedTime(null);
      } catch (error) {
        setTimeButtons([]);
        setReservedTimes([]);
        setSelectedTime(null);
      }
    };
    fetchAvailableTimes();
  }, [consultantId, selectedDate, setSelectedTime, showAlert]);

  return (
    <>
      <div className="relative mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ مراجعه</label>
        <JalaliDateInput
          value={selectedDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
          minDate={minDate}
          maxDate={maxDate}
          onlyDate
        />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ClockIcon className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">ساعت مراجعه</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {timeButtons.length > 0 ? (
            timeButtons.map(({ time, disabled }) => (
              <button
                type="button"
                key={time}
                onClick={() => {
                  if (!disabled) {
                    setSelectedTime(time);
                    if (onTimeReserved) onTimeReserved(time);
                  }
                }}
                disabled={disabled}
                className={`w-full py-2 rounded-lg border text-center transition-colors ${
                  selectedTime === time
                    ? 'bg-blue-500 text-white border-blue-500'
                    : disabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-blue-50'
                }`}
              >
                {time}
              </button>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-400">زمانی موجود نیست</div>
          )}
        </div>
      </div>
    </>
  );
};

function ConsultantPageContent() {
  const router = useRouter()
  const { slug } = useParams()
  const { user } = useAuthContext()
  const isAuthenticated = !!user
  const [consultantData, setConsultantData] = useState<ConsultantData | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const { showAlert } = useAlert();
  const [timeButtons, setTimeButtons] = useState<{ time: string; disabled: boolean }[]>([]);
  const [isLiking, setIsLiking] = useState(false)
  
  // State for consultation data with additional properties
  const [consultationData, setConsultationData] = useState<{
    likes_count: number,
    is_liked: boolean,
    comments_count: number,
    comments: Comment[]
  }>({
    likes_count: 0,
    is_liked: false,
    comments_count: 0,
    comments: []
  })

  // Set selectedDate from jalalidatepicker input on mount if empty
  useEffect(() => {
    if (!selectedDate) {
      const input = document.querySelector('input[data-jdp]') as HTMLInputElement | null;
      if (input && input.value) {
        setSelectedDate(input.value);
      }
    }
  }, [selectedDate]);

  // Fetch consultant data
  useEffect(() => {
    const fetchConsultantData = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error('NEXT_PUBLIC_API_URL is not defined')
        }
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/consultations/${slug}`
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
        let message = '';
        try {
          const data = await response.clone().json();
          if (data && data.message) message = data.message;
        } catch {}
        if (response.ok && message) showAlert(message, 'success');
        else if (response.status >= 400 && response.status < 500 && message) showAlert(message, 'info');
        else if (response.status >= 500) showAlert('خطای سرور! لطفا بعدا تلاش کنید.', 'danger');
        const result = await response.json()
        setConsultantData(result)
        
        // Initialize consultation data with comments and likes
        const activeCommentsCount = result.comments?.filter((comment: Comment) => comment.status === 'active').length || 0;
        setConsultationData({
          likes_count: result.likes?.length || 0,
          is_liked: false,
          comments_count: activeCommentsCount,
          comments: result.comments || []
        })
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'خطای ناشناخته در بارگذاری اطلاعات مشاور'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    }
    fetchConsultantData()
  }, [slug, showAlert])
  
  // Check if user has liked the consultation
  useEffect(() => {
    if (user && consultantData?.likes) {
      setConsultationData(prev => ({
        ...prev,
        is_liked: consultantData.likes?.some(like => like.user_id === user.id) || false
      }))
    }
  }, [user, consultantData?.likes])

  // Handle like toggle
  const handleLike = async () => {
    if (isLiking || !user || !consultantData) return

    setIsLiking(true)
    try {
      const response = await likes.toggle({
        likeable_id: consultantData.id,
        likeable_type: COMMENTABLE_TYPES.MANAGEMENT_TOOL
      })

      if (response.status === 200) {
        setConsultationData(prev => ({
          ...prev,
          likes_count: prev.is_liked ? prev.likes_count - 1 : prev.likes_count + 1,
          is_liked: !prev.is_liked
        }))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setIsLiking(false)
    }
  }

  // Handle comment added
  const handleCommentAdded = (newComment: Comment) => {
    setConsultationData(prev => ({
      ...prev,
      comments: [newComment, ...prev.comments],
      // Only increment comment count if the comment is active
      comments_count: newComment.status === 'active' ? prev.comments_count + 1 : prev.comments_count
    }))
  }

  // Handle comment status changed
  const handleCommentStatusChanged = (commentId: number, status: 'active' | 'notActive' | 'rejected') => {
    setConsultationData(prev => {
      const updatedComments = prev.comments.map(comment => 
        comment.id === commentId ? { ...comment, status } : comment
      );
      
      // Recalculate active comments count
      const newActiveCommentsCount = updatedComments.filter(comment => comment.status === 'active').length;
      
      return {
        ...prev,
        comments: updatedComments,
        comments_count: newActiveCommentsCount
      };
    })
  }

  // Format date for display
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr || dateStr === 'undefined' || dateStr === 'null') {
      return moment().locale('fa').format('YYYY/MM/DD')
    }

    try {
      let parsedDate = moment(dateStr, [
        'YYYY-MM-DDTHH:mm:ss.SSSSSSZ',
        'YYYY-MM-DDTHH:mm:ssZ',
        'YYYY-MM-DD',
      ], true)

      if (!parsedDate.isValid()) {
        throw new Error('Invalid date format')
      }

      return parsedDate.locale('fa').format('YYYY/MM/DD')
    } catch (error) {
      console.error('Date format error:', { dateStr, error })
      return moment().locale('fa').format('YYYY/MM/DD')
    }
  }

  // Handle reservation submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('برای رزرو مشاوره باید وارد حساب کاربری شوید')
      router.push('/login')
      return
    }

    if (!selectedTime || !consultantData) {
      toast.error('لطفا زمان مشاوره را انتخاب کنید')
      return
    }

    setIsSubmitting(true)
    try {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error('NEXT_PUBLIC_API_URL is not defined')
      }

      const reservationData = {
        consultation_id: consultantData.id,
        date: selectedDate,
        time: selectedTime,
        user_id: user.id,
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(reservationData)
      })
      
      if (!response.ok) {
        throw new Error('خطا در رزرو مشاوره')
      }

      // آپدیت وضعیت دکمه‌های ساعت
      setTimeButtons(prev => 
        prev.map(button => 
          button.time === selectedTime 
            ? { ...button, disabled: true }
            : button
        )
      );

      let message = '';
      try {
        const data = await response.json();
        if (data && data.message) message = data.message;
      } catch {}

      if (message) {
        showAlert(message, 'success');
      } else {
        showAlert('رزرو با موفقیت انجام شد', 'success');
      }

      // ریدایرکت به صفحه پروفایل و رفرش
      window.location.reload();
      router.push('/profile');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطای ناشناخته در رزرو مشاوره'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleTimeReserved = (time: string) => {
    setTimeButtons(prev => 
      prev.map(button => 
        button.time === time 
          ? { ...button, disabled: true }
          : button
      )
    );
  };

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="bg-red-50 text-red-600 border border-red-100 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-lg font-medium">{error}</p>
          <button
            onClick={() => {
              setError(null)
              window.location.reload()
            }}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    )
  }

  if (!consultantData) {
    return <div className="text-center py-10">در حال بارگذاری...</div>
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md">
        <div className="aspect-[1.8/1] relative">
          <Image
            src="/images/books.jpg"
            alt={consultantData.title}
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 space-y-4 border border-gray-100 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">{consultantData.title}</h1>
          <div className="flex gap-4 text-gray-500">
            <button 
              onClick={handleLike}
              disabled={isLiking || !user}
              className="flex items-center gap-1 transition-colors hover:text-red-500 disabled:opacity-50"
            >
              {consultationData.is_liked ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
              <span>{toPersianNumbers(consultationData.likes_count)}</span>
            </button>
            <div className="flex items-center gap-1">
              <ChatBubbleLeftIcon className="w-5 h-5" />
              <span>{toPersianNumbers(consultationData.comments_count)}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-5 h-5" />
              <span>{toPersianNumbers(consultantData.consultation_time)} دقیقه</span>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500">{formatDate(consultantData.created_at)}</div>

        <div className="border-t border-gray-100 pt-4">
          <h2 className="font-bold text-gray-800 mb-2">مشاور</h2>
          <div className="space-y-1">
            <p className="text-gray-800">{consultantData.consultant}</p>
            <p className="text-sm text-gray-600">{consultantData.license}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h2 className="font-bold text-gray-800 mb-2">توضیحات</h2>
          <p className="text-gray-600 whitespace-pre-line leading-7">{consultantData.description}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md relative">
        {!isAuthenticated && (
          <div className="absolute inset-0 bg-gray-200 bg-opacity-70 rounded-2xl flex items-center justify-center z-10 backdrop-blur-sm">
            <button
              onClick={() => {
                console.log('Login button clicked, redirecting to /login')
                router.push('/login')
              }}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md font-semibold focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 pointer-events-auto"
            >
              برای رزرو ابتدا لاگین کنید
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className={`${!isAuthenticated ? 'opacity-50 pointer-events-none' : ''}`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">رزرو نوبت</h2>
          <ConsultationDateTimePicker
            consultantId={consultantData?.id}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            thursdays_open={consultantData?.thursdays_open}
          />
          <button
            type="submit"
            disabled={isSubmitting || !selectedTime}
            className="w-full mt-6 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'در حال ثبت...' : 'ثبت رزرو'}
          </button>
        </form>
      </div>

      {/* Comments Section */}
      <Comments
        comments={consultationData.comments}
        commentableId={consultantData.id}
        commentableType={COMMENTABLE_TYPES.CONSULTATION}
        onCommentAdded={handleCommentAdded}
        onCommentStatusChanged={handleCommentStatusChanged}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConsultantPageContent />
    </Suspense>
  );
}