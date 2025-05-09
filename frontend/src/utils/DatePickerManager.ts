import { format, parse } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'

export default class DatePickerManager {
  private inputElement: HTMLInputElement | null = null

  initializeDefaultDatePicker(input: HTMLInputElement) {
    this.inputElement = input
    try {
      console.log('Initializing date picker for input:', input)
      this.inputElement.value = format(new Date(), 'yyyy/MM/dd', { locale: faIR })
    } catch (err) {
      this.handleError('Error initializing date picker', err)
    }
  }

  handleDateSelection(dateString: string, callback?: (date: string) => void) {
    try {
      console.log('Handling date selection:', dateString)
      if (!dateString) {
        throw new Error('تاریخ انتخاب‌شده خالی است')
      }

      const parsedDate = parse(dateString, 'yyyy/MM/dd', new Date(), { locale: faIR })
      if (isNaN(parsedDate.getTime())) {
        throw new Error(`فرمت تاریخ نامعتبر است: ${dateString}`)
      }

      const formattedDate = format(parsedDate, 'yyyy/MM/dd', { locale: faIR })
      console.log('Formatted date:', formattedDate)

      if (callback) {
        console.log('Calling callback with date:', formattedDate)
        callback(formattedDate)
      } else {
        console.warn('No callback provided for date selection')
      }

      if (this.inputElement) {
        this.inputElement.value = formattedDate
        console.log('Updated input value:', this.inputElement.value)
      }
    } catch (err) {
      this.handleError('Error handling date selection', err)
    }
  }

  private handleError(message: string, error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'خطای ناشناخته'
    console.error(`${message}: ${errorMessage}`)
    // Optionally notify user or parent component
  }
}