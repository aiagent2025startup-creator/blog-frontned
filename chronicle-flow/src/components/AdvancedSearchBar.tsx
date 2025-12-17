import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface SearchFilters {
  query: string;
  tags: string[];
  sortBy: "recent" | "trending" | "popular";
  dateRange: "all" | "week" | "month" | "year";
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  availableTags?: string[];
}

export function AdvancedSearchBar({
  onSearch,
  availableTags = [
    "AI",
    "React",
    "TypeScript",
    "Design",
    "Startups",
    "Web3",
    "Remote Work",
    "Productivity",
  ],
}: SearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    tags: [],
    sortBy: "recent",
    dateRange: "all",
  });

  const handleQueryChange = (value: string) => {
    const newFilters = { ...filters, query: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    const newFilters = { ...filters, tags: newTags };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleSortChange = (sort: typeof filters.sortBy) => {
    const newFilters = { ...filters, sortBy: sort };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleDateRangeChange = (range: typeof filters.dateRange) => {
    const newFilters = { ...filters, dateRange: range };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const clearFilters = () => {
    const newFilters: SearchFilters = {
      query: "",
      tags: [],
      sortBy: "recent",
      dateRange: "all",
    };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const hasActiveFilters =
    filters.query ||
    filters.tags.length > 0 ||
    filters.sortBy !== "recent" ||
    filters.dateRange !== "all";

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search blogs, tags, creators..."
          value={filters.query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Sort Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Sort: {filters.sortBy}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.sortBy === "recent"}
              onCheckedChange={() => handleSortChange("recent")}
            >
              Most Recent
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.sortBy === "trending"}
              onCheckedChange={() => handleSortChange("trending")}
            >
              Trending
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.sortBy === "popular"}
              onCheckedChange={() => handleSortChange("popular")}
            >
              Most Popular
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date Range Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              {filters.dateRange === "all" ? "Any Time" : filters.dateRange}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Date Range</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.dateRange === "all"}
              onCheckedChange={() => handleDateRangeChange("all")}
            >
              Any Time
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.dateRange === "week"}
              onCheckedChange={() => handleDateRangeChange("week")}
            >
              This Week
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.dateRange === "month"}
              onCheckedChange={() => handleDateRangeChange("month")}
            >
              This Month
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.dateRange === "year"}
              onCheckedChange={() => handleDateRangeChange("year")}
            >
              This Year
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Tag Filters */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Tags</p>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <Badge
              key={tag}
              variant={filters.tags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {filters.tags.length > 0 && (
        <div className="p-3 bg-secondary/50 rounded-lg">
          <p className="text-sm font-medium mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
                <button
                  onClick={() => toggleTag(tag)}
                  className="ml-1 text-xs hover:text-foreground"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
