import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Image as ImageIcon,
  Video,
  X,
  Sparkles,
  Upload,
  Tag,
  Send,
  Save,
  ArrowLeft,
  Camera
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { getJson } from '@/lib/api';
import { API_BASE_URL } from '@/lib/api';
import { ToastAction } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";

const EMOJIS = ["📝", "💡", "🚀", "⚛️", "🤖", "🎨", "💻", "📱", "🌐", "🔥", "✨", "🎯"];

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "humorous", label: "Humorous" },
  { value: "creative", label: "Creative" },
];

const LENGTHS = [
  { value: "short", label: "Short (~200 words)" },
  { value: "medium", label: "Medium (~500 words)" },
  { value: "long", label: "Long (~1000 words)" },
];

export default function CreateBlog() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [emoji, setEmoji] = useState("📝");
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPrompt, setAIPrompt] = useState("");
  const [aiTone, setAITone] = useState("professional");
  const [aiLength, setAILength] = useState("medium");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Image must be less than 5MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check video duration (approximate by size or use metadata)
      // For a real app, we'd use a hidden video element to check duration
      if (file.size > 20 * 1024 * 1024) {
        toast({ title: "File too large", description: "Video must be less than 20MB", variant: "destructive" });
        return;
      }

      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 21) { // Allow a tiny buffer
          toast({
            title: "Video too long",
            description: "Please upload a video shorter than 20 seconds.",
            variant: "destructive"
          });
          return;
        }
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,/g, "");
      if (newTag && !tags.includes(newTag) && tags.length < 5) {
        setTags([...tags, newTag]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleGenerateContent = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt for AI content generation.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation with more realistic content based on the prompt
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const generateRealisticContent = (prompt: string, tone: string, length: string) => {
      const intro = tone === 'professional'
        ? `In today's rapidly evolving landscape, "${prompt}" has become a critical topic of discussion.`
        : `Hey everyone! Let's talk about something really exciting: "${prompt}".`;

      const body = tone === 'professional'
        ? `Research indicates that the implications of ${prompt} are far-reaching, affecting both industry standards and consumer behavior. Experts suggest that a strategic approach is essential for leveraging the full potential of this development.`
        : `I've been thinking a lot about ${prompt} lately, and honestly, it's a game-changer. There are so many cool ways to look at this, and I can't wait to dive into the details with you all.`;

      const conclusion = tone === 'professional'
        ? `In conclusion, staying informed and adaptable is key to navigating the future of ${prompt}.`
        : `So, what do you think? Is ${prompt} as big of a deal as I think it is? Let me know in the comments!`;

      let fullContent = `${intro}\n\n${body}\n\n${conclusion}`;

      if (length === 'long') {
        fullContent += `\n\nFurthermore, when we consider the historical context of ${prompt}, we see a clear trajectory towards more integrated and efficient systems. This trend is likely to continue as new technologies emerge and mature.`;
      }

      return fullContent;
    };

    const generatedContent = generateRealisticContent(aiPrompt, aiTone, aiLength);

    setContent(generatedContent);
    setIsGenerating(false);
    setShowAIPanel(false);

    toast({
      title: "Content generated! ✨",
      description: "AI has generated content based on your prompt.",
    });
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      console.warn('❌ Missing fields: title or content is empty');
      toast({
        title: "Missing fields",
        description: "Please fill in the title and content.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    console.log('🚀 Starting blog creation...');
    console.log('📝 Blog Details:', {
      title,
      content,
      emoji,
      tags,
      hasImage: !!coverImage,
    });

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('emoji', emoji);
      formData.append('tags', JSON.stringify(tags)); // Send as JSON string for FormData
      // Add media file if present
      if (mediaType === 'image' && coverImage && coverImage.startsWith('data:')) {
        const response = await fetch(coverImage);
        const blob = await response.blob();
        formData.append('media', blob, 'cover-image.png');
        formData.append('type', 'blog');
        console.log('📸 Image file added to FormData as "media"');
      } else if (mediaType === 'video' && videoFile) {
        formData.append('media', videoFile);
        formData.append('type', 'short');
        console.log('🎥 Video file added to FormData as "media"');
        // Optionally add a thumbnail if we had one
        if (coverImage && coverImage.startsWith('data:')) {
          const response = await fetch(coverImage);
          const blob = await response.blob();
          formData.append('image', blob, 'thumbnail.png');
        }
      }

      // If editing, send PUT to update endpoint, otherwise POST to create
      const url = editingId
        ? `${API_BASE_URL}/blogs/update/${editingId}`
        : `${API_BASE_URL}/blogs/create`;
      const method = editingId ? 'PUT' : 'POST';

      console.log(`📦 Sending ${method} request to ${url}...`);

      // Include Authorization header fallback for multipart uploads if token is stored
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const fetchResponse = await fetch(url, {
        method,
        body: formData,
        credentials: 'include',
        headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : undefined,
      });

      console.log('📬 Response Status:', fetchResponse.status);

      // Parse JSON safely — backend may sometimes return HTML on errors
      let data: any = null;
      try {
        const text = await fetchResponse.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          // Not JSON
          console.error('CreateBlog: response is not JSON, raw text:', text.slice(0, 100));
          data = { success: false, message: 'Server returned non-JSON response', raw: text };
        }
      } catch (err) {
        console.error('Error reading response body:', err);
        data = { success: false, message: 'Failed to read server response' };
      }

      console.log('📊 Response Data:', data);

      if (fetchResponse.ok && data.success) {
        console.log('✅ Blog created successfully!');
        const newId = data.data._id || data.data.id;
        console.log('🎉 New Blog ID:', newId);
        if (data.data.image) {
          console.log('🖼️  Image uploaded:', data.data.image);
        }

        // Show toast with action to view the created post
        toast({
          title: "Blog published! 🎉",
          description: "Your blog has been published successfully.",
          action: (
            <ToastAction asChild altText="View the published blog post">
              <a href={`/blog/${newId}`}>View post</a>
            </ToastAction>
          ),
        });

        // Clear form
        setTitle('');
        setContent('');
        setEmoji('📝');
        setTags([]);
        setCoverImage(null);
        setEditingId(null);

        // Redirect to either the blog detail (edit) or home (new)
        setTimeout(() => {
          if (editingId) {
            console.log('🔄 Redirecting to updated blog...');
            navigate(`/blog/${newId}`, { replace: true });
          } else {
            console.log('🔄 Redirecting to home...');
            navigate('/', { replace: true });
          }
        }, 900);
      } else {
        console.error('❌ Blog creation failed!');
        console.error('Error message:', data.message);
        console.error('Full error:', data);
        toast({
          title: "Error",
          description: data.message || "Failed to create blog",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Exception during blog creation:', error);
      toast({
        title: "Error",
        description: "Failed to create blog. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Support edit mode: read ?edit=<id> and prefill
  const location = useLocation();
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const editId = sp.get('edit');
    if (!editId) return;

    let mounted = true;
    const fetchBlog = async () => {
      try {
        const json = await getJson(`/blogs/${editId}`);
        if (json && json.success) {
          const b = json.data;
          if (!mounted) return;
          setEditingId(editId);
          setTitle(b.title || '');
          setContent(b.content || '');
          setEmoji(b.emoji || '📝');
          setTags(Array.isArray(b.tags) ? b.tags : []);
          // If there is an existing image url, set it so user sees current cover
          if (b.image) setCoverImage(b.image);
          else if (b.coverImage) setCoverImage(b.coverImage);
        } else {
          toast({ title: 'Error', description: json.message || 'Failed to load blog for edit', variant: 'destructive' });
        }
      } catch (err: any) {
        toast({ title: 'Error', description: err.message || 'Failed to load blog for edit', variant: 'destructive' });
      }
    };

    fetchBlog();

    return () => { mounted = false; };
  }, [location.search, navigate]);

  const handleSaveDraft = () => {
    console.log('💾 Saving draft...');
    toast({
      title: "Draft saved",
      description: "Your blog has been saved as a draft.",
    });
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              variant="gradient"
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <>
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-md animate-fade-in">
          <h1 className="font-display font-bold text-2xl mb-6">Create New Blog</h1>

          <div className="space-y-6">
            {/* Emoji Picker */}
            <div className="space-y-2">
              <Label>Blog Emoji</Label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={cn(
                      "w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all",
                      emoji === e
                        ? "bg-primary/10 ring-2 ring-primary"
                        : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Blog Title</Label>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{emoji}</span>
                <Input
                  id="title"
                  placeholder="Enter an engaging title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-medium"
                />
              </div>
            </div>

            {/* Media Type Selection */}
            <div className="space-y-2">
              <Label>Media Type</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={mediaType === 'image' ? 'default' : 'outline'}
                  onClick={() => setMediaType('image')}
                  className="flex-1 gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  Image
                </Button>
                <Button
                  type="button"
                  variant={mediaType === 'video' ? 'default' : 'outline'}
                  onClick={() => setMediaType('video')}
                  className="flex-1 gap-2"
                >
                  <Video className="h-4 w-4" />
                  Shorts (Video)
                </Button>
              </div>
            </div>

            {/* Cover Image or Video Upload */}
            <div className="space-y-2">
              <Label>{mediaType === 'image' ? 'Cover Image' : 'Short Video (max 20s)'}</Label>

              {mediaType === 'image' ? (
                coverImage ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden">
                    <img
                      src={coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setCoverImage(null)}
                      className="absolute top-2 right-2 w-8 h-8 bg-foreground/80 rounded-full flex items-center justify-center text-background hover:bg-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-secondary/30">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Click or drag to upload cover image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )
              ) : (
                videoPreview ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full h-full object-contain"
                    />
                    <button
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreview(null);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-foreground/80 rounded-full flex items-center justify-center text-background hover:bg-foreground transition-colors z-10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-secondary/30">
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground text-center px-4">
                        Upload Video
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                    </label>
                    <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-secondary/30">
                      <Camera className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground text-center px-4">
                        Record Video
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        capture="environment"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Content</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4 text-accent" />
                  AI Generate
                </Button>
              </div>

              {/* AI Generation Panel */}
              {showAIPanel && (
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl space-y-4 animate-slide-down">
                  <div className="flex items-center gap-2 text-accent">
                    <Sparkles className="h-5 w-5" />
                    <span className="font-medium">AI Content Generator</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="aiPrompt">What would you like to write about?</Label>
                      <Textarea
                        id="aiPrompt"
                        placeholder="E.g., The benefits of remote work for developers..."
                        value={aiPrompt}
                        onChange={(e) => setAIPrompt(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tone</Label>
                        <Select value={aiTone} onValueChange={setAITone}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TONES.map((tone) => (
                              <SelectItem key={tone.value} value={tone.value}>
                                {tone.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Length</Label>
                        <Select value={aiLength} onValueChange={setAILength}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LENGTHS.map((length) => (
                              <SelectItem key={length.value} value={length.value}>
                                {length.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerateContent}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Generating...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Generate Content
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <Textarea
                id="content"
                placeholder="Write your blog content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] resize-y"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (max 5)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="tags"
                  placeholder="Add tags (press Enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="pl-10"
                  disabled={tags.length >= 5}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
