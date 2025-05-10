'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import { GripVertical, ArrowLeft, Eye, Crown, Clock } from 'lucide-react';
import Image from 'next/image';

interface Video {
  id: number;
  title: string;
  description: string;
  thumbnail_path: string | null;
  video_path: string;
  is_premium: number;
  views_count: number;
  sort: number;
  course_id: number;
  created_at: string;
  updated_at: string;
  likes: any[];
  comments: any[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail_path: string | null;
  is_premium: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  sorted_videos: Video[];
  likes: any[];
  comments: any[];
}

export default function SortCourseVideosPage() {
  const params = useParams();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course with sorted videos
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${params.id}`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('خطا در دریافت اطلاعات دوره');
        const courseData = await response.json();
        setCourse(courseData);
        setVideos(courseData.sorted_videos);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('خطا در دریافت اطلاعات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(videos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order for all items
    const updatedItems = items.map((item, index) => ({
      ...item,
      sort: index + 1,
    }));

    setVideos(updatedItems);

    try {
      // Update order in backend
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${params.id}/videos/${reorderedItem.id}/signVideo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ order: result.destination.index + 1 }),
      });

      toast.success('ترتیب ویدیوها با موفقیت بروزرسانی شد');
    } catch (err) {
      console.error('Error updating video order:', err);
      toast.error('خطا در بروزرسانی ترتیب ویدیوها');
    }
  };

  if (loading) {
    return (
      <div className="text-center p-6">
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-lg font-bold">
                مرتب‌سازی ویدیوهای دوره {course?.title}
              </h2>
            </div>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="videos">
              {(provided: DroppableProvided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {videos.map((video, index) => (
                    <Draggable
                      key={video.id}
                      draggableId={video.id.toString()}
                      index={index}
                    >
                      {(provided: DraggableProvided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="bg-white rounded-lg border p-4 flex items-center gap-4"
                        >
                          <div {...provided.dragHandleProps}>
                            <GripVertical className="w-6 h-6 text-gray-400" />
                          </div>
                          
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
                                <span className="text-gray-400 text-sm">بدون تصویر</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{video.title}</h3>
                              {video.is_premium === 1 && (
                                <Crown className="w-4 h-4 text-purple-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                              {video.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{video.views_count}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(video.created_at).toLocaleDateString('fa-IR')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {video.sort}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {videos.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              هیچ ویدیویی در این دوره وجود ندارد
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 