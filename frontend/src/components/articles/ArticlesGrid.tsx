'use client'

import ArticleCard from './ArticleCard'

interface Article {
  id: number
  title: string
  description: string
  thumbnail_path: string
  date: string
  likes: number
  comments: number
}

const articles: Article[] = [
  {
    id: 1,
    title: 'توسعه فردی',
    description: 'این متن به عنوان نمونه برای نمایش است و همش با متن اصلی در آینده تغییر خواهد کرد.',
    thumbnail_path: '/images/articles/development.jpg',
    date: '۱۴۰۳/۰۸/۰۴',
    likes: 234,
    comments: 56
  },
  {
    id: 2,
    title: 'مدیریت زمان',
    description: 'این متن به عنوان نمونه برای نمایش است و همش با متن اصلی در آینده تغییر خواهد کرد.',
    thumbnail_path: '/images/articles/time-management.jpg',
    date: '۱۴۰۳/۰۸/۰۳',
    likes: 189,
    comments: 42
  },
  {
    id: 3,
    title: 'برنامه‌ریزی استراتژیک',
    description: 'این متن به عنوان نمونه برای نمایش است و همش با متن اصلی در آینده تغییر خواهد کرد.',
    thumbnail_path: '/images/articles/strategy.jpg',
    date: '۱۴۰۳/۰۸/۰۲',
    likes: 156,
    comments: 38
  },
  {
    id: 4,
    title: 'رهبری تیم',
    description: 'این متن به عنوان نمونه برای نمایش است و همش با متن اصلی در آینده تغییر خواهد کرد.',
    thumbnail_path: '/images/articles/leadership.jpg',
    date: '۱۴۰۳/۰۸/۰۱',
    likes: 145,
    comments: 35
  },
  {
    id: 5,
    title: 'مدیریت پروژه',
    description: 'این متن به عنوان نمونه برای نمایش است و همش با متن اصلی در آینده تغییر خواهد کرد.',
    thumbnail_path: '/images/articles/project-management.jpg',
    date: '۱۴۰۳/۰۷/۳۰',
    likes: 132,
    comments: 31
  },
  {
    id: 6,
    title: 'توسعه مهارت‌های نرم',
    description: 'این متن به عنوان نمونه برای نمایش است و همش با متن اصلی در آینده تغییر خواهد کرد.',
    thumbnail_path: '/images/articles/soft-skills.jpg',
    date: '۱۴۰۳/۰۷/۲۹',
    likes: 128,
    comments: 29
  }
]

export default function ArticlesGrid() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">مقالات</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} {...article} />
        ))}
      </div>
    </div>
  )
} 