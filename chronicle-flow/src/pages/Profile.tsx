import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  Edit, 
  UserPlus, 
  Check,
  Share2,
  MessageCircle,
  Grid,
  Heart,
  Settings
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { BlogCard } from "@/components/blog/BlogCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Blog } from "@/types/blog";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  followers: number;
  following: number;
  blogCount: number;
  totalLikes: number;
  createdAt: string;
}

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userBlogs, setUserBlogs] = useState<Blog[]>([]);
  const [likedBlogs, setLikedBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Determine which user ID to fetch
        const targetUserId = userId === "current" || !userId ? currentUser?.id : userId;
        
        // Fetch user profile
        const profileResponse = await fetch(`http://localhost:5000/api/profiles/${targetUserId}`, {
          credentials: 'include',
        });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          const userData = {
            id: profileData.data.user._id,
            name: profileData.data.user.name,
            email: profileData.data.user.email,
            avatar: profileData.data.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
            bio: profileData.data.bio || '',
            location: profileData.data.location || '',
            website: profileData.data.website || '',
            followers: profileData.data.followers?.length || 0,
            following: profileData.data.following?.length || 0,
            blogCount: profileData.data.totalBlogs || 0,
            totalLikes: profileData.data.totalLikes || 0,
            createdAt: profileData.data.createdAt || new Date().toISOString(),
          };
          setUser(userData);
        } else {
          // Cannot fetch without targetUserId
          console.error('No user ID to fetch');
          setLoading(false);
          return;
        }

        // Fetch all blogs and filter by user
        const blogsResponse = await fetch('http://localhost:5000/api/blogs/all', {
          credentials: 'include',
        });
        if (blogsResponse.ok) {
          const blogsData = await blogsResponse.json();
          const allBlogs = blogsData.data || [];
          const targetUserId2 = userId === "current" || !userId ? currentUser?.id : userId;
          const targetBlogsForUser = allBlogs.filter((blog: Blog) => blog.authorId === targetUserId2);
          setUserBlogs(targetBlogsForUser);
          setLikedBlogs(allBlogs.filter((blog: Blog) => blog.isLiked));
          
          // Compute blog count and total likes from user's blogs
          const computedBlogCount = targetBlogsForUser.length;
          const computedTotalLikes = targetBlogsForUser.reduce((sum, blog) => sum + (blog.likes || 0), 0);
          
          // Update user stats with computed values
          setUser(prev => prev ? { ...prev, blogCount: computedBlogCount, totalLikes: computedTotalLikes } : null);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-lg font-medium">User not found</p>
        </div>
      </MainLayout>
    );
  }

  const isOwnProfile = user?.id === currentUser?.id;

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-md animate-fade-in">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-primary via-accent to-primary/80" />

          {/* Profile Info */}
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <Avatar className="h-32 w-32 ring-4 ring-card">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>

            {/* Name & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="font-display font-bold text-2xl">{user.name}</h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>

              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <>
                    <Link to="/profile/edit">
                      <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                    <Link to="/settings">
                      <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Button
                      variant={isFollowing ? "secondary" : "gradient"}
                      onClick={handleFollow}
                      className={cn(
                        isFollowing && "bg-success/10 text-success hover:bg-success/20"
                      )}
                    >
                      {isFollowing ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => navigate(`/messages?user=${user.id}`)}
                      title="Send message"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-foreground mb-4">{user.bio}</p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {user.location}
                </div>
              )}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <LinkIcon className="h-4 w-4" />
                  {user.website.replace(/^https?:\/\//, "")}
                </a>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {format(new Date(user.createdAt), "MMMM yyyy")}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                to={`/followers/${user.id}`}
                className="bg-secondary/50 rounded-xl p-4 text-center hover:bg-secondary transition-colors"
              >
                <p className="font-display font-bold text-2xl">
                  {formatCount(user.followers)}
                </p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </Link>
              <Link
                to={`/following/${user.id}`}
                className="bg-secondary/50 rounded-xl p-4 text-center hover:bg-secondary transition-colors"
              >
                <p className="font-display font-bold text-2xl">
                  {formatCount(user.following)}
                </p>
                <p className="text-sm text-muted-foreground">Following</p>
              </Link>
              <div className="bg-secondary/50 rounded-xl p-4 text-center">
                <p className="font-display font-bold text-2xl">{user.blogCount}</p>
                <p className="text-sm text-muted-foreground">Blogs</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-4 text-center">
                <p className="font-display font-bold text-2xl">
                  {formatCount(user.totalLikes)}
                </p>
                <p className="text-sm text-muted-foreground">Total Likes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="blogs" className="mt-6">
          <TabsList className="w-full justify-start bg-card border border-border rounded-xl p-1">
            <TabsTrigger
              value="blogs"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Grid className="h-4 w-4" />
              Blogs
            </TabsTrigger>
            <TabsTrigger
              value="liked"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Heart className="h-4 w-4" />
              Liked
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blogs" className="mt-6 space-y-6">
            {userBlogs.length > 0 ? (
              userBlogs.map((blog, index) => (
                <div
                  key={blog.id}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="animate-slide-up"
                >
                  <BlogCard blog={blog} isOwner={isOwnProfile} />
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                <Grid className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No blogs yet</p>
                <p className="text-muted-foreground mb-4">
                  {isOwnProfile
                    ? "Start sharing your stories with the world!"
                    : "This user hasn't published any blogs yet."}
                </p>
                {isOwnProfile && (
                  <Link to="/create">
                    <Button variant="gradient">Create Your First Blog</Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="liked" className="mt-6 space-y-6">
            {likedBlogs.length > 0 ? (
              likedBlogs.map((blog, index) => (
                <div
                  key={blog.id}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="animate-slide-up"
                >
                  <BlogCard blog={blog} />
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No liked blogs</p>
                <p className="text-muted-foreground">
                  {isOwnProfile
                    ? "Blogs you like will appear here."
                    : "This user hasn't liked any blogs yet."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
