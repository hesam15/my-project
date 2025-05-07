import moment from 'moment-jalaali'
import 'moment/locale/fa'

class DatePickerManager {
    constructor() {
        this.instances = new Map()
        this.initializeDefaultDatePicker()
    }

    initializeDefaultDatePicker() {
        const dateInputs = document.querySelectorAll('[data-jdp]')
        
        if (dateInputs.length === 0) {
            console.error('DatePickerManager: No date inputs found')
            return
        }
        
        dateInputs.forEach((dateInput, index) => {
            const form = dateInput.closest('form') || document
            const timeSlotsContainer = form.querySelector('[data-time-slots-container]')
            const timeSlotsGrid = form.querySelector('[data-time-slots-grid]')
            const timeSlotInput = form.querySelector('[data-time-slot-input]')
            
            const elements = {
                dateInput,
                timeSlotsContainer,
                timeSlotsGrid,
                timeSlotInput
            }
            
            const instanceId = dateInput.id || `date-input-${index}`
            const instance = {
                context: form,
                elements,
                currentDate: null,
                currentTimeSlot: null
            }
            
            this.instances.set(instanceId, instance)
            this.initializeDatePicker(instance)
        })
    }

    initializeDatePicker(instance) {
        const { dateInput } = instance.elements
        if (!dateInput) return
    
        try {
            if (typeof window.jalaliDatepicker === 'undefined') {
                throw new Error('jalaliDatepicker is not loaded')
            }

            // اضافه کردن استایل برای مخفی کردن دکمه‌های مثبت و منفی
            const style = document.createElement('style')
            style.textContent = `
                .jdp-icon-plus, .jdp-icon-minus {
                    display: none !important;
                }
            `
            document.head.appendChild(style)

            // تنظیم تاریخ با moment
            const m = moment()
            const today = `${m.jYear()}/${String(m.jMonth() + 1).padStart(2, '0')}/${String(m.jDate()).padStart(2, '0')}`
    
            const maxDate = moment().add(1, 'jMonth')
            const originalMaxDate = `${maxDate.jYear()}/${String(maxDate.jMonth() + 1).padStart(2, '0')}/${String(maxDate.jDate()).padStart(2, '0')}`
    
            dateInput.setAttribute('data-jdp-min-date', 'today')
            dateInput.setAttribute('data-jdp-max-date', originalMaxDate)
    
            window.jalaliDatepicker.startWatch({
                minDate: "attr",
                maxDate: "attr",
                onSelect: (unix) => {
                    this.handleDateSelection(dateInput.value, instance)
                }
            })
    
            // تنظیم مقدار اولیه و فراخوانی handleDateSelection
            dateInput.value = today
            setTimeout(() => {
                this.handleDateSelection(today, instance)
            }, 100)
    
            dateInput.addEventListener('change', (e) => {
                this.handleDateSelection((e.target as HTMLInputElement).value, instance)
            })
    
            document.addEventListener('jdp:change', (e) => {
                if (e.target === dateInput) {
                    this.handleDateSelection((e.target as HTMLInputElement).value, instance)
                }
            })
        } catch (error) {
            console.error('DatePickerManager: Error initializing jalali datepicker:', error)
            this.handleError(error, instance)
        }
    }

    async handleDateSelection(selectedDate, instance) {
        try {
            if (!selectedDate) return
    
            instance.currentDate = selectedDate
            
            const { timeSlotsContainer, timeSlotsGrid } = instance.elements
            if (!timeSlotsContainer || !timeSlotsGrid) return
    
            this.showLoadingState(instance)
            
            if (timeSlotsContainer) {
                timeSlotsContainer.classList.remove('hidden')
            }
    
            await this.loadTimeSlots(selectedDate, instance)
    
        } catch (error) {
            console.error('Error in handleDateSelection:', error)
            this.handleError(error, instance)
        }
    }

