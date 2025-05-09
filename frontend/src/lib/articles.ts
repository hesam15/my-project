import { posts } from './api'

export interface Article {
  id: string;
  title: string;
  content: string;
  slug: string;
  created_at: string;
  updated_at: string;
  thumbnail_path?: string;
}

export async function getArticles(): Promise<Article[]> {
  const response = await posts.getAll()
  return response.data
}

export async function getArticle(slug: string): Promise<Article> {
  const response = await posts.getOne(slug)
  return response.data
} 