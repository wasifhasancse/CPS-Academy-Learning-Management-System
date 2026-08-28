"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";

export function BlogModal({
  isOpen,
  onClose,
  isEditing = false,
  blogForm,
  setBlogForm,
  categories = [],
  onSubmit,
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Blog Article" : "Write New Blog Article"}
      description={
        isEditing
          ? "Update technical article content, tags, or publishing status."
          : "Author and publish technical engineering articles to CPS Academy."
      }
      size="lg"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-foreground block mb-1">
            Article Title *
          </label>
          <Input
            required
            placeholder="e.g. Solving Dynamic Programming Problems: Step by Step Guide"
            value={blogForm.title}
            onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Category *
            </label>
            <select
              value={blogForm.category}
              onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground font-semibold focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.documentId || cat.id} value={cat.documentId || String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Status *
            </label>
            <select
              value={blogForm.status}
              onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground font-semibold focus:outline-none"
            >
              <option value="draft">Save as Draft</option>
              <option value="published">Publish Immediately</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-foreground block mb-1">
            Cover Image
          </label>
          <ImageUpload
            value={blogForm.coverImageUrl}
            onChange={(url) => setBlogForm({ ...blogForm, coverImageUrl: url })}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-foreground block mb-1">
            Short Excerpt *
          </label>
          <textarea
            rows={2}
            required
            placeholder="Brief summary of the article..."
            value={blogForm.excerpt}
            onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-foreground block mb-1">
            Article Content (Markdown supported) *
          </label>
          <textarea
            rows={6}
            required
            placeholder="Write full article in Markdown..."
            value={blogForm.content}
            onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none font-mono"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="surface" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {isEditing ? "Save Changes" : "Create Article"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
