import type { Metadata, Viewport } from 'next'
import '../globals.css'
import { AlertProvider } from '@/contexts/AlertContext'
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
        <AlertProvider>
          <AlertWrapper />
            {children}
        </AlertProvider>
  )
}
