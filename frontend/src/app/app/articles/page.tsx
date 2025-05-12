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
      <main className="min-h-screen bg-gray-50">
        <div className="w-full px-2 sm:px-4 py-6 sm:py-8">
          <div className="lg:max-w-7xl lg:mx-auto w-full">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-gray-800 text-center md:text-right">مقالات</h1>
            <ArticlesList articles={articles} />
          </div>
        </div>
      </main>
    )
  } catch (error) {
    console.error('Error in ArticlesPage:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-red-600">خطا در بارگذاری مقالات</p>
          <p className="text-sm text-gray-500 mt-2">{error instanceof Error ? error.message : 'خطای ناشناخته'}</p>
        </div>
      </div>
    )
  }
}