// app/template.tsx
import { AuthProvider } from '@/contexts/AuthContext';
import { AlertProvider } from '@/contexts/AlertContext';
import AlertWrapper from '@/components/ui/AlertWrapper';
import './globals.css'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="icon" href="/images/logo.svg" type="image/svg+xml" />
      </head>
      <body className="font-[Yekan Bakh]"> 
      <AlertProvider>
        <AlertWrapper />
        <AuthProvider>
          {children}
        </AuthProvider>
      </AlertProvider>
      </body>
    </html>
  )
}
