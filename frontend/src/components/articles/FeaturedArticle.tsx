import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/utils/date';

interface Article {
  id: string;
  title: string;
  content: string;
  slug?: string; // Making slug optional since it might be undefined
  created_at: string;
  updated_at: string;
  thumbnail_path?: string;
}

interface FeaturedArticleProps {
  article: Article;
  priority?: boolean;
  className?: string;
}

export default function FeaturedArticle({ article, priority = false, className = '' }: FeaturedArticleProps) {
  // Extract a short excerpt from the content
  const excerpt = article.content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .slice(0, 120) + (article.content.length > 120 ? '...' : '');

  // Use slug if available, otherwise fall back to ID
  const articlePath = article.slug ? article.slug : article.id;

  return (
    <Link href={`/articles/${articlePath}`}>
      <div className={`relative overflow-hidden rounded-xl group ${className}`}>
        {/* Image */}
        <div className="absolute inset-0">
          <Image
            src={article.thumbnail_path 
              ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${article.thumbnail_path}`
              : '/images/article-placeholder.jpg'}
            alt={article.title}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="relative h-full flex flex-col justify-end p-4 sm:p-6">
          <div className="text-white">
            <span className="text-xs sm:text-sm bg-blue-600 px-2 py-1 rounded-md inline-block mb-2">
              {formatDate(article.created_at)}
            </span>
            <h3 className="text-lg sm:text-xl font-bold line-clamp-2 mb-1">
              {article.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 hidden sm:block">
              {excerpt}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
