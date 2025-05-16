'use client';

import { useEffect, useState } from 'react';
import { getArticles } from '@/lib/articles';
import ArticlesList from '@/components/articles/ArticlesList';
import FeaturedArticle from '@/components/articles/FeaturedArticle';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  content: string;
  slug?: string; // Making slug optional
  created_at: string;
  updated_at: string;
  thumbnail_path?: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6;

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const fetchedArticles = await getArticles();
        
        // Log the first few articles to debug slug issues
        if (fetchedArticles.length > 0) {
          console.log('First few articles:', fetchedArticles.slice(0, 3).map(a => ({
            id: a.id,
            title: a.title,
            slug: a.slug
          })));
        }
        
        setArticles(fetchedArticles);
      } catch (err) {
        console.error('Error in ArticlesPage:', err);
        setError(err instanceof Error ? err : new Error('خطای ناشناخته'));
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری مقالات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-red-600">خطا در بارگذاری مقالات</p>
          <p className="text-sm text-gray-500 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  // Sort articles by date (newest first)
  const sortedArticles = [...articles].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Get the latest 5 articles for the featured section
  const featuredArticles = sortedArticles.slice(0, 5);
  
  // Calculate pagination
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = sortedArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(sortedArticles.length / articlesPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to the all articles section
    document.getElementById('all-articles')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Featured Articles Section */}
      <section className="bg-gradient-to-b from-blue-50 to-gray-50 py-8 sm:py-12">
        <div className="lg:max-w-7xl lg:mx-auto w-full px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 text-right">
            جدیدترین مقالات
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main featured article (larger) */}
            {featuredArticles.length > 0 && (
              <div className="md:col-span-2">
                <FeaturedArticle 
                  article={featuredArticles[0]} 
                  priority={true}
                  className="h-80 sm:h-96"
                />
              </div>
            )}
            
            {/* Secondary featured articles (smaller) */}
            <div className="grid grid-cols-1 gap-6">
              {featuredArticles.slice(1, 3).map((article) => (
                <FeaturedArticle 
                  key={article.id} 
                  article={article} 
                  className="h-44"
                />
              ))}
            </div>
          </div>
          
          {/* Additional featured articles in a row */}
          {featuredArticles.length > 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              {featuredArticles.slice(3, 5).map((article) => (
                <FeaturedArticle 
                  key={article.id} 
                  article={article} 
                  className="h-44"
                />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* All Articles Section with Pagination */}
      <section id="all-articles" className="w-full px-4 py-8 sm:py-12">
        <div className="lg:max-w-7xl lg:mx-auto w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 text-right">
            همه مقالات
          </h2>
          
          <ArticlesList articles={currentArticles} />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: totalPages }).map((_, index) => (
                  <Button
                    key={index}
                    variant={currentPage === index + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => paginate(index + 1)}
                    className="w-8 h-8"
                  >
                    {index + 1}
                  </Button>
                ))}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
