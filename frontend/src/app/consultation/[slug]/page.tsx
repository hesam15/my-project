'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { StarIcon, ClockIcon } from '@heroicons/react/24/solid'
import { toPersianNumbers } from '@/utils/numbers'
import moment from 'moment-jalaali'
import 'moment/locale/fa'
import { format } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'

// Interface for Consultant Data
interface ConsultantData {
  id: number
  title: string
  description: string
  duration: number
  rating: number
  date: string
  image: string
  consultant: {
    name: string
    expertise: string
    experience: string
  }
  active_times: {
    start: string // e.g., "09:00"
    end: string // e.g., "17:00"
    duration: number // duration of each session in minutes
  }
  thursdays_open: boolean
}

// Temporary data (replace with API call)
const consultantData: ConsultantData = {
  id: 1,
  title: 'مشاوره مدیریت منابع انسانی',
  description: `با بهره‌گیری از مشاوران متخصص در زمینه منابع انسانی، به شما کمک می‌کنیم تا تیم خود را به بهترین شکل مدیریت کنید.

در این جلسه مشاوره، موارد زیر بررسی خواهد شد:
- ارزیابی وضعیت فعلی تیم و شناسایی نقاط قوت و ضعف
- ارائه راهکارهای عملی برای بهبود عملکرد تیم
- برنامه‌ریزی برای توسعه مهارت‌های کارکنان
- طراحی سیستم ارزیابی عملکرد موثر
- مشاوره در زمینه جذب و نگهداشت نیروهای کلیدی`,
  duration: 60,
  rating: 4.5,
  date: '۱۴۰۲/۰۸/۲۵',
  image: '/images/books.jpg',
  consultant: {
    name: 'دکتر محمدی',
    expertise: 'متخصص مدیریت منابع انسانی',
    experience: '15 سال تجربه'
  },
  active_times: {
    start: '09:00',
    end: '17:00',
    duration: 60
  },
  thursdays_open: false
}

