'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { posts } from '@/lib/api';
import { toast } from 'sonner';
import TopArticlesSlider from '@/components/articles/TopArticlesSlider';
import ArticlesSlider from '@/components/articles/ArticlesSlider';

interface Article {
  id: number;
  title: string;
  content: string;
  thumbnail_path: string | null;
  views_count: number;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
  likes: any[];
  comments: any[];
  categories: any[];
}

interface FormattedArticle {
  id: number;
  title: string;
  description: string;
  thumbnail_path: string;
  date: string;
  likes: number;
  comments: number;
  views_count: number;
  is_premium: boolean;
}

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await posts.getAll();
        setArticles(response.data);
      } catch (error) {
        toast.error('خطا در دریافت لیست مقالات');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const formattedArticles = useMemo(
    () =>
      articles.map((article) => ({
        id: article.id,
        title: article.title,
        description: article.content,
        thumbnail_path: article.thumbnail_path || '/images/nice.jpg',
        date: new Date(article.created_at).toLocaleDateString('fa-IR'),
        likes: article.likes.length,
        comments: article.comments.length,
        views_count: article.views_count,
        is_premium: article.is_premium,
      })),
    [articles]
  );

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  if (!formattedArticles.length) {
    return <div>هیچ مقاله‌ای یافت نشد.</div>;
  }

  const newArticles = formattedArticles.slice(0, Math.min(3, formattedArticles.length));
  const popularArticles = formattedArticles.slice(
    3,
    Math.min(6, formattedArticles.length)
  );

  return (
    <main className="main-content">
      <div className="space-y-6">
        <TopArticlesSlider />
        <div>
          <ArticlesSlider articles={newArticles} title="جدیدترین مقالات" />
        </div>
        <div className="border-t border-gray-200 pt-6">
          <ArticlesSlider articles={popularArticles} title="پربازدیدترین مقالات" />
        </div>
      </div>
    </main>
  );
}