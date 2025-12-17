import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, UserPlus, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User } from "@/types/blog";

interface TrendingCreatorsProps {
  creators: User[];
}

export function TrendingCreators({ creators }: TrendingCreatorsProps) {
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const handleFollow = (userId: string) => {
    setFollowingIds((prev) => new Set(prev).add(userId));
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg">Trending Creators</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {creators.map((creator) => {
          const isFollowing = followingIds.has(creator.id) || creator.isFollowing;

          return (
            <div
              key={creator.id}
              className="flex-shrink-0 w-32 text-center animate-fade-in"
            >
              <Link to={`/profile/${creator.id}`}>
                <Avatar className="h-20 w-20 mx-auto mb-2 ring-2 ring-transparent hover:ring-primary/30 transition-all">
                  <AvatarImage src={creator.avatar} alt={creator.name} />
                  <AvatarFallback className="text-lg">{creator.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <Link to={`/profile/${creator.id}`}>
                <p className="font-medium text-sm hover:text-primary transition-colors truncate">
                  {creator.name}
                </p>
              </Link>
              <p className="text-xs text-muted-foreground mb-2">
                {formatCount(creator.followers)} followers
              </p>
              <Button
                variant={isFollowing ? "secondary" : "outline"}
                size="sm"
                className={cn(
                  "w-full text-xs",
                  isFollowing && "bg-success/10 text-success hover:bg-success/20"
                )}
                onClick={() => handleFollow(creator.id)}
                disabled={isFollowing}
              >
                {isFollowing ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3 w-3 mr-1" />
                    Follow
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
