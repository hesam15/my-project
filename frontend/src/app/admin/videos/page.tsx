'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { videos } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Eye, Pencil, Trash2, Plus } from 'lucide-react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Image from 'next/image'

interface Video {
  id: number
  title: string
  description: string
  video_path: string
  thumbnail_path: string
  created_at: string
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
                <th className="text-right p-4">تاریخ انتشار</th>
                <th className="text-right p-4">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {videosList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-gray-500">
                    هیچ ویدیویی یافت نشد
                  </td>
                </tr>
              ) : (
                videosList.map((video) => (
                  <tr key={video.id} className="border-b">
                    <td className="p-4">
                      {video.thumbnail_path && (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${video.thumbnail_path}`}
                          alt={video.title}
                          width={80}
                          height={48}
                          className="w-20 h-12 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="p-4">{video.title}</td>
                    <td className="p-4">{new Date(video.created_at).toLocaleDateString('fa-IR')}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/videos/${video.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/videos/edit/${video.id}`)}
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