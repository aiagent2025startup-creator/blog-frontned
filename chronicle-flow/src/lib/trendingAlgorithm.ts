/**
 * Trending algorithm for 2026-style feed ranking
 * Factors: engagement (likes, comments, shares), recency, author reputation
 */

import { Blog } from "@/types/blog";

/**
 * Calculate trending score for a blog post
 * Higher score = more trending
 */
export function calculateTrendingScore(blog: Blog): number {
  const now = new Date().getTime();
  const createdAt = new Date(blog.createdAt).getTime();
  const ageInHours = (now - createdAt) / (1000 * 60 * 60);
  
  // Normalize engagement metrics
  const likes = typeof blog.likes === 'number' ? blog.likes : 0;
  const comments = typeof blog.comments === 'number' ? blog.comments : 0;
  const shares = typeof blog.shares === 'number' ? blog.shares : 0;

  // Calculate engagement rate
  const engagementScore = likes * 1.5 + comments * 2 + shares * 3;
  
  // Recency bonus (recent posts get a boost, but decay over time)
  const recencyBoost = Math.max(1, 100 / (1 + ageInHours / 24));
  
  // Final trending score (logarithmic to prevent outliers from dominating)
  const score = Math.log(engagementScore + 1) * recencyBoost;

  return score;
}

/**
 * Sort blogs by trending score
 */
export function getTrendingBlogs(blogs: Blog[]): Blog[] {
  return blogs
    .sort((a, b) => calculateTrendingScore(b) - calculateTrendingScore(a));
}

/**
 * Get category-specific trending blogs
 */
export function getTrendingInCategory(
  blogs: Blog[],
  category: string,
  limit: number = 10
): Blog[] {
  const filtered = blogs.filter((blog) =>
    blog.tags?.some((tag) =>
      tag.toLowerCase().includes(category.toLowerCase())
    )
  );
  
  return getTrendingBlogs(filtered).slice(0, limit);
}
