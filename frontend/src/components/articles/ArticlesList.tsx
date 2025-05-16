'use client'

import ArticleCard from './ArticleCard'
import { Article } from '@/lib/articles'

interface ArticlesListProps {
  articles: Article[];
}

export default function ArticlesList({ articles }: ArticlesListProps) {
  if (!articles.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">هیچ مقاله‌ای یافت نشد</p>
      </div>
    )
  }

  console.log(articles);

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
      {articles.map((article) => {
        // Use slug if available, otherwise fall back to ID
        const articleSlug = article.slug || article.id;
        
        return (
          <ArticleCard
            key={article.id}
            id={article.id}
            title={article.title}
            content={article.content}
            slug={articleSlug}
            thumbnail={article.thumbnail_path}
            date={article.created_at}
          />
        );
      })}
    </div>
  )
} 
