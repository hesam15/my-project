'use client'

import ArticleCard from './ArticleCard'
import { Article } from '@/lib/articles'

interface ArticlesListProps {
  articles: Article[];
}

export default function ArticlesList({ articles }: ArticlesListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          id={article.id}
          title={article.title}
          content={article.content}
          slug={article.slug}
          thumbnail={article.thumbnail_path}
          date={article.created_at}
        />
      ))}
    </div>
  )
} 