import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Compass, Hash, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BlogCard } from "@/components/blog/BlogCard";
import { getTrendingBlogs, getTrendingInCategory } from "@/lib/trendingAlgorithm";
import { toast } from "@/hooks/use-toast";
import { Blog } from "@/types/blog";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";

export default function Discover() {
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [trendingBlogs, setTrendingBlogs] = useState<Blog[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Enable real-time updates
  useRealtimeUpdates();

  const categories = [
    { tag: "AI", icon: "🤖" },
    { tag: "React", icon: "⚛️" },
    { tag: "TypeScript", icon: "📘" },
    { tag: "Design", icon: "🎨" },
    { tag: "Startups", icon: "🚀" },
    { tag: "Web3", icon: "🌐" },
    { tag: "Remote Work", icon: "💼" },
    { tag: "Productivity", icon: "⚡" },
  ];

  // Normalize API response to Blog type
  const normalizeBlog = (rawBlog: any): Blog => ({
    id: rawBlog._id || rawBlog.id || '',
    title: rawBlog.title || '',
    content: rawBlog.content || '',
    emoji: rawBlog.emoji || '📝',
    coverImage: rawBlog.image || rawBlog.coverImage || '',
    tags: rawBlog.tags || [],
    authorId: rawBlog.authorId || rawBlog.author?._id || rawBlog.author?.id || '',
    author: rawBlog.author ? {
      id: rawBlog.author._id || rawBlog.author.id || '',
      name: rawBlog.author.name || 'Unknown',
      avatar: rawBlog.author.avatar || '',
    } : { id: '', name: 'Unknown', avatar: '' },
    likes: Array.isArray(rawBlog.likes) ? rawBlog.likes.length : (rawBlog.likes || 0),
    comments: Array.isArray(rawBlog.comments) ? rawBlog.comments.length : (rawBlog.comments || 0),
    shares: Array.isArray(rawBlog.shares) ? rawBlog.shares.length : (rawBlog.shares || 0),
    isLiked: false,
    isBookmarked: false,
    createdAt: rawBlog.createdAt || new Date().toISOString(),
    updatedAt: rawBlog.updatedAt || new Date().toISOString(),
  });

  useEffect(() => {
    const fetchAndTrend = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/blogs/all', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          const rawBlogs = data.data || [];
          const normalizedBlogs = rawBlogs.map(normalizeBlog);
          setAllBlogs(normalizedBlogs);
          
          if (selectedCategory) {
            const categoryTrending = getTrendingInCategory(normalizedBlogs, selectedCategory, 20);
            setTrendingBlogs(categoryTrending);
          } else {
            const trending = getTrendingBlogs(normalizedBlogs).slice(0, 20);
            setTrendingBlogs(trending);
          }
        }
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load trending content',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAndTrend();
  }, [selectedCategory]);

  const trendingTags = categories.map((cat, idx) => {
    const blogsInTag = allBlogs.filter((blog) =>
      blog.tags?.some((tag) => tag.toLowerCase().includes(cat.tag.toLowerCase()))
    ).length;
    return { ...cat, count: blogsInTag };
  });

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Compass className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl">Discover</h1>
            <p className="text-muted-foreground">
              Explore trending content and find new creators to follow
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Trending Blogs */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-accent" />
                <h2 className="font-display font-semibold text-xl">
                  {selectedCategory ? `Trending in ${selectedCategory}` : "Trending Now"}
                </h2>
              </div>
              <div className="space-y-6">
                {loading ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Loading trending content...</p>
                ) : trendingBlogs.length > 0 ? (
                  trendingBlogs.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No trending content yet in this category
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Trending Tags */}
            <div className="bg-card rounded-2xl border border-border p-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-lg">Explore Categories</h3>
              </div>
              <div className="space-y-3">
                {trendingTags.map((item) => (
                  <button
                    key={item.tag}
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === item.tag ? null : item.tag
                      )
                    }
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedCategory === item.tag
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-secondary/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.tag}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-card rounded-2xl border border-border p-5 animate-fade-in">
              <h3 className="font-display font-semibold text-lg mb-4">
                Popular Categories
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Technology",
                  "Design",
                  "Business",
                  "Lifestyle",
                  "Travel",
                  "Health",
                  "Education",
                  "Entertainment",
                ].map((category) => (
                  <button
                    key={category}
                    className="px-4 py-2 bg-secondary/50 rounded-lg text-sm hover:bg-primary/10 hover:text-primary transition-colors text-left"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
