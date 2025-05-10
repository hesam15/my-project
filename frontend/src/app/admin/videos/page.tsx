'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { videos } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Eye, Pencil, Trash2, Plus, Crown, Clock, Play, BookOpen } from 'lucide-react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Image from 'next/image'

interface Course {
  id: number
  title: string
  thumbnail_path: string | null
}

interface Video {
  id: number
  title: string
  description: string
  video_path: string
  thumbnail_path: string | null
  is_premium: number
  views_count: number
  sort: number
  course_id: number | null
  course?: Course
  created_at: string
  updated_at: string
  likes: any[]
  comments: any[]
}

export default function VideosPage() {
  const [videosList, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await videos.getAll()
        setVideos(response.data)
      } catch {
        toast.error('خطا در دریافت لیست ویدیوها')
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await videos.delete(Number(id))
      setVideos(videosList.filter(video => video.id !== Number(id)))
      toast.success('ویدیو با موفقیت حذف شد')
    } catch {
      toast.error('خطا در حذف ویدیو')
    }
  }

  if (loading) {
    return (
      <div className="text-center p-6">
        <p>در حال بارگذاری...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right p-4">تصویر</th>
                <th className="text-right p-4">عنوان</th>
                <th className="text-right p-4">توضیحات</th>
                <th className="text-right p-4">دوره</th>
                <th className="text-right p-4">وضعیت</th>
                <th className="text-right p-4">آمار</th>
                <th className="text-right p-4">تاریخ انتشار</th>
                <th className="text-right p-4">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {videosList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-4 text-gray-500">
                    هیچ ویدیویی یافت نشد
                  </td>
                </tr>
              ) : (
                videosList.map((video) => (
                  <tr key={video.id} className="border-b">
                    <td className="p-4">
                      <div className="relative w-32 h-20 bg-gray-100 rounded overflow-hidden">
                        {video.thumbnail_path ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${video.thumbnail_path}`}
                            alt={video.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Play className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{video.title}</div>
                      {video.course_id && video.sort && (
                        <div className="text-sm text-gray-500 mt-1">
                          ترتیب: {video.sort}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {video.description}
                      </p>
                    </td>
                    <td className="p-4">
                      {video.course ? (
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 rounded overflow-hidden">
                            {video.course.thumbnail_path ? (
                              <Image
                                src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${video.course.thumbnail_path}`}
                                alt={video.course.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <BookOpen className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <span className="text-sm">{video.course.title}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">بدون دوره</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {video.is_premium === 1 && (
                          <div className="flex items-center gap-1 text-purple-500">
                            <Crown className="w-4 h-4" />
                            <span className="text-sm">پریمیوم</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{video.views_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(video.updated_at).toLocaleDateString('fa-IR')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {new Date(video.created_at).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/videos/${video.id}`)}
                          title="مشاهده"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/videos/edit/${video.id}`)}
                          title="ویرایش"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleteId(video.id)
                            setConfirmOpen(true)
                          }}
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Button
        className="fixed bottom-20 left-4 w-12 h-12 rounded-full shadow-lg"
        onClick={() => router.push('/admin/videos/new')}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        message="آیا از حذف این ویدیو اطمینان دارید؟"
        onConfirm={() => {
          if (deleteId !== null) {
            handleDelete(deleteId.toString())
            setConfirmOpen(false)
          }
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}