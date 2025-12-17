import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { realtimeService } from '@/services/realtimeService';
import { realtimeConfig } from '@/config/realtimeConfig';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to integrate real-time updates with Tanstack Query cache
 * Auto-invalidates and refetches relevant queries when events occur
 */
export function useRealtimeUpdates() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    // Listen to blog creation
    const unsubscribeBlogCreated = realtimeService.on('blog:created', (data) => {
      console.log('📝 New blog created:', data.title);

      // Conditionally invalidate blogs queries to trigger refetch
      if (realtimeConfig.invalidateBlogs) {
        queryClient.invalidateQueries({ queryKey: ['blogs'] });
        queryClient.invalidateQueries({ queryKey: ['trending-blogs'] });
      }

      // Show toast notification (always)
      toast({
        title: 'New Blog Published! 🎉',
        description: `${data.author.name} just published: "${data.title}"`,
        duration: 3000,
      });
    });

    // Listen to blog updates
    const unsubscribeBlogUpdated = realtimeService.on('blog:updated', (data) => {
      console.log('✏️ Blog updated:', data.title);

      // Conditionally invalidate specific blog and blogs list
      if (realtimeConfig.invalidateBlogs) {
        queryClient.invalidateQueries({ queryKey: ['blog', data.id] });
        queryClient.invalidateQueries({ queryKey: ['blogs'] });
      }
    });

    // Listen to likes
    const unsubscribeLikeAdded = realtimeService.on('like:added', (data) => {
      console.log(
        `👍 Like ${data.action === 'like' ? 'added' : 'removed'} on blog`,
        data.blogId
      );

      // Conditionally invalidate blog details and lists to refresh like count
      if (realtimeConfig.invalidateBlogs) {
        queryClient.invalidateQueries({ queryKey: ['blog', data.blogId] });
        queryClient.invalidateQueries({ queryKey: ['blogs'] });
        queryClient.invalidateQueries({ queryKey: ['trending-blogs'] });
      }
    });

    // Listen to comments
    const unsubscribeCommentAdded = realtimeService.on('comment:added', (data) => {
      console.log('💬 Comment added on blog', data.blogId);

      // Conditionally invalidate blog details/comments depending on config
      if (realtimeConfig.invalidateBlogs) {
        queryClient.invalidateQueries({ queryKey: ['blog', data.blogId] });
        queryClient.invalidateQueries({ queryKey: ['blog-comments', data.blogId] });
      }
    });

    // Listen to shares (use comment:added as placeholder since share:added isn't defined yet)
    // Shares will be handled through blog:updated events
    const unsubscribeCommentAdded2 = realtimeService.on('comment:added', (data) => {
      // This also handles share updates through invalidation
      if (realtimeConfig.invalidateBlogs) {
        queryClient.invalidateQueries({ queryKey: ['blog', data.blogId] });
      }
    });

    // Listen to follows
    const unsubscribeFollowAdded = realtimeService.on('follow:added', (data) => {
      console.log('👥 User followed:', data.userId);

      // Invalidate suggestions and profile
      queryClient.invalidateQueries({ queryKey: ['follow-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['profile', data.userId] });
    });

    // Cleanup on unmount
    return () => {
      unsubscribeBlogCreated();
      unsubscribeBlogUpdated();
      unsubscribeLikeAdded();
      unsubscribeCommentAdded();
      unsubscribeCommentAdded2();
      unsubscribeFollowAdded();
    };
  }, [queryClient, toast]);
}
