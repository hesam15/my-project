'use client'

import { useState, useEffect } from 'react'
import VideoSlider from '@/components/media/VideoSlider'
import { useAlert } from '@/contexts/AlertContext'

interface Video {
  id: number
  title: string
  thumbnail_path: string
  created_at: string
  views_count: number
  comments_count: number
  is_premium: number
}

export default function MediaPage() {
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null)
  const [latestVideos, setLatestVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { showAlert } = useAlert()

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true)
      setError(null)

      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error('NEXT_PUBLIC_API_URL is not defined')
        }

        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/videos`
        console.log('Fetching videos from:', url)

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Error response text:', errorText)
          throw new Error(`خطای سرور: ${response.status} ${response.statusText}`)
        }

        const result: Video[] = await response.json()
        console.log('API response:', JSON.stringify(result, null, 2))

        const sortedVideos = result
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        setFeaturedVideo(sortedVideos[0] || null)
        setLatestVideos(sortedVideos.slice(1, 5))
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'خطای ناشناخته در بارگذاری ویدیوها'
        console.error('Error fetching videos:', err)
        setError(errorMessage)
        showAlert(errorMessage, 'danger')
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  if (loading) {
    return <div className="text-center py-10">در حال بارگذاری...</div>
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="bg-red-50 text-red-600 border border-red-100 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-lg font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            تلاش مجدد
          </button>
        </div>
      </div>
    )
  }

  if (!featuredVideo && !latestVideos.length) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] px-4">
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 max-w-md w-full text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">هیچ ویدیویی یافت نشد</h2>
          <p className="text-sm text-gray-600">در حال حاضر ویدیویی موجود نیست. بعداً دوباره سر بزنید!</p>
          <button onClick={() => window.location.href = '/'} className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold">
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    )
  }

  return <VideoSlider videos={latestVideos} featuredVideo={featuredVideo} />
}