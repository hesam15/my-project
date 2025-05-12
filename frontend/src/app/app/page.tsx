'use client'

import Image from 'next/image'
import WalletSection from '@/components/dashboard/WalletSection'
import CoursesSlider from '@/components/dashboard/CoursesSlider'
import ManagementToolsSlider from '@/components/dashboard/ManagementToolsSlider'

export default function DashboardPage() {
  return (
    <main className="main-content px-4">
      <div className="h-full flex flex-col gap-6">
        {/* Top Section - Wallet */}
        <div className="h-[1/7]">
          <WalletSection />
        </div>

        {/* Middle Section - Courses */}
        <div className="h-[3/7] bg-[#75ABB7] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/images/courses.png"
              alt="دوره ها"
              fill
              className="object-contain rotate-[-10deg] scale-90"
            />
          </div>
          <div className="relative z-10">
            <CoursesSlider />
          </div>
        </div>

        {/* Bottom Section - Management Tools */}
        <div className="h-[3/7] bg-[#75ABB7] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/images/tools.png"
              alt="ابزار مدیریت"
              fill
              className="object-contain scale-90"
            />
          </div>
          <div className="relative z-10">
            <ManagementToolsSlider />
          </div>
        </div>
      </div>
    </main>
  )
}
