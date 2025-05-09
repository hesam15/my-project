'use client'

import Image from 'next/image'
import { Article } from '@/lib/articles'

interface ArticleDetailProps {
  article: Article;
}

export default function ArticleDetail({ article }: ArticleDetailProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      {article.thumbnail_path && (
        <Image
          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${article.thumbnail_path}`}
          alt={article.title}
          width={800}
          height={400}
          className="w-full h-64 object-cover mb-8 rounded-lg"
        />
      )}
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
    </div>
  )
} 