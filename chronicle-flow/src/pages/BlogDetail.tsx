import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { ShareButton } from "@/components/ShareButton";
import { Trash2, MessageCircle } from "lucide-react";

interface Comment {
  _id?: string;
  id?: string;
  text: string;
  author: Author;
  createdAt?: string;
}

interface Author {
  _id?: string;
  id?: string;
  name?: string;
  avatar?: string;
}

interface BlogDetailData {
  id?: string;
  title?: string;
  content?: string;
  emoji?: string;
  image?: string;
  coverImage?: string;
  tags?: string[];
  author?: Author;
  authorId?: string;
  likes?: any;
  comments?: Comment[];
  shares?: any;
  createdAt?: string;
}

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
  const [blog, setBlog] = useState<BlogDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/blogs/${id}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok && data.success) {
          // Normalize shape if needed
          const b = data.data;
          const transformed = {
            id: b._id || b.id,
            title: b.title,
            content: b.content,
            emoji: b.emoji,
            image: b.image || b.coverImage,
            tags: b.tags || [],
            author: b.author || (b.authorId ? { id: b.authorId } : undefined),
            likes: Array.isArray(b.likes) ? b.likes.length : b.likes || 0,
            comments: Array.isArray(b.comments) ? b.comments : [],
            shares: Array.isArray(b.shares) ? b.shares.length : b.shares || 0,
            createdAt: b.createdAt,
          } as BlogDetailData;
          setBlog(transformed);
        } else {
          toast({ title: 'Error', description: data.message || 'Failed to load blog', variant: 'destructive' });
        }
      } catch (err: any) {
        toast({ title: 'Error', description: err.message || 'Failed to load blog', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto py-20 text-center">Loading blog...</div>
      </MainLayout>
    );
  }

  if (!blog) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto py-20 text-center">Blog not found.</div>
      </MainLayout>
    );
  }

  const isOwner = (blog.author && currentUser && (blog.author._id === currentUser.id || blog.author.id === currentUser.id));

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar>
              {blog.author?.avatar ? (
                <AvatarImage src={blog.author.avatar} alt={blog.author?.name} />
              ) : (
                <AvatarFallback>{(blog.author?.name || 'U').charAt(0)}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="font-medium">{blog.author?.name || 'Unknown'}</div>
              <div className="text-xs text-muted-foreground">{blog.createdAt ? formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true }) : ''}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <Button variant="outline" onClick={() => navigate(`/create?edit=${blog.id}`)}>Edit</Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    const ok = window.confirm('Are you sure you want to delete this blog? This action cannot be undone.');
                    if (!ok) return;
                    try {
                      const res = await fetch(`http://localhost:5000/api/blogs/delete/${blog.id}`, { method: 'DELETE', credentials: 'include' });
                      const json = await res.json();
                      if (res.ok && json.success) {
                        toast({ title: 'Deleted', description: 'Blog deleted successfully.' });
                        navigate('/');
                      } else {
                        toast({ title: 'Error', description: json.message || 'Failed to delete blog', variant: 'destructive' });
                      }
                    } catch (err: any) {
                      toast({ title: 'Error', description: err.message || 'Failed to delete blog', variant: 'destructive' });
                    }
                  }}
                >
                  Delete
                </Button>
              </>
            )}
            <ShareButton blogId={blog.id || ''} title={blog.title || ''} />
            {!isOwner && (
              <Button 
                variant="outline"
                onClick={() => navigate(`/messages?user=${blog.author?.id || blog.authorId}`)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message Author
              </Button>
            )}
            <Button onClick={() => window.scrollTo({ top: 9999, behavior: 'smooth' })}>Comments</Button>
          </div>
        </div>

        <h1 className="font-display text-3xl font-bold mb-4">{blog.emoji} {blog.title}</h1>

        <div className="mb-6">
          <img src={blog.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop'} alt={blog.title} className="w-full h-[420px] object-cover rounded-xl" />
        </div>

        <div className="prose max-w-none mb-6">
          <p>{blog.content}</p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {blog.tags?.map((t) => (
            <Badge key={t} variant="secondary">#{t}</Badge>
          ))}
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-12">
          <div>{typeof blog.likes === 'number' ? blog.likes : 0} likes</div>
          <div>{Array.isArray(blog.comments) ? blog.comments.length : 0} comments</div>
          <div>{typeof blog.shares === 'number' ? blog.shares : 0} shares</div>
        </div>

        <div id="comments" className="space-y-4">
          <h3 className="font-semibold">Comments</h3>

          {currentUser ? (
            <div className="bg-secondary/50 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-2">{currentUser.name}</div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                      className="text-sm"
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!commentText.trim() || submittingComment}
                      size="sm"
                    >
                      {submittingComment ? 'Posting...' : 'Post'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-secondary/50 p-4 rounded-lg mb-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">Sign in to post comments</p>
              <Button onClick={() => navigate('/login')} size="sm">
                Sign In
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {Array.isArray(blog.comments) && blog.comments.length > 0 ? (
              blog.comments.map((comment) => (
                <div key={comment._id || comment.id} className="bg-secondary/30 p-4 rounded-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author?.avatar} alt={comment.author?.name} />
                        <AvatarFallback>{comment.author?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{comment.author?.name || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'just now'}
                        </div>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                    </div>
                    {(currentUser && comment.author && (comment.author._id === currentUser.id || comment.author.id === currentUser.id)) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteComment(comment._id || comment.id || '')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );

  async function handleAddComment() {
    if (!commentText.trim() || !blog?.id) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`http://localhost:5000/api/blogs/${blog.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: commentText }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Update comments in local state
        setBlog((prev) => {
          if (!prev) return prev;
          const newComment = {
            _id: new Date().getTime().toString(),
            text: commentText,
            author: currentUser || { name: 'You', id: '', avatar: '' },
            createdAt: new Date().toISOString(),
          };
          return {
            ...prev,
            comments: [...(Array.isArray(prev.comments) ? prev.comments : []), newComment],
          };
        });
        setCommentText('');
        toast({ title: 'Success', description: 'Comment added!' });
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to add comment', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to add comment', variant: 'destructive' });
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!blog?.id) return;

    try {
      const res = await fetch(`http://localhost:5000/api/blogs/${blog.id}/comment`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ commentId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Remove comment from local state
        setBlog((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            comments: Array.isArray(prev.comments)
              ? prev.comments.filter((c) => (c._id || c.id) !== commentId)
              : [],
          };
        });
        toast({ title: 'Success', description: 'Comment deleted!' });
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to delete comment', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete comment', variant: 'destructive' });
    }
  }
}
