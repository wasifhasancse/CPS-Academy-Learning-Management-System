"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

const FALLBACK_BLOGS = [
  {
    id: 1,
    title: "How to Reach Candidate Master on Codeforces in 6 Months",
    slug: "how-to-reach-candidate-master-on-codeforces",
    excerpt:
      "A structured roadmap covering dynamic programming, graph theory, and contest strategies from CPS Academy coaches.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200",
    publishedAt: "2026-08-20",
    category: { name: "Competitive Programming" },
    author: { username: "CPS Editorial Team" },
  },
  {
    id: 2,
    title: "Building Resilient Microservices with Clean Architecture",
    slug: "building-resilient-microservices-clean-architecture",
    excerpt:
      "Key architectural patterns for designing fault-tolerant, scalable distributed systems.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200",
    publishedAt: "2026-08-24",
    category: { name: "Software Engineering" },
    author: { username: "CPS Engineering" },
  },
];

export default function BlogListPage() {
  const [blogs, setBlogs] = useState(FALLBACK_BLOGS);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBlogs() {
      try {
        const [blogRes, catRes] = await Promise.all([
          api.get("/blog-posts?populate=author&populate=category").catch(() => null),
          api.get("/categories").catch(() => null),
        ]);

        if (Array.isArray(blogRes?.data) && blogRes.data.length > 0) {
          setBlogs(blogRes.data);
        }
        if (Array.isArray(catRes?.data) && catRes.data.length > 0) {
          setCategories(catRes.data);
        }
      } catch (err) {
        console.warn("Could not fetch published blogs from API:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBlogs();
  }, []);

  const filteredBlogs = blogs.filter((blog) => {
    const titleMatch =
      !search ||
      blog.title?.toLowerCase().includes(search.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(search.toLowerCase());
    const catMatch =
      selectedCategory === "all" ||
      blog.category?.slug === selectedCategory ||
      blog.category?.name === selectedCategory;
    return titleMatch && catMatch;
  });

  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="highlight">CPS Academy Engineering Blog</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Articles, Roadmaps & Engineering Insights
        </h1>
        <p className="text-sm sm:text-base text-muted">
          Deep-dives into Competitive Programming, Full-Stack Architecture, and System Design from our instructors and community.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border">
        <Input
          placeholder="Search articles by title or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 text-xs"
        />

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <Button
            variant={selectedCategory === "all" ? "primary" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
            className="text-xs flex-shrink-0"
          >
            All Topics
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.documentId || cat.id}
              variant={selectedCategory === cat.slug ? "primary" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.slug || cat.name)}
              className="text-xs flex-shrink-0"
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Blog Cards Grid */}
      {filteredBlogs.length === 0 ? (
        <div className="p-16 text-center text-muted text-sm border border-dashed border-border rounded-xl">
          No published articles matching your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => {
            const slug = blog.slug || String(blog.documentId || blog.id);
            const publishDate = blog.publishedAt
              ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recently Published";

            return (
              <Card
                key={blog.documentId || blog.id}
                className="flex flex-col justify-between overflow-hidden hover:border-primary/50 transition-colors group"
              >
                {blog.coverImageUrl && (
                  <div className="h-44 w-full overflow-hidden bg-muted/20">
                    <img
                      src={blog.coverImageUrl}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 text-[11px] text-muted mb-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {blog.category?.name || "Engineering"}
                    </Badge>
                    <span>{publishDate}</span>
                  </div>

                  <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                    <Link href={`/blog/${slug}`}>{blog.title}</Link>
                  </CardTitle>

                  <CardDescription className="line-clamp-3 text-xs mt-1">
                    {blog.excerpt || "Read the full technical breakdown on CPS Academy."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 flex items-center justify-between border-t border-border mt-auto pt-3 text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary dark:text-highlight flex items-center justify-center font-bold text-[10px]">
                      {blog.author?.username?.[0]?.toUpperCase() || "C"}
                    </div>
                    <span className="font-medium text-foreground text-[11px]">
                      {blog.author?.username || "CPS Team"}
                    </span>
                  </div>

                  <Button href={`/blog/${slug}`} variant="outline" size="sm" className="text-xs">
                    Read Article →
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
