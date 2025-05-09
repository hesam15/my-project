interface JalaliDatepicker {
    startWatch: (options: {
      minDate?: string
      maxDate?: string
      time?: boolean
      onSelect?: (unix: number) => void
    }) => void
  }
  declare global {
    interface Window {
      jalaliDatepicker: JalaliDatepicker
    }
  }