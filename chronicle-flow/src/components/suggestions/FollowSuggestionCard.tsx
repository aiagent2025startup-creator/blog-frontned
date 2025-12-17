import { useState } from "react";
import { Link } from "react-router-dom";
import { X, UserPlus, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { FollowSuggestion } from "@/types/blog";

interface FollowSuggestionCardProps {
  suggestion: FollowSuggestion;
  onDismiss?: () => void;
}

export function FollowSuggestionCard({ suggestion, onDismiss }: FollowSuggestionCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleFollow = () => {
    setIsFollowing(true);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 transition-all duration-300 hover:shadow-md animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <Link to={`/profile/${suggestion.user.id}`} className="flex items-center gap-3 group">
          <Avatar className="h-12 w-12 ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
            <AvatarImage src={suggestion.user.avatar} alt={suggestion.user.name} />
            <AvatarFallback>{suggestion.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm group-hover:text-primary transition-colors">
              {suggestion.user.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCount(suggestion.user.followers)} followers
            </p>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {suggestion.user.bio && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {suggestion.user.bio}
        </p>
      )}

      {/* Match Confidence */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Match confidence</span>
          <span className="font-medium text-primary">{suggestion.confidence}%</span>
        </div>
        <Progress value={suggestion.confidence} className="h-1.5" />
      </div>

      {/* Common Stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span>{suggestion.commonLikes} common likes</span>
        <span>•</span>
        <span>{suggestion.mutualFollowers} mutual followers</span>
      </div>

      {/* Follow Button */}
      <Button
        variant={isFollowing ? "secondary" : "gradient"}
        className={cn("w-full", isFollowing && "bg-success/10 text-success hover:bg-success/20")}
        onClick={handleFollow}
        disabled={isFollowing}
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
    </div>
  );
}
