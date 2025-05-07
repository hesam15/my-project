'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { posts } from '@/lib/api';
import { toast } from 'sonner';
import TopArticleCard from './TopArticleCard';

interface Article {
  id: number;
  title: string;
  description: string;
  thumbnail_path: string;
  date: string;
  likes: number;
  comments: number;
  views_count: number;
}

export default function TopArticlesSlider() {
  const [[page, direction], setPage] = useState([0, 0]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopArticles = async () => {
      try {
        const response = await posts.getTop();
        const formattedData = response.data.map((article: any) => ({
          id: article.id,
          title: article.title,
          description: article.content,
          thumbnail_path: article.thumbnail_path || '/images/nice.jpg',
          date: new Date(article.created_at).toLocaleDateString('fa-IR'),
          likes: article.likes.length,
          comments: article.comments.length,
          views_count: article.views_count,
        }));
        setArticles(formattedData);
      } catch (error) {
        toast.error('خطا در دریافت مقالات برتر');
      } finally {
        setLoading(false);
      }
    };

    fetchTopArticles();
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: 'easeIn',
      },
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    const newPage = page + newDirection;
    if (newPage < 0) {
      setPage([articles.length - 1, newDirection]);
    } else if (newPage >= articles.length) {
      setPage([0, newDirection]);
    } else {
      setPage([newPage, newDirection]);
    }
  };

  if (loading) {
    return <div className="bg-[#DEBDA5] p-4">در حال بارگذاری...</div>;
  }

  if (!articles.length) {
    return <div className="bg-[#DEBDA5] p-4">هیچ مقاله برتری یافت نشد.</div>;
  }

  const article = articles[page];

  return (
    <div className="bg-[#DEBDA5] p-4">
      <h2 className="text-lg font-bold mb-4 text-white">۷ تا از برترین مقالات</h2>
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="w-full"
          >
            <TopArticleCard {...article} />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-center mt-4 gap-1">
        {articles.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === page ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}