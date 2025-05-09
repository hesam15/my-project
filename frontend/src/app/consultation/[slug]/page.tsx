'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { StarIcon, ClockIcon } from '@heroicons/react/24/solid'
import { toPersianNumbers } from '@/utils/numbers'
import { format, parse } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { useRouter, useParams } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'

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
}

// Interface for User Data
interface UserData {
  id: number
  email: string
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

export default function ConsultantPage() {
  const router = useRouter()
  const { slug } = useParams() // استفاده از useParams به‌جای دریافت مستقیم از props
  const { user } = useAuthContext()
  const isAuthenticated = !!user
  const [consultantData, setConsultantData] = useState<ConsultantData | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy/MM/dd', { locale: faIR }))
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [reservedTimes, setReservedTimes] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const dateInputRef = useRef<HTMLInputElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  // Log auth state, selectedDate, and consultantData for debugging
  useEffect(() => {
    console.log('Auth state:', { user, isAuthenticated })
    console.log('Selected date:', selectedDate)
    console.log('Consultant data:', consultantData)
    console.log('Reserved times:', reservedTimes)
  }, [user, isAuthenticated, selectedDate, consultantData, reservedTimes])

  // Fetch consultant data
  useEffect(() => {
    const fetchConsultantData = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error('NEXT_PUBLIC_API_URL is not defined')
        }
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/consultants/${slug}`

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`خطای سرور: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()
        setConsultantData(result)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'خطای ناشناخته در بارگذاری اطلاعات مشاور'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    }

    fetchConsultantData()
  }, [slug])

  // Fetch reserved times
  useEffect(() => {
    const fetchReservedTimes = async () => {
      if (!consultantData || !selectedDate) return

      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error('NEXT_PUBLIC_API_URL is not defined')
        }
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/consultations/reserved-times?consultant_id=${consultantData.id}&date=${selectedDate}`

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`خطای سرور: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()
        setReservedTimes(result)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'خطای ناشناخته در بارگذاری زمان‌های رزرو شده'
        toast.error(errorMessage)
      }
    }

    fetchReservedTimes()
  }, [consultantData, selectedDate])

  // Initialize jalaliDatepicker and handle click outside
  useEffect(() => {
    let isMounted = true

    const initializeDatePicker = async () => {
      try {
        await import('@majidh1/jalalidatepicker')
        await import('@majidh1/jalalidatepicker/dist/jalalidatepicker.min.css')

        if (!isMounted || !dateInputRef.current) return

        const maxDate = new Date()
        maxDate.setMonth(maxDate.getMonth() + 1)
        window.jalaliDatepicker.startWatch({
          minDate: 'today',
          maxDate: format(maxDate, 'yyyy/MM/dd', { locale: faIR }),
          time: false,
          onSelect: (unix: number) => {
            if (dateInputRef.current) {
              const jalaliDate = format(new Date(unix), 'yyyy/MM/dd', { locale: faIR })
              handleDateSelect(jalaliDate)
            }
          },
        })
      } catch (err) {
        console.error('Error loading jalaliDatepicker:', err)
      }
    }

    initializeDatePicker()

    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        dateInputRef.current &&
        !dateInputRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      isMounted = false
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Initialize time slots and DatePickerManager
  useEffect(() => {
    if (!consultantData) return

    const initializeTimeSlots = () => {
      const times = generateTimeSlots()
      console.log('Generated available times:', times)
      setAvailableTimes(times)
    }

    initializeTimeSlots()

    const initializeDatePickerManager = async () => {
      try {
        const { default: DatePickerManager } = await import('@/utils/DatePickerManager')
        const manager = new DatePickerManager()
        if (dateInputRef.current) {
          manager.initializeDefaultDatePicker(dateInputRef.current)
        }
      } catch (err) {
        console.error('Error initializing DatePickerManager:', err)
      }
    }
    initializeDatePickerManager()
  }, [consultantData])

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
        consultant_id: consultantData.id,
        date: selectedDate,
        time: selectedTime,
        title: consultantData.title
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/consultations`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(reservationData)
      })

      if (!response.ok) {
        throw new Error(`خطای سرور: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      toast.success('مشاوره با موفقیت رزرو شد')
      router.push('/dashboard/consultations')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطای ناشناخته در رزرو مشاوره'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate time slots based on active_times
  const generateTimeSlots = () => {
    if (!consultantData?.active_times) return []

    const times: string[] = []
    const activeTimes = consultantData.active_times

    activeTimes.forEach((time: string) => {
      const [start, end] = time.split('-').map(t => t.trim())
      const startTime = new Date(`2000-01-01T${start}`)
      const endTime = new Date(`2000-01-01T${end}`)

      while (startTime < endTime) {
        const timeString = startTime.toLocaleTimeString('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
        times.push(timeString)
        startTime.setMinutes(startTime.getMinutes() + 30)
      }
    })

    return times
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (time: string) => {
    if (reservedTimes.includes(time)) {
      toast.error('این زمان قبلاً رزرو شده است')
      return
    }
    setSelectedTime(time)
  }

  const JalaliCalendar = () => {
    const today = new Date()
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 1)
    const [currentMonth, setCurrentMonth] = useState({
      jy: parseInt(format(today, 'yyyy', { locale: faIR })),
      jm: parseInt(format(today, 'MM', { locale: faIR })),
    })

    const daysInMonth = 31 // Adjust based on Jalali month
    const firstDayOfMonth = parse(`${currentMonth.jy}/${currentMonth.jm}/1`, 'yyyy/MM/dd', new Date(), { locale: faIR })
    const firstDayOfWeek = firstDayOfMonth.getDay()

    const days: JSX.Element[] = []

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = parse(`${currentMonth.jy}/${currentMonth.jm}/${day}`, 'yyyy/MM/dd', new Date(), { locale: faIR })
      const isDisabled =
        date < today ||
        date > maxDate ||
        (consultantData && !consultantData.thursdays_open && date.getDay() === 4)

      days.push(
        <button
          key={day}
          onClick={() => !isDisabled && handleDateSelect(format(date, 'yyyy/MM/dd', { locale: faIR }))}
          disabled={isDisabled}
          className={`h-10 flex items-center justify-center rounded-lg text-sm
            ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-100 text-gray-800'}
            ${selectedDate === format(date, 'yyyy/MM/dd', { locale: faIR }) ? 'bg-blue-500 text-white' : ''}`}
        >
          {toPersianNumbers(day.toString())}
        </button>
      )
    }

    return (
      <div ref={calendarRef} className="bg-white p-4 rounded-lg shadow-lg border border-gray-100 w-72">
        <div className="flex justify-between mb-4">
          <button
            onClick={() => setCurrentMonth((prev) => ({
              jy: prev.jm === 1 ? prev.jy - 1 : prev.jy,
              jm: prev.jm === 1 ? 12 : prev.jm - 1,
            }))}
            className="px-2 py-1 bg-gray-100 rounded"
          >
            قبلی
          </button>
          <span>{toPersianNumbers(`${currentMonth.jy}/${currentMonth.jm}`)}</span>
          <button
            onClick={() => setCurrentMonth((prev) => ({
              jy: prev.jm === 12 ? prev.jy + 1 : prev.jy,
              jm: prev.jm === 12 ? 1 : prev.jm + 1,
            }))}
            className="px-2 py-1 bg-gray-100 rounded"
          >
            بعدی
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center">
          {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day, i) => (
            <div key={i} className="text-sm font-medium text-gray-600">{day}</div>
          ))}
          {days}
        </div>
      </div>
    )
  }

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
            <div className="flex items-center gap-1">
              <StarIcon className="w-5 h-5 text-yellow-400" />
              <span>{toPersianNumbers('4.5')}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-5 h-5" />
              <span>{toPersianNumbers(consultantData.consultation_time.toString())} دقیقه</span>
            </div>
          </div>
        </div>

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

        <div className={`${!isAuthenticated ? 'opacity-50 pointer-events-none' : ''}`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">رزرو نوبت</h2>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ مراجعه</label>
            <input
              type="text"
              ref={dateInputRef}
              data-jdp
              data-jdp-only-date
              data-jdp-min-date="today"
              data-jdp-max-date={format(new Date().setMonth(new Date().getMonth() + 1), 'yyyy/MM/dd', { locale: faIR })}
              placeholder="تاریخ مدنظر خود را انتخاب کنید"
              readOnly
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              value={selectedDate ? selectedDate : ''}
            />
            {isCalendarOpen && (
              <div className="absolute z-10 mt-2 top-full left-0">
                <JalaliCalendar />
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <ClockIcon className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">ساعت مراجعه</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {availableTimes.length > 0 ? (
                availableTimes.map((time) => {
                  const isToday = selectedDate === format(new Date(), 'yyyy/MM/dd', { locale: faIR })
                  const isPastTime = isToday && compareTimes(time, format(new Date(), 'HH:mm')) <= 0
                  const isReserved = reservedTimes.includes(time)
                  const isDisabled = isPastTime || isReserved

                  return (
                    <button
                      key={time}
                      onClick={() => !isDisabled && handleTimeSelect(time)}
                      disabled={isDisabled}
                      className={`w-full py-2 rounded-lg border text-center transition-colors ${
                        isDisabled
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : selectedTime === time
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-800 border-gray-300 hover:bg-blue-50'
                      }`}
                    >
                      {time}
                    </button>
                  )
                })
              ) : (
                <div className="col-span-3 text-center text-gray-400">زمانی موجود نیست</div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'در حال رزرو...' : 'رزرو مشاوره'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}