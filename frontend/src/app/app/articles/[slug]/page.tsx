import { getArticle } from '@/lib/articles';
import ArticleDetail from '@/components/articles/ArticleDetail';

// تعریف نوع برای props صفحه
interface PageProps {
  params: { slug: string }; // یا Promise<{ slug: string }>
}

// تابع صفحه
export default async function ArticlePage({ params }: PageProps) {
  try {
    console.log(params);
    const { slug } = params; // یا اگر نیاز است: const { slug } = await params;
    const article = await getArticle(slug);
    return <ArticleDetail article={article} />;
  } catch {
    return <div className="p-4">مقاله یافت نشد</div>;
  }
}