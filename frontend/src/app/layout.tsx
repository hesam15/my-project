import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { AlertProvider } from '@/contexts/AlertContext'
import GlobalAlert from '@/components/ui/GlobalAlert'
import { useAlert } from '@/contexts/AlertContext'
import AlertWrapper from '@/components/ui/AlertWrapper'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2B286A',
}

export const metadata: Metadata = {
  title: 'هفت',
  description: 'نرم‌افزار مدیریت شخصی هفت',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
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
