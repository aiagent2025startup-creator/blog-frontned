import { MainLayout } from "@/components/layout/MainLayout";
import { BlogCard } from "@/components/blog/BlogCard";
import { FollowSuggestionCard } from "@/components/suggestions/FollowSuggestionCard";
import { TrendingCreators } from "@/components/suggestions/TrendingCreators";
import { TrendingUp, Users, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Blog } from "@/types/blog";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { AdvancedSearchBar } from "@/components/AdvancedSearchBar";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { realtimeConfig } from "@/config/realtimeConfig";

interface SearchFilters {
  query: string;
  tags: string[];
  sortBy: "recent" | "trending" | "popular";
  dateRange: "all" | "week" | "month" | "year";
}

export default function Home() {
  const { user } = useUser();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    tags: [],
    sortBy: "recent",
    dateRange: "all",
  });

  // Enable real-time updates
  useRealtimeUpdates();

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching blogs from API...');
      const response = await fetch('http://localhost:5000/api/blogs/all', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Fetched ${data.data?.length || 0} blogs`);
        setBlogs(data.data || []);
        applyFilters(data.data || [], filters);
      } else {
        console.error('❌ Failed to fetch blogs - Status:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching blogs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = (blogsToFilter: Blog[], currentFilters: SearchFilters) => {
    let result = blogsToFilter;

    // Filter by search query
    if (currentFilters.query) {
      const query = currentFilters.query.toLowerCase();
      result = result.filter(
        (blog) =>
          blog.title?.toLowerCase().includes(query) ||
          blog.content?.toLowerCase().includes(query) ||
          blog.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by tags
    if (currentFilters.tags.length > 0) {
      result = result.filter((blog) =>
        currentFilters.tags.some((tag) =>
          blog.tags?.some((blogTag) =>
            blogTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    // Filter by date range
    if (currentFilters.dateRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();

      if (currentFilters.dateRange === "week") {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (currentFilters.dateRange === "month") {
        cutoffDate.setMonth(now.getMonth() - 1);
      } else if (currentFilters.dateRange === "year") {
        cutoffDate.setFullYear(now.getFullYear() - 1);
      }

      result = result.filter((blog) => {
        const blogDate = new Date(blog.createdAt || 0);
        return blogDate >= cutoffDate;
      });
    }

    // Sort blogs
    if (currentFilters.sortBy === "trending") {
      result = result.sort((a, b) => {
        const aScore = (Array.isArray(a.likes) ? a.likes.length : a.likes || 0) * 1.5 +
          (Array.isArray(a.comments) ? a.comments.length : a.comments || 0) * 2;
        const bScore = (Array.isArray(b.likes) ? b.likes.length : b.likes || 0) * 1.5 +
          (Array.isArray(b.comments) ? b.comments.length : b.comments || 0) * 2;
        return bScore - aScore;
      });
    } else if (currentFilters.sortBy === "popular") {
      result = result.sort((a, b) => {
        const aLikes = Array.isArray(a.likes) ? a.likes.length : a.likes || 0;
        const bLikes = Array.isArray(b.likes) ? b.likes.length : b.likes || 0;
        return bLikes - aLikes;
      });
    } else {
      // Sort by recent (default)
      result = result.sort((a, b) => {
        const aDate = new Date(a.createdAt || 0).getTime();
        const bDate = new Date(b.createdAt || 0).getTime();
        return bDate - aDate;
      });
    }

    setFilteredBlogs(result);
  };

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    applyFilters(blogs, newFilters);
  };

  useEffect(() => {
    fetchBlogs();
    
    // Removed periodic auto-refetch to prevent automatic page reloads.
    // Use manual refresh button or enable `realtimeConfig.autoRefetchBlogs` explicitly if needed.

    // Also listen for visibility change - refetch when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👀 Page became visible - refreshing blogs');
        fetchBlogs();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    console.log('🔄 Manual refresh triggered');
    await fetchBlogs();
  };

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h1 className="font-display font-bold text-2xl">Your Feed</h1>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {/* Advanced Search Bar */}
          <AdvancedSearchBar onSearch={handleSearch} />
          
          {loading ? (
            <div className="text-center text-muted-foreground py-12">
              <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
              Loading blogs...
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 bg-card rounded-2xl border border-border">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>{filters.query || filters.tags.length > 0 ? 'No blogs match your filters' : 'No blogs available yet'}</p>
              <p className="text-sm">Start creating or check back soon!</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                Showing {filteredBlogs.length} blog{filteredBlogs.length !== 1 ? 's' : ''}
              </div>
              {filteredBlogs.map((blog, index) => (
                <div
                  key={blog.id}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="animate-slide-up"
                >
                  <BlogCard blog={blog} isOwner={user?.id === blog.authorId} />
                </div>
              ))}
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Trending Creators */}
          <TrendingCreators creators={[]} />

          {/* Follow Suggestions */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-display font-semibold text-lg">Suggested for You</h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center py-4">No suggestions available yet</p>
            </div>
          </div>

          {/* Trending Tags */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="font-display font-semibold text-lg mb-4">Trending Tags</h3>
            <div className="flex flex-wrap gap-2">
              {["React", "AI", "Design", "Startups", "Web3", "TypeScript", "UX", "Remote Work"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-secondary rounded-full text-sm text-secondary-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-xs text-muted-foreground space-y-2">
            <div className="flex flex-wrap gap-2">
              <a href="#" className="hover:underline">About</a>
              <span>•</span>
              <a href="#" className="hover:underline">Help</a>
              <span>•</span>
              <a href="#" className="hover:underline">Privacy</a>
              <span>•</span>
              <a href="#" className="hover:underline">Terms</a>
            </div>
            <p>© 2024 BlogSphere</p>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}