export default function ConsultantPage({ params }: { params: { slug: string } }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const dateInputRef = useRef<HTMLInputElement>(null)

  // Initialize DatePickerManager after jalaliDatepicker is loaded
  useEffect(() => {
    const initializeDatePicker = async () => {
      if (typeof window !== 'undefined') {
        // Wait for jalaliDatepicker to be available
        const checkJalaliDatepicker = () => {
          return new Promise((resolve) => {
            if (typeof window.jalaliDatepicker !== 'undefined') {
              resolve(true)
            } else {
              const interval = setInterval(() => {
                if (typeof window.jalaliDatepicker !== 'undefined') {
                  clearInterval(interval)
                  resolve(true)
                }
              }, 100)
            }
          })
        }

        await checkJalaliDatepicker()
        const { default: DatePickerManager } = await import('@/utils/DatePickerManager')
        const manager = new DatePickerManager()
        if (dateInputRef.current) {
          manager.initializeDefaultDatePicker()
        }
      }
    }
    initializeDatePicker()
  }, [])

  // Generate time slots based on active_times
  const generateTimeSlots = (date: Date) => {
    const times: string[] = []
    const { start, end, duration } = consultantData.active_times
    
    const startHour = parseInt(start.split(':')[0])
    const startMinute = parseInt(start.split(':')[1])
    const endHour = parseInt(end.split(':')[0])
    const endMinute = parseInt(end.split(':')[1])

    let currentTime = new Date(date)
    currentTime.setHours(startHour, startMinute, 0)

    const endTime = new Date(date)
    endTime.setHours(endHour, endMinute, 0)

    while (currentTime <= endTime) {
      const timeString = format(currentTime, 'HH:mm', { locale: faIR })
      times.push(timeString)
      currentTime.setMinutes(currentTime.getMinutes() + duration)
    }

    return times
  }

  // Handle date selection
  const handleDateSelect = (dateString: string) => {
    const momentDate = moment(dateString, 'jYYYY/jMM/jDD')
    if (!momentDate.isValid()) return

    const gregorianDate = momentDate.toDate()
    const formattedDate = format(gregorianDate, 'yyyy/MM/dd', { locale: faIR })
    setSelectedDate(formattedDate)
    setAvailableTimes(generateTimeSlots(gregorianDate))
    setIsCalendarOpen(false)
  }

  // Custom Jalali Calendar Component
  const JalaliCalendar = () => {
    moment.locale('fa')
    const today = moment()
    const maxDate = moment().add(1, 'jMonth')
    const [currentMonth, setCurrentMonth] = useState({
      jy: today.jYear(),
      jm: today.jMonth() + 1
    })

    const daysInMonth = moment.jDaysInMonth(currentMonth.jy, currentMonth.jm - 1)
    const firstDayOfMonth = moment(`${currentMonth.jy}/${currentMonth.jm}/1`, 'jYYYY/jMM/jDD')
    const firstDayOfWeek = firstDayOfMonth.day()

    const days: JSX.Element[] = []
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = moment(`${currentMonth.jy}/${currentMonth.jm}/${day}`, 'jYYYY/jMM/jDD')
      const gregorianDate = date.toDate()
      
      const isDisabled = 
        date.isBefore(today, 'day') || // Past dates
        date.isAfter(maxDate, 'day') || // More than 1 month in future
        (!consultantData.thursdays_open && date.day() === 4) // Thursdays (day 4 in moment-jalaali)

      days.push(
        <button
          key={day}
          onClick={() => !isDisabled && handleDateSelect(`${currentMonth.jy}/${String(currentMonth.jm).padStart(2, '0')}/${String(day).padStart(2, '0')}`)}
          disabled={isDisabled}
          className={`h-10 flex items-center justify-center rounded-lg text-sm
            ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-100 text-gray-800'}
            ${selectedDate === format(gregorianDate, 'yyyy/MM/dd', { locale: faIR }) ? 'bg-blue-500 text-white' : ''}`}
        >
          {toPersianNumbers(day)}
        </button>
      )
    }

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
        <div className="flex justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(prev => ({
              jy: prev.jm === 1 ? prev.jy - 1 : prev.jy,
              jm: prev.jm === 1 ? 12 : prev.jm - 1
            }))}
            className="px-2 py-1 bg-gray-100 rounded"
          >
            قبلی
          </button>
          <span>{toPersianNumbers(`${currentMonth.jy}/${currentMonth.jm}`)}</span>
          <button
            onClick={() => setCurrentMonth(prev => ({
              jy: prev.jm === 12 ? prev.jy + 1 : prev.jy,
              jm: prev.jm === 12 ? 1 : prev.jm + 1
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

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      {/* Consultant Info Section */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md">
        <div className="aspect-[1.8/1] relative">
          <Image
            src={consultantData.image}
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
              <span>{toPersianNumbers(consultantData.rating)}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-5 h-5" />
              <span>{toPersianNumbers(consultantData.duration)} دقیقه</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-4">
          <h2 className="font-bold text-gray-800 mb-2">مشاور</h2>
          <div className="space-y-1">
            <p className="text-gray-800">{consultantData.consultant.name}</p>
            <p className="text-sm text-gray-600">{consultantData.consultant.expertise}</p>
            <p className="text-sm text-gray-600">{consultantData.consultant.experience}</p>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-4">
          <h2 className="font-bold text-gray-800 mb-2">توضیحات</h2>
          <p className="text-gray-600 whitespace-pre-line leading-7">{consultantData.description}</p>
        </div>
      </div>

      {/* Reservation Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">رزرو نوبت</h2>
        
        {/* Date Selection */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تاریخ مراجعه
          </label>
          <input
            type="text"
            ref={dateInputRef}
            data-jdp
            placeholder="تاریخ مدنظر خود را انتخاب کنید"
            readOnly
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            value={selectedDate ? toPersianNumbers(selectedDate) : ''}
          />
          {isCalendarOpen && (
            <div className="absolute z-10 mt-2">
              <JalaliCalendar />
            </div>
          )}
        </div>

        {/* Time Slots */}
        <div data-time-slots-container className={`mt-6 ${selectedDate ? '' : 'hidden'}`}>
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">ساعت مراجعه</h3>
          </div>
          
          <div data-time-slots-grid className="grid grid-cols-3 gap-3">
            {availableTimes.length > 0 ? (
              availableTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 px-4 rounded-lg text-sm border
                    ${selectedTime === time 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'border-gray-300 hover:bg-blue-50 text-gray-700'}`}
                >
                  {toPersianNumbers(time)}
                </button>
              ))
            ) : (
              <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-200">
                هیچ ساعتی برای این تاریخ در دسترس نیست
              </div>
            )}
          </div>
          
          <input type="hidden" name="time_slot" data-time-slot-input value={selectedTime || ''} />
        </div>
      </div>
    </div>
  )
}