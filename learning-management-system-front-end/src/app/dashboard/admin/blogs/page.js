"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { TableSkeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useAdmin } from "@/context/AdminContext";
import {
  HiOutlineDocumentText,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlinePlus,
  HiOutlineTrash,
} from "react-icons/hi2";

export default function AdminBlogsPage() {
  const {
    filteredBlogs,
    isLoading,
    isActionLoading,
    blogSearch,
    setBlogSearch,
    blogStatusFilter,
    setBlogStatusFilter,
    totalBlogs,
    publishedBlogsCount,
    draftBlogsCount,
    handleOpenAddBlog,
    handleOpenEditBlog,
    handleOpenDeleteBlogModal,
  } = useAdmin();

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Input
              placeholder="Search blog articles..."
              value={blogSearch}
              onChange={(e) => setBlogSearch(e.target.value)}
              className="w-full text-xs pl-8"
            />
            <HiOutlineMagnifyingGlass className="w-4 h-4 text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <select
            value={blogStatusFilter}
            onChange={(e) => setBlogStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface border border-border text-xs text-foreground font-semibold focus:outline-none"
          >
            <option value="all">All Articles ({totalBlogs})</option>
            <option value="published">
              Published Only ({publishedBlogsCount})
            </option>
            <option value="draft">Drafts Only ({draftBlogsCount})</option>
          </select>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAddBlog}
          className="shrink-0 font-bold"
        >
          <HiOutlinePlus className="w-4 h-4 mr-1" />
          <span>Write New Post</span>
        </Button>
      </div>

      {/* Blogs Table Card */}
      {isLoading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : filteredBlogs.length === 0 ? (
        <EmptyState
          icon={<HiOutlineDocumentText className="w-8 h-8 text-muted" />}
          title="No Articles Found"
          description={
            blogSearch || blogStatusFilter !== "all"
              ? "No technical articles match your active search filter or status selection."
              : "No articles have been created yet. Click 'Write New Post' to author your first article as Draft."
          }
          action={
            <Button variant="primary" size="sm" onClick={handleOpenAddBlog}>
              <HiOutlinePlus className="w-4 h-4 mr-1" />
              <span>Write First Post</span>
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table className="pt-2 border-0! rounded-none! bg-transparent!">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 sm:px-4 py-3.5 whitespace-nowrap text-foreground">
                    Article Title
                  </TableHead>
                  <TableHead className="px-4 sm:px-4 py-3.5 whitespace-nowrap text-center text-foreground">
                    Category
                  </TableHead>
                  <TableHead className="px-4 sm:px-4 py-3.5 whitespace-nowrap text-center text-foreground">
                    Status
                  </TableHead>
                  <TableHead className="px-4 sm:px-4 py-3.5 whitespace-nowrap text-center text-foreground">
                    Author
                  </TableHead>
                  <TableHead className="px-4 sm:px-4 py-3.5 whitespace-nowrap text-center text-foreground">
                    Published Date
                  </TableHead>
                  <TableHead className="px-4 sm:px-4 py-3.5 whitespace-nowrap text-right text-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {filteredBlogs.map((blog, idx) => {
                  const isPublished = blog.status === "published";
                  const rowKey = blog.documentId
                    ? `${blog.documentId}-${idx}`
                    : `blog-${blog.id || idx}`;

                  return (
                    <TableRow
                      key={rowKey}
                      className="hover:bg-surface/40 transition-colors"
                    >
                      {/* Article Title & Excerpt */}
                      <TableCell className="py-3.5 px-4 sm:px-4 align-middle">
                        <div className="font-bold text-foreground text-xs line-clamp-1 max-w-sm">
                          {blog.title}
                        </div>
                        <div className="text-[11px] text-muted line-clamp-1 max-w-sm mt-0.5">
                          {blog.excerpt || "No excerpt summary provided."}
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell className="py-3.5 px-4 sm:px-4 text-center align-middle">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-semibold"
                        >
                          {blog.category?.name || "Engineering"}
                        </Badge>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="py-3.5 px-4 sm:px-4 text-center align-middle">
                        <Badge
                          variant={isPublished ? "highlight" : "secondary"}
                          className="text-[10px] font-bold"
                        >
                          {isPublished ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>

                      {/* Author */}
                      <TableCell className="py-3.5 px-4 sm:px-4 text-center align-middle text-xs text-muted font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-primary/15 text-primary dark:text-highlight inline-flex items-center justify-center font-bold text-[10px]">
                            {(blog.author?.username || "A")[0].toUpperCase()}
                          </span>
                          <span>{blog.author?.username || "Admin Team"}</span>
                        </span>
                      </TableCell>

                      {/* Published Date */}
                      <TableCell className="py-3.5 px-4 sm:px-4 text-center align-middle text-xs text-muted">
                        {blog.publishedAt ? (
                          <span className="font-semibold text-foreground">
                            {new Date(blog.publishedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted italic">
                            Unpublished (Draft)
                          </span>
                        )}
                      </TableCell>

                      {/* Action Buttons */}
                      <TableCell className="py-3.5 px-4 sm:px-4 text-right align-middle">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Article */}
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={isActionLoading}
                            className="text-xs py-1 px-2.5"
                            onClick={() => handleOpenEditBlog(blog)}
                            title="Edit Article"
                          >
                            <HiOutlinePencilSquare className="w-3.5 h-3.5 mr-0.5" />
                            <span>Edit</span>
                          </Button>

                          {/* Delete Article */}
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={isActionLoading}
                            className="text-xs py-1 px-2.5"
                            onClick={() => handleOpenDeleteBlogModal(blog)}
                            title="Delete Article"
                          >
                            <HiOutlineTrash className="w-3.5 h-3.5" />
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
