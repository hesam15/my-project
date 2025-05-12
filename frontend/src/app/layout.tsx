// app/template.tsx
import { AuthProvider } from '@/contexts/AuthContext';
import { AlertProvider } from '@/contexts/AlertContext';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="font-[Yekan Bakh]"> 
      <AlertProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </AlertProvider>
      </body>
    </html>
  )
}