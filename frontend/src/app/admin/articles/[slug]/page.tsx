'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { posts } from '@/lib/api'
import { toast } from 'sonner'

interface Article {
  id: string
  title: string
  content: string
  slug: string
  created_at: string
  updated_at: string
}

export default function EditArticlePage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await posts.getOne(params.slug)
        setArticle(response.data)
      } catch (error) {
        toast.error('خطا در دریافت اطلاعات مقاله')
        router.push('/admin/articles')
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [params.slug, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!article) return

    setSaving(true)
    try {
      await posts.update(params.slug, {
        title: article.title,
        content: article.content,
        slug: article.slug
      })
      toast.success('مقاله با موفقیت بروزرسانی شد')
      router.push('/admin/articles')
    } catch (error) {
      toast.error('خطا در بروزرسانی مقاله')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>در حال بارگذاری...</div>
  }

  if (!article) {
    return <div>مقاله یافت نشد</div>
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>ویرایش مقاله</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان</Label>
              <Input
                id="title"
                value={article.title}
                onChange={(e) => setArticle({ ...article, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">نامک</Label>
              <Input
                id="slug"
                value={article.slug}
                onChange={(e) => setArticle({ ...article, slug: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">محتوا</Label>
              <Textarea
                id="content"
                value={article.content}
                onChange={(e) => setArticle({ ...article, content: e.target.value })}
                required
                className="min-h-[200px]"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/articles')}
              >
                انصراف
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 