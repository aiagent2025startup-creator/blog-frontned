import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Blog } from "@/types/blog";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";

interface BlogCardProps {
  blog: Blog;
  isOwner?: boolean;
}

export function BlogCard({ blog, isOwner = false }: BlogCardProps) {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isLiked, setIsLiked] = useState(blog.isLiked);
  const [likeCount, setLikeCount] = useState(blog.likes);
  const [isBookmarked, setIsBookmarked] = useState(blog.isBookmarked);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentCountLocal, setCommentCountLocal] = useState<number>(
    typeof blog.comments === 'number' ? blog.comments : 0
  );

  // If this blog belongs to the logged-in user, use updated user info from context
  // Otherwise use blog's author info
  const authorInfo = useMemo(() => {
    if (user && blog.authorId === user.id) {
      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      };
    }
    return blog.author || { id: '', name: 'Unknown', avatar: '' };
  }, [blog.author, blog.authorId, user?.id, user?.name, user?.avatar]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  async function submitQuickComment() {
    if (!commentText.trim()) return;
    if (!blog.id) return;
    if (!user) {
      toast({ title: 'Sign in', description: 'Please sign in to post a comment.' });
      return;
    }

    try {
      setSubmittingComment(true);
      const res = await fetch(`http://localhost:5000/api/blogs/${blog.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: commentText }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCommentCountLocal((c) => c + 1);
        setCommentText('');
        toast({ title: 'Comment posted', description: 'Your comment was added.' });
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to post comment', variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('Comment error:', err);
      toast({ title: 'Error', description: err.message || 'Failed to post comment', variant: 'destructive' });
    } finally {
      setSubmittingComment(false);
    }
  }

  return (
    <article className="bg-card rounded-2xl shadow-md border border-border overflow-hidden transition-all duration-300 hover:shadow-lg animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link to={`/profile/${authorInfo.id}`} className="flex items-center gap-3 group">
          <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
            <AvatarImage src={authorInfo.avatar} alt={authorInfo.name} />
            <AvatarFallback>{authorInfo.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm group-hover:text-primary transition-colors">
              {authorInfo.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {isOwner ? (
              <>
                <DropdownMenuItem onClick={() => navigate(`/create?edit=${blog.id}`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit blog
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={async () => {
                    const confirmed = window.confirm('Are you sure you want to delete this blog? This action cannot be undone.');
                    if (!confirmed) return;

                    try {
                      const res = await fetch(`http://localhost:5000/api/blogs/delete/${blog.id}`, { method: 'DELETE', credentials: 'include' });
                      const json = await res.json();
                      
                      if (res.ok && json.success) {
                        toast({ 
                          title: '✅ Blog Deleted', 
                          description: 'Your blog has been deleted successfully.' 
                        });
                        
                        // Reload the page to fetch updated blog list
                        window.location.reload();
                      } else {
                        toast({ 
                          title: '❌ Error', 
                          description: json.message || 'Failed to delete blog', 
                          variant: 'destructive' 
                        });
                      }
                    } catch (err: any) {
                      console.error('Delete error:', err);
                      toast({ 
                        title: '❌ Error', 
                        description: err.message || 'Failed to delete blog', 
                        variant: 'destructive' 
                      });
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete blog
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem>Share to...</DropdownMenuItem>
                <DropdownMenuItem>Copy link</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Report</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title with Emoji */}
      <div className="px-4 pb-3">
        <Link to={`/blog/${blog.id}`}>
          <h2 className="font-display font-semibold text-lg hover:text-primary transition-colors flex items-center gap-2">
            <span className="text-2xl">{blog.emoji}</span>
            {blog.title}
          </h2>
        </Link>
      </div>

      {/* Cover Image */}
      <Link to={`/blog/${blog.id}`} className="block">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      </Link>

      {/* Content Preview */}
      <div className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {blog.content}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
            >
              #{tag}
            </Badge>
          ))}
          {blog.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{blog.tags.length - 3} more
            </Badge>
          )}
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span>{formatCount(likeCount)} likes</span>
          <span>{formatCount(commentCountLocal)} comments</span>
          <span>{formatCount(blog.shares)} shares</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={cn(
              "flex items-center gap-2 transition-all",
              isLiked && "text-destructive"
            )}
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-all",
                isLiked && "fill-current animate-pulse-like"
              )}
            />
            <span className="hidden sm:inline">Like</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Comment</span>
          </Button>

          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            <span className="hidden sm:inline">Share</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={cn(
              "flex items-center gap-2 transition-all",
              isBookmarked && "text-primary"
            )}
          >
            <Bookmark
              className={cn(
                "h-5 w-5 transition-all",
                isBookmarked && "fill-current"
              )}
            />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>

        {/* Quick Comment Input */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-border animate-slide-up">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar || authorInfo.avatar} />
                <AvatarFallback>{(user?.name || authorInfo.name || 'U').charAt(0)}</AvatarFallback>
              </Avatar>
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    await submitQuickComment();
                  }
                }}
                type="text"
                placeholder="Write a comment..."
                className="flex-1 bg-secondary/50 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <Button
                size="sm"
                className="rounded-full"
                onClick={submitQuickComment}
                disabled={submittingComment || !commentText.trim()}
              >
                {submittingComment ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
