export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  location?: string;
  website?: string;
  followers: number;
  following: number;
  blogCount: number;
  totalLikes: number;
  isFollowing?: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  emoji: string;
  coverImage: string;
  tags: string[];
  authorId: string;
  author: Pick<User, 'id' | 'name' | 'avatar'>;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FollowSuggestion {
  user: User;
  confidence: number;
  commonLikes: number;
  mutualFollowers: number;
}
