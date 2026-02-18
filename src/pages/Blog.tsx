import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Calendar, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

// ⚙️ Change this to your WordPress site URL
const WORDPRESS_API_URL = "https://your-wordpress-site.com/wp-json/wp/v2";

type WPPost = {
  id: number;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  link: string;
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string; alt_text: string }>;
    "wp:term"?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
};

const fetchPosts = async (page: number, search: string): Promise<{ posts: WPPost[]; totalPages: number }> => {
  const params = new URLSearchParams({
    page: String(page),
    per_page: "9",
    _embed: "true",
    orderby: "date",
    order: "desc",
  });
  if (search) params.set("search", search);

  const res = await fetch(`${WORDPRESS_API_URL}/posts?${params}`);
  if (!res.ok) throw new Error("Failed to fetch posts");

  const totalPages = Number(res.headers.get("X-WP-TotalPages") || "1");
  const posts: WPPost[] = await res.json();
  return { posts, totalPages };
};

function stripHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

function PostCard({ post }: { post: WPPost }) {
  const image = post._embedded?.["wp:featuredmedia"]?.[0];
  const categories = post._embedded?.["wp:term"]?.[0] || [];
  const excerpt = stripHtml(post.excerpt.rendered).slice(0, 150);

  return (
    <a href={post.link} target="_blank" rel="noopener noreferrer" className="group block">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 bg-card">
        {image && (
          <div className="aspect-video overflow-hidden">
            <img
              src={image.source_url}
              alt={image.alt_text || stripHtml(post.title.rendered)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        <CardHeader className="pb-2">
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {categories.slice(0, 3).map((cat) => (
                <Badge key={cat.id} variant="secondary" className="text-xs font-medium">
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}
          <h3
            className="text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-3">{excerpt}…</p>
        </CardContent>
        <CardFooter className="pt-0 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(post.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
          </span>
          <span className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Read <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </CardFooter>
      </Card>
    </a>
  );
}

function PostSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  );
}

export default function Blog() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["wp-posts", page, search],
    queryFn: () => fetchPosts(page, search),
    staleTime: 5 * 60 * 1000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <>
      <SEOHead title="Blog | Clever Career" description="Career tips, resume advice, and job search strategies from our blog." />
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-primary text-sm font-semibold mb-4">
              <BookOpen className="h-4 w-4" /> Blog
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
              Career Insights & Tips
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Expert advice on resumes, interviews, and landing your dream job.
            </p>

            <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search articles…"
                  className="pl-9"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </div>
        </section>

        {/* Posts grid */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          {isError && (
            <div className="text-center py-16">
              <p className="text-destructive font-medium mb-2">Failed to load posts</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Make sure the WordPress API URL is configured correctly."}
              </p>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <PostSkeleton key={i} />)
              : data?.posts.map((post) => <PostCard key={post.id} post={post} />)}
          </div>

          {!isLoading && data?.posts.length === 0 && (
            <p className="text-center text-muted-foreground py-16">No articles found.</p>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="flex items-center text-sm text-muted-foreground px-3">
                Page {page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