    async loadTimeSlots(selectedDate, instance) {
        try {
            const { timeSlotsContainer, timeSlotsGrid } = instance.elements
            
            if (!timeSlotsContainer || !timeSlotsGrid) {
                throw new Error('Time slots elements not found')
            }
    
            const url = `/dashboard/available-times?date=${selectedDate}`
    
            timeSlotsContainer.classList.remove('hidden')
            this.showLoadingState(instance)
    
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
    
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken
                }
            })
            
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`)
            }
            
            const data = await response.json()

            if (data.error) {
                this.showMessage(data.error, 'error', instance)
                return
            }
    
            if (data.message) {
                this.showMessage(data.message, 'info', instance)
                return
            }
    
            this.renderTimeSlots(data, instance)
            
        } catch (error) {
            console.error('Error in loadTimeSlots:', error)
            this.handleError(error, instance)
        }
    }

    renderTimeSlots(data, instance) {
        const { timeSlotsGrid, timeSlotInput } = instancestam.elements
    
        if (!timeSlotsGrid) return
    
        const availableSlots = new Set(data.available || [])
        const bookedSlots = new Set(data.booked || [])
        const allTimeSlots = [...new Set([...availableSlots, ...bookedSlots])].sort()
    
        if (allTimeSlots.length === 0) {
            this.showNoTimeSlotsMessage(instance)
            return
        }
    
        const m = moment()
        const today = `${m.jYear()}/${String(m.jMonth() + 1).padStart(2, '0')}/${String(m.jDate()).padStart(2, '0')}`
        const selectedDate = moment(instance.currentDate, 'YYYY/MM/DD')
        const isToday = selectedDate.isSame(today, 'day')
        const currentTime = m.locale('en').format('HH:mm')
    
        const slotsHtml = allTimeSlots.map(time => {
            const isBooked = bookedSlots.has(time)
            const isChecked = timeSlotInput && timeSlotInput.value === time
            const isPastTime = isToday && this.compareTimes(time, currentTime) <= 0

            const commonLabelClasses = `
                block w-full py-2.5 px-4 text-center border-2 rounded-lg
                transition-all duration-200 ease-in-out
            `

            const disabledClasses = `
                border-gray-200 bg-gray-50 text-gray-400
                cursor-not-allowed opacity-50 pointer-events-none
            `

            const activeClasses = `
                border-gray-200 cursor-pointer
                peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500
                hover:bg-blue-50 hover:border-blue-300 active:scale-95
            `

            return `
                <div class="w-full">
                    <input type="radio" name="time" id="time_${time}" value="${time}" 
                           class="hidden peer" ${isChecked ? 'checked' : ''} ${(isBooked || isPastTime) ? 'disabled' : ''}>
                    <label for="time_${time}" 
                           class="${commonLabelClasses} ${(isBooked || isPastTime) ? disabledClasses : activeClasses}">
                        ${time}
                        ${isBooked ? '<span class="block text-xs">(رزرو شده)</span>' : ''}
                        ${isPastTime ? '<span class="block text-xs">(گذشته)</span>' : ''}
                    </label>
                </div>
            `
        }).join('')
    
        timeSlotsGrid.innerHTML = `
            <div class="w-full max-w-full">
                <div class="grid grid-cols-4 gap-4">
                    ${slotsHtml}
                </div>
            </div>
        `
    
        const radioInputs = timeSlotsGrid.querySelectorAll('input[type="radio"]')
        radioInputs.forEach(input => {
            if (!input.disabled) {
                input.addEventListener('change', (e) => {
                    this.handleTimeSlotSelection((e.target as HTMLInputElement).value, instance)
                })
            }
        })
    }

    handleTimeSlotSelection(time, instance) {
        const { elements } = instance
        if (elements.timeSlotInput) {
            elements.timeSlotInput.value = time
        }
        instance.currentTimeSlot = time
    }

    showLoadingState(instance) {
        const { timeSlotsGrid } = instance.elements
        if (timeSlotsGrid) {
            timeSlotsGrid.innerHTML = `
                <div class="col-span-4 text-center py-4 flex flex-col items-center justify-center">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent shadow-sm"></div>
                    <div class="mt-2 text-gray-600 font-medium">در حال بارگذاری ساعات مراجعه...</div>
                </div>
            `
        }
    }

    showMessage(message, type = 'info', instance) {
        const { timeSlotsGrid } = instance.elements
        if (!timeSlotsGrid) return
    
        const colors = {
            info: 'bg-blue-50 text-blue-600 border border-blue-100',
            warning: 'bg-amber-50 text-amber-600 border border-amber-100',
            error: 'bg-red-50 text-red-600 border border-red-100',
            success: 'bg-green-50 text-green-600 border border-green-100'
        }
    
        const icons = {
            info: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            warning: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
            error: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            success: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
        }
    
        timeSlotsGrid.innerHTML = `
            <div class="col-span-4 text-center py-4 ${colors[type]} rounded-lg shadow-sm">
                <div class="flex flex-col items-center justify-center space-y-2 p-2">
                    ${icons[type] || icons.info}
                    <p class="text-lg font-medium">${message}</p>
                </div>
            </div>
        `
    }

    showNoTimeSlotsMessage(instance) {
        this.showMessage('هیچ ساعت خالی برای این روز وجود ندارد. لطفاً روز دیگری را انتخاب کنید.', 'info', instance)
    }

    handleError(error, instance) {
        console.error('DatePickerManager Error:', error)
        this.showMessage('خطا در بارگذاری اطلاعات. لطفاً مجدداً تلاش کنید.', 'error', instance)
    }

    compareTimes(time1, time2) {
        const [hours1, minutes1] = time1.split(':').map(Number)
        const [hours2, minutes2] = time2.split(':').map(Number)
        
        if (hours1 !== hours2) {
            return hours1 - hours2
        }
        return minutes1 - minutes2
    }
}

export default DatePickerManager