export const COMMENTABLE_TYPES = {
    COURSE: 'App\Models\Course' as const,
    POST: 'App\Models\Post' as const,
    MANAGEMENT_TOOL: 'App\Models\ManagementTool' as const,
    VIDEO: 'App\Models\Video' as const,
  };
  
  export type CommentableType = typeof COMMENTABLE_TYPES[keyof typeof COMMENTABLE_TYPES];