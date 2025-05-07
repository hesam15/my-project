'use client'

import Image from 'next/image'
import Link from 'next/link'
import { StarIcon } from '@heroicons/react/24/solid'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import { toPersianNumbers } from '@/utils/numbers'

// موقتاً از این دیتا استفاده می‌کنیم تا API آماده شود
const tools = [
  {
    id: 1,
    title: 'نرم افزار حسابداری',
    description: 'مهم ترین رکن مجموعه حساب ها و امور مالی این مجموعه است و برای مطالعه بیشتر روی این محصول کلیک کنید',
    price: 725,
    rating: 4,
    date: '۱۴۰۲/۰۸/۲۵',
    image: '/images/calc.png'
  },
  {
    id: 2,
    title: 'باشگاه مدیریت مشتریان',
    description: 'مهم ترین رکن مجموعه حساب ها و امور مالی این مجموعه است و برای مطالعه بیشتر روی این محصول کلیک کنید',
    price: 725,
    rating: 3,
    date: '۱۴۰۲/۰۸/۲۵',
    image: '/images/crm.png'
  }
]

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Description Section */}
      <div className="relative bg-[#AAA9C7CC] h-1/3 px-4 py-8">
        <div className="relative z-10">
          <h2 className="text-lg font-bold mr-5 mb-4 text-white ">ابزار مدیریت و کاربردش چیه ؟</h2>
          <p className="text-sm p-5 leading-6 text-white">
          دوست خوبم یادت باشه که همیشه یک مدیر خوب احتیاج داره که خودش رو بر اساس عمل بین المللی مدیریت بروز و کارامد نگه داره این ابزار هایی که برات داخل این اپلیکیشن جمع آوری کریدم بهت کمک میکنه تا بتونی با جدید ترین و کارامد ترین تکنیک ها و ابزار های روز علم مدیریت کسب و کار خودت رو مدیریت ، کنترل و توسعه بدی.          </p>
        </div>
        <div className="absolute items-center inset-0 z-0 pr-10 max-w-[400px]">
          <Image
            src="/images/Mtools.png"
            alt="ابزار مدیریت"
            fill
            className="object-cover opacity-20"
          />
        </div>
      </div>

      {/* Tools List */}
      <div className="px-4 py-6 space-y-4">
        {tools.map((tool) => (
          <Link href={`/tools/${tool.id}`} key={tool.id} className="block">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">{tool.title}</h3>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(tool.rating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      {tool.rating % 1 > 0 && (
                        <StarIcon className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{tool.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{tool.date}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">
                        {toPersianNumbers(tool.price)}
                      </span>
                      <ShoppingCartIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="w-24 h-24 relative flex-shrink-0">
                  <Image
                    src={tool.image}
                    alt={tool.title}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
} 