"use client";

import { useManager } from "@/context/ManagerContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ManagerBlogsPage() {
  const {
    blogs,
    filteredBlogs,
    blogSearch,
    setBlogSearch,
    blogStatusFilter,
    setBlogStatusFilter,
    totalBlogs,
    publishedBlogsCount,
    draftBlogsCount,
    handleOpenAddBlog,
    handleOpenEditBlog,
    handleToggleBlogStatus,
    handleOpenDeleteBlogModal,
  } = useManager();

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search articles..."
            value={blogSearch}
            onChange={(e) => setBlogSearch(e.target.value)}
            className="w-64 text-xs"
          />
          <select
            value={blogStatusFilter}
            onChange={(e) => setBlogStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground"
          >
            <option value="all">All Statuses ({totalBlogs})</option>
            <option value="published">Published ({publishedBlogsCount})</option>
            <option value="draft">Drafts ({draftBlogsCount})</option>
          </select>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenAddBlog}>
          + Write New Post
        </Button>
      </div>

      {/* Articles Table */}
      {filteredBlogs.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          }
          title="No Articles Found"
          description={
            blogSearch || blogStatusFilter !== "all"
              ? "No blog articles match your active search or status filter."
              : "No technical articles published or drafted yet."
          }
          action={
            <Button variant="primary" size="sm" onClick={handleOpenAddBlog}>
              + Write First Post
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Published Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBlogs.map((blog) => {
                  const isPublished = Boolean(blog.publishedAt);

                  return (
                    <TableRow key={blog.documentId || blog.id}>
                      <TableCell>
                        <div className="font-semibold text-foreground text-xs line-clamp-1 max-w-xs">
                          {blog.title}
                        </div>
                        <div className="text-[10px] text-muted line-clamp-1 max-w-xs">
                          {blog.excerpt || "No excerpt summary."}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {blog.category?.name || "Engineering"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isPublished ? "highlight" : "secondary"}>
                          {isPublished ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted">
                        {blog.author?.username || "Editorial Team"}
                      </TableCell>
                      <TableCell className="text-xs text-muted">
                        {blog.publishedAt
                          ? new Date(blog.publishedAt).toLocaleDateString()
                          : "Unpublished"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="surface"
                            size="sm"
                            className="text-xs py-1"
                            onClick={() => handleToggleBlogStatus(blog)}
                          >
                            {isPublished ? "Unpublish" : "Publish"}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs py-1"
                            onClick={() => handleOpenEditBlog(blog)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="text-xs py-1"
                            onClick={() => handleOpenDeleteBlogModal(blog)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
