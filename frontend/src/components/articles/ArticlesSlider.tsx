'use client';

import ArticleCard from './ArticleCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Custom styles for Swiper
const swiperStyles = `
  .swiper-button-next,
  .swiper-button-prev {
    color: #DEBDA5 !important;
  }
  .swiper-pagination-bullet-active {
    background: #DEBDA5 !important;
  }
  .swiper-button-next:after,
  .swiper-button-prev:after {
    font-size: 20px !important;
  }
  .swiper-button-next,
  .swiper-button-prev {
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .swiper:hover .swiper-button-next,
  .swiper:hover .swiper-button-prev {
    opacity: 1;
  }
`;

interface Article {
  id: number;
  title: string;
  description: string;
  thumbnail_path: string;
  date: string;
  likes: number;
  comments: number;
}

interface ArticlesSliderProps {
  articles: Article[];
  title: string;
}

export default function ArticlesSlider({ articles, title }: ArticlesSliderProps) {
  if (!articles.length) {
    return <div>هیچ مقاله‌ای برای نمایش وجود ندارد.</div>;
  }

  return (
    <>
      <style jsx global>{swiperStyles}</style>
      <div className="relative">
        <h2 className="text-lg font-bold mb-4 text-gray-700 font-yekan-lg">{title}</h2>
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={16}
          slidesPerView={2}
          navigation
          pagination={{ clickable: true }}
          className="w-full"
        >
          {articles.map((article) => (
            <SwiperSlide key={article.id}>
              <ArticleCard {...article} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
}