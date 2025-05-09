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
    <Link href={`/articles/${slug}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {thumbnail && (
          <div className="relative h-48">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${thumbnail}`}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2 line-clamp-2">{title}</h2>
          <p className="text-gray-600 mb-4 line-clamp-3">{content}</p>
          <div className="text-sm text-gray-500">{new Date(date).toLocaleDateString('fa-IR')}</div>
        </div>
      </div>
    </Link>
  )
}