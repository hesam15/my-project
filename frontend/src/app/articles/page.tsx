import { getArticles } from '@/lib/articles'
import ArticlesList from '@/components/articles/ArticlesList'

interface Article {
  id: string;
  title: string;
  content: string;
  slug: string;
  created_at: string;
  updated_at: string;
  thumbnail_path?: string;
}

export default async function ArticlesPage() {
  try {
    const articles = await getArticles()
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">مقالات</h1>
        <ArticlesList articles={articles} />
      </div>
    )
  } catch {
    return <div className="p-4">خطا در بارگذاری مقالات</div>
  }
}