import { useEffect, useRef } from 'react';

export interface JalaliDateInputProps {
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

export default JalaliDateInput; 