'use client'

import Link from 'next/link'
import Image from 'next/image'

interface ArticleCardProps {
  id: string;
  title: string;
  content: string;
  slug: string;
  thumbnail?: string;
  date: string;
}

export default function ArticleCard({ title, content, slug, thumbnail, date }: ArticleCardProps) {
  return (
    <Link href={`/articles/${slug}`} className="block h-full">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
        {thumbnail && (
          <div className="relative h-36 sm:h-48 md:h-56">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${thumbnail}`}
              alt={title}
              fill
              className="object-cover rounded-t-lg"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}
        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2 line-clamp-2 text-gray-800">{title}</h2>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-2 sm:mb-4 line-clamp-3 flex-1">{content}</p>
          <div className="text-xs md:text-sm text-gray-500 mt-auto">
            {new Date(date).toLocaleDateString('fa-IR')}
          </div>
        </div>
      </div>
    </Link>
  )
}