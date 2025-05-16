export const getDefaultThumbnail = (type: 'tool' | 'course' | 'video' | 'article') => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  switch(type) {
    case 'tool':
      return '/images/tools-default.jpg';
    case 'course':
      return `${baseUrl}/storage/images/default-course-thumbnail.jpg`;
    case 'video':
      return '/images/default-video.jpg';
    case 'article':
      return '/images/default.jpg';
    default:
      return '/images/default.jpg';
  }
}

export const getImageUrl = (path: string | null | undefined, type: 'tool' | 'course' | 'video' | 'article') => {
  if (!path || path === 'undefined') {
    return getDefaultThumbnail(type);
  }
  
  if (path.startsWith('http')) {
    return path;
  }
  
  return `${process.env.NEXT_PUBLIC_API_URL}/storage/${path.replace(/^\\|^\//, '')}`;
}