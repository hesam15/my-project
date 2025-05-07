const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toFarsiNumber(n: number | undefined | null): string {
  if (n === undefined || n === null) return '0'
  // تبدیل عدد به رشته و افزودن جداکننده سه‌تایی
  let formatted = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // تبدیل اعداد به فرمت فارسی
  return formatted.replace(/[0-9]/g, w => persianDigits[+w]);}

export const toPersianNumbers = toFarsiNumber
